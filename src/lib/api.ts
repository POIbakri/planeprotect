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
  const url = new URL(`${API_CONFIG.baseUrl}/functions/v1${endpoint}`);
  
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

// Enhanced flight eligibility check with caching
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
        const response = await makeApiRequest<AviationStackResponse>(
          AVIATION_ENDPOINTS.flights.path,
          {
            flight_iata: flightNumber,
            flight_date: flightDate,
            flight_status: 'landed,cancelled,incident',
          },
          { cache: true, ttl: API_CONFIG.cacheTTL.flightCheck }
        );

        if (!response.data || response.data.length === 0) {
          throw new Error('Flight not found');
        }

        const flight = response.data[0];

        // Calculate route information
        const route = {
          departureCountry: flight.departure.timezone.split('/')[0],
          arrivalCountry: flight.arrival.timezone.split('/')[0],
          airlineCountry: flight.airline.name.split(' ')[0],
        };

        // Calculate distance
        const distance = EligibilityChecker.calculateDistance(
          flight.departure.latitude,
          flight.departure.longitude,
          flight.arrival.latitude,
          flight.arrival.longitude
        );

        // Check for delays
        const scheduledArrival = new Date(flight.arrival.scheduled).getTime();
        const actualArrival = flight.arrival.actual 
          ? new Date(flight.arrival.actual).getTime()
          : new Date(flight.arrival.estimated).getTime();
        
        if (isNaN(scheduledArrival) || isNaN(actualArrival)) {
          throw new Error('Invalid flight times');
        }
        
        const delayMinutes = Math.max(0, Math.floor((actualArrival - scheduledArrival) / (1000 * 60)));
        const delayHours = delayMinutes / 60;

        // Check eligibility
        const disruption: DisruptionDetails = {
          type: flight.flight_status === 'cancelled' ? 'cancellation' as const : 'delay' as const,
          delayDuration: delayHours,
          reason: flight.flight_status === 'incident' ? 'technical_issue' as DisruptionReason : undefined,
        };

        const eligibility = EligibilityChecker.checkEligibility(route, disruption, distance);

        return {
          isEligible: eligibility.isEligible,
          compensation: eligibility.amount,
          reason: eligibility.reason,
          processingTime: '2-3 weeks',
          regulation: eligibility.regulation,
          flightDetails: {
            airline: flight.airline.name,
            flightNumber: flight.flight.iata,
            departure: {
              airport: flight.departure.airport,
              iata: flight.departure.iata,
              terminal: flight.departure.terminal,
              country: route.departureCountry,
            },
            arrival: {
              airport: flight.arrival.airport,
              iata: flight.arrival.iata,
              terminal: flight.arrival.terminal,
              country: route.arrivalCountry,
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