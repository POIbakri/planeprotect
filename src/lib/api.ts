import { createClient } from '@supabase/supabase-js';
import { getErrorMessage } from './utils';
import { cache } from './cache';
import { logger } from './logger';
import { metrics } from './metrics';
import { handleApiError } from './errors';
import { sendEmail } from './email';
import { EligibilityChecker } from './eligibility';
import type { 
  FlightCheckResponse,
  PaginatedResponse,
  Claim,
  ClaimFilters,
  AviationStackResponse,
  AviationStackFlight,
  DisruptionReason,
  DisruptionType,
  DisruptionDetails
} from './types';

// Initialize Supabase client with production configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

// Production Supabase client with enhanced error handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'RefundHero',
      'x-application-version': '1.0.0',
    },
  },
});

// API Configuration
const API_CONFIG = {
  baseUrl: `${supabaseUrl}/functions/v1`,
  retryAttempts: 3,
  timeout: 30000,
  rateLimitWindow: 60000,
  maxCallsPerMinute: 30,
  cacheTTL: {
    flightCheck: 5 * 60 * 1000, // 5 minutes
    claims: 2 * 60 * 1000, // 2 minutes
    claimStatus: 30 * 1000, // 30 seconds
  },
};

// Aviation Stack API endpoints via Edge Functions
const AVIATION_ENDPOINTS = {
  flights: {
    path: '/aviation/flights',
    params: {
      flight_status: ['scheduled', 'active', 'landed', 'cancelled', 'incident'],
      flight_date: 'YYYY-MM-DD',
      flight_iata: 'XX1234',
      dep_iata: 'XXX',
      arr_iata: 'XXX',
      airline_iata: 'XX',
    },
  },
  airlines: {
    path: '/aviation/airlines',
    params: {
      airline_name: 'string',
      iata_code: 'XX',
      icao_code: 'XXX',
    },
  },
  airports: {
    path: '/aviation/airports',
    params: {
      airport_name: 'string',
      iata_code: 'XXX',
      icao_code: 'XXXX',
      country_iso2: 'XX',
    },
  },
};

// Enhanced API request handling with caching and metrics
async function makeApiRequest<T>(
  endpoint: string,
  params: Record<string, string>,
  options: {
    cache?: boolean;
    ttl?: number;
    retries?: number;
  } = {}
): Promise<T> {
  const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;
  const startTime = performance.now();

  try {
    if (options.cache) {
      return await cache.get(cacheKey, () => fetchData<T>(endpoint, params), {
        ttl: options.ttl,
      });
    }

    return await fetchData<T>(endpoint, params);
  } catch (error) {
    handleApiError(error);
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    metrics.histogram('api_request_duration', duration, {
      endpoint,
      cached: String(!!options.cache),
    });
  }
}

async function fetchData<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
  
  // Add all parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    logger.debug('Making API request', { endpoint, params });

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      logger.error('API error', data.error);
      throw new Error(data.error.message || 'API error occurred');
    }

    return data;
  } catch (error) {
    logger.error('API request failed', error as Error, { endpoint });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Enhanced flight eligibility check with mock data
export async function checkFlightEligibility(
  flightNumber: string,
  flightDate: string
): Promise<FlightCheckResponse> {
  const cacheKey = `flight:${flightNumber}:${flightDate}`;

  return cache.get(
    cacheKey,
    async () => {
      logger.debug('Checking flight eligibility', { flightNumber, flightDate });

      if (!flightNumber.match(/^[A-Z]{2}\d{1,4}$/)) {
        throw new Error('Invalid flight number format');
      }
      
      const date = new Date(flightDate);
      const sixYearsAgo = new Date();
      sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date > tomorrow || date < sixYearsAgo) {
        throw new Error('Flight date must be within the last 6 years and not in the future');
      }

      try {
        // Create baseline flight data for UI to display
        // The actual eligibility will be determined by user input in the next step
        const mockFlight = createBasicFlightTemplate(flightNumber, flightDate);
        
        // We don't determine eligibility yet - this happens after user provides disruption details
        return {
          isEligible: false, // Will be updated after user provides disruption information
          compensation: 0, // Will be calculated based on user input
          reason: 'pending_details',
          processingTime: '2-3 weeks',
          regulation: 'EU261', // Default to EU, will be determined based on route later
          flightDetails: {
            airline: mockFlight.airline.name,
            flightNumber: mockFlight.flight.iata,
            departure: {
              airport: mockFlight.departure.airport,
              iata: mockFlight.departure.iata,
              terminal: mockFlight.departure.terminal,
              country: mockFlight.departure.country,
            },
            arrival: {
              airport: mockFlight.arrival.airport,
              iata: mockFlight.arrival.iata,
              terminal: mockFlight.arrival.terminal,
              country: mockFlight.arrival.country,
            },
          },
        };
      } catch (error) {
        logger.error('Flight eligibility check failed', error as Error);
        throw error;
      }
    },
    { ttl: API_CONFIG.cacheTTL.flightCheck }
  );
}

// This will process user-provided disruption information to determine eligibility
export function calculateEligibility(
  flightDetails: {
    departure: { country: string, iata: string, airport: string, terminal?: string },
    arrival: { country: string, iata: string, airport: string, terminal?: string },
    airline: { name: string },
    flightNumber: string
  },
  disruption: DisruptionDetails,
  distance: number
): FlightCheckResponse {
  // Extract airline's country code from first two letters of flight number
  const airlineCode = flightDetails.flightNumber.substring(0, 2);
  
  // Determine airline country based on code
  let airlineCountry = 'EU';
  if (['BA', 'VS', 'BY', 'ZB', 'LS', 'U2', 'EZY'].includes(airlineCode)) {
    airlineCountry = 'GB';
  } else if (['AF', 'UU'].includes(airlineCode)) {
    airlineCountry = 'FR';
  } else if (['LH', 'EW', 'DE'].includes(airlineCode)) {
    airlineCountry = 'DE';
  }
  
  // Setup route information
  const route = {
    departureCountry: flightDetails.departure.country || 'Europe',
    arrivalCountry: flightDetails.arrival.country || 'Europe',
    airlineCountry: airlineCountry,
  };
  
  // Calculate eligibility based on user provided disruption
  const eligibility = EligibilityChecker.checkEligibility(route, disruption, distance);

  return {
    isEligible: eligibility.isEligible,
    compensation: eligibility.amount,
    reason: eligibility.reason,
    processingTime: '2-3 weeks',
    regulation: eligibility.regulation,
    flightDetails: {
      airline: flightDetails.airline.name,
      flightNumber: flightDetails.flightNumber,
      departure: {
        airport: flightDetails.departure.airport,
        iata: flightDetails.departure.iata,
        terminal: flightDetails.departure.terminal,
        country: flightDetails.departure.country,
      },
      arrival: {
        airport: flightDetails.arrival.airport,
        iata: flightDetails.arrival.iata,
        terminal: flightDetails.arrival.terminal,
        country: flightDetails.arrival.country,
      },
    },
  };
}

// Create basic flight template with the minimum info needed
function createBasicFlightTemplate(flightNumber: string, flightDate: string) {
  // Parse flight carrier and number
  const carrier = flightNumber.substring(0, 2);
  
  // Determine airline details based on carrier code
  let airlineName = 'Unknown Airline';
  let departureAirport = 'London Heathrow';
  let departureIata = 'LHR';
  let departureCountry = 'UK';
  let arrivalAirport = 'Paris Charles de Gaulle';
  let arrivalIata = 'CDG';
  let arrivalCountry = 'France';
  
  // Common airlines
  if (carrier === 'BA') {
    airlineName = 'British Airways';
    departureAirport = 'London Heathrow';
    departureIata = 'LHR';
    departureCountry = 'UK';
  } else if (carrier === 'AF') {
    airlineName = 'Air France';
    departureAirport = 'Paris Charles de Gaulle';
    departureIata = 'CDG';
    departureCountry = 'France';
  } else if (carrier === 'LH') {
    airlineName = 'Lufthansa';
    departureAirport = 'Frankfurt Airport';
    departureIata = 'FRA';
    departureCountry = 'Germany';
  } else if (carrier === 'EK') {
    airlineName = 'Emirates';
    departureAirport = 'Dubai International';
    departureIata = 'DXB';
    departureCountry = 'UAE';
  }
  
  return {
    flight_date: flightDate,
    airline: {
      name: airlineName,
      iata: carrier,
    },
    departure: {
      airport: departureAirport,
      iata: departureIata,
      terminal: 'T2',
      country: departureCountry,
    },
    arrival: {
      airport: arrivalAirport,
      iata: arrivalIata,
      terminal: 'T1',
      country: arrivalCountry,
    },
    flight: {
      number: flightNumber.substring(2),
      iata: flightNumber,
    }
  };
}

// Autocomplete for airlines using AviationStack API
export async function searchAirlines(query: string): Promise<any[]> {
  if (!query || query.length < 2) return [];
  
  // For mock purposes, return a list of common airlines
  const airlines = [
    { name: 'British Airways', iata: 'BA', icao: 'BAW', country_iso2: 'GB' },
    { name: 'Air France', iata: 'AF', icao: 'AFR', country_iso2: 'FR' },
    { name: 'Lufthansa', iata: 'LH', icao: 'DLH', country_iso2: 'DE' },
    { name: 'Emirates', iata: 'EK', icao: 'UAE', country_iso2: 'AE' },
    { name: 'Qatar Airways', iata: 'QR', icao: 'QTR', country_iso2: 'QA' },
    { name: 'American Airlines', iata: 'AA', icao: 'AAL', country_iso2: 'US' },
    { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL', country_iso2: 'US' },
    { name: 'United Airlines', iata: 'UA', icao: 'UAL', country_iso2: 'US' },
    { name: 'KLM Royal Dutch Airlines', iata: 'KL', icao: 'KLM', country_iso2: 'NL' },
    { name: 'Etihad Airways', iata: 'EY', icao: 'ETD', country_iso2: 'AE' },
  ];
  
  const filteredAirlines = airlines.filter(
    airline => 
      airline.name.toLowerCase().includes(query.toLowerCase()) || 
      airline.iata.toLowerCase().includes(query.toLowerCase())
  );
  
  return filteredAirlines;
}

// Autocomplete for airports using AviationStack API
export async function searchAirports(query: string): Promise<any[]> {
  if (!query || query.length < 2) return [];
  
  // For mock purposes, return a list of common airports
  const airports = [
    { name: 'London Heathrow', iata: 'LHR', city: 'London', country: 'UK' },
    { name: 'London Gatwick', iata: 'LGW', city: 'London', country: 'UK' },
    { name: 'Manchester Airport', iata: 'MAN', city: 'Manchester', country: 'UK' },
    { name: 'Edinburgh Airport', iata: 'EDI', city: 'Edinburgh', country: 'UK' },
    { name: 'Paris Charles de Gaulle', iata: 'CDG', city: 'Paris', country: 'France' },
    { name: 'Paris Orly', iata: 'ORY', city: 'Paris', country: 'France' },
    { name: 'Amsterdam Schiphol', iata: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
    { name: 'Frankfurt Airport', iata: 'FRA', city: 'Frankfurt', country: 'Germany' },
    { name: 'Munich Airport', iata: 'MUC', city: 'Munich', country: 'Germany' },
    { name: 'Madrid Barajas', iata: 'MAD', city: 'Madrid', country: 'Spain' },
    { name: 'Barcelona El Prat', iata: 'BCN', city: 'Barcelona', country: 'Spain' },
    { name: 'Rome Fiumicino', iata: 'FCO', city: 'Rome', country: 'Italy' },
    { name: 'Milan Malpensa', iata: 'MXP', city: 'Milan', country: 'Italy' },
    { name: 'Athens International', iata: 'ATH', city: 'Athens', country: 'Greece' },
    { name: 'Istanbul Airport', iata: 'IST', city: 'Istanbul', country: 'Turkey' },
    { name: 'Dubai International', iata: 'DXB', city: 'Dubai', country: 'UAE' },
    { name: 'New York JFK', iata: 'JFK', city: 'New York', country: 'USA' },
    { name: 'Los Angeles International', iata: 'LAX', city: 'Los Angeles', country: 'USA' },
    { name: 'Tokyo Narita', iata: 'NRT', city: 'Tokyo', country: 'Japan' },
    { name: 'Singapore Changi', iata: 'SIN', city: 'Singapore', country: 'Singapore' },
    { name: 'Sydney Kingsford Smith', iata: 'SYD', city: 'Sydney', country: 'Australia' },
  ];
  
  const filteredAirports = airports.filter(
    airport => 
      airport.name.toLowerCase().includes(query.toLowerCase()) || 
      airport.iata.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase())
  );
  
  return filteredAirports;
}

export async function getUserClaims(page = 1, limit = 10): Promise<PaginatedResponse<Claim>> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Authentication required');

  const cacheKey = `claims:user:${user.id}:${page}:${limit}`;

  return cache.get(
    cacheKey,
    async () => {
      const { data, error, count } = await supabase
        .from('claims')
        .select('*, claim_documents(*)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return { data, count: count ?? 0, page, limit };
    },
    { ttl: API_CONFIG.cacheTTL.claims }
  );
}

export async function getClaimStatus(claimId: string): Promise<Claim> {
  const cacheKey = `claim:${claimId}`;

  return cache.get(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*, claim_documents(*)')
        .eq('id', claimId)
        .single();

      if (error) throw error;
      return data;
    },
    { ttl: API_CONFIG.cacheTTL.claimStatus }
  );
}

export function invalidateUserClaims(userId: string): void {
  const cachePattern = `claims:user:${userId}`;
  cache.invalidate(cachePattern);
}

export function invalidateClaimStatus(claimId: string): void {
  cache.invalidate(`claim:${claimId}`);
}

export async function submitClaim(claimData: any) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('claims')
      .insert([
        {
          flight_number: claimData.flightNumber,
          flight_date: claimData.flightDate,
          passenger_name: claimData.fullName,
          email: claimData.email,
          phone: claimData.phone,
          passport_number: claimData.passportNumber,
          compensation_amount: claimData.compensationAmount,
          status: 'pending',
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await sendEmail({
      to: claimData.email,
      name: claimData.fullName,
      template: 'claim_submitted',
      data: {
        claimId: data.id,
        flightNumber: data.flight_number,
        flightDate: data.flight_date,
        compensation: data.compensation_amount,
      },
    });

    return data;
  } catch (error) {
    console.error('Claim submission failed:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function uploadDocument(
  claimId: string,
  file: File,
  type: 'boarding_pass' | 'booking_confirmation' | 'passport'
) {
  try {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${claimId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('claim-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: documentData, error: documentError } = await supabase
      .from('claim_documents')
      .insert([
        {
          claim_id: claimId,
          type,
          file_path: fileName,
        },
      ])
      .select()
      .single();

    if (documentError) throw documentError;
    return documentData;
  } catch (error) {
    console.error('Document upload failed:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getAllClaims(
  page = 1,
  limit = 10,
  filters: ClaimFilters = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      throw new Error('Unauthorized access');
    }

    let query = supabase
      .from('claims')
      .select(`
        *,
        claim_documents (
          id,
          type,
          file_path,
          uploaded_at
        )
      `, { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`
        flight_number.ilike.%${filters.search}%,
        passenger_name.ilike.%${filters.search}%,
        email.ilike.%${filters.search}%
      `);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { data, count, page, limit };
  } catch (error) {
    console.error('Failed to fetch all claims:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function updateClaimStatus(claimId: string, status: string) {
  try {
    const validStatuses = ['pending', 'in-review', 'approved', 'paid'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (claimError) throw claimError;

    const { error } = await supabase
      .from('claims')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (error) throw error;

    await sendEmail({
      to: claim.email,
      name: claim.passenger_name,
      template: `claim_${status}` as any,
      data: {
        claimId: claim.id,
        flightNumber: claim.flight_number,
        flightDate: claim.flight_date,
        compensation: claim.compensation_amount,
      },
    });
  } catch (error) {
    console.error('Failed to update claim status:', error);
    throw new Error(getErrorMessage(error));
  }
}