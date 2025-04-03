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
  DisruptionDetails,
  Airport,
  Airline,
  FlightData,
  CompensationResult,
  FlightRoute
} from './types';

// Flight distances in kilometers for common routes
const flightDistances: Record<string, number> = {
  // UK Routes
  'LHRJFK': 5556, // London Heathrow to New York JFK
  'LHRDXB': 5500, // London Heathrow to Dubai
  'LHRCDG': 344,  // London Heathrow to Paris Charles de Gaulle
  'LHRFRA': 650,  // London Heathrow to Frankfurt
  'LHRAMS': 357,  // London Heathrow to Amsterdam
  'LHRMAD': 1260, // London Heathrow to Madrid
  'LHRFCO': 1430, // London Heathrow to Rome
  'LHRDUB': 464,  // London Heathrow to Dublin
  'LHRATH': 2458, // London to Athens
  'LHRIST': 2550, // London to Istanbul
  'LHRLAX': 8780, // London to Los Angeles
  'LHRSFO': 8640, // London to San Francisco
  'LHRSYD': 16991, // London to Sydney
  'LHRHKG': 9648, // London to Hong Kong
  'LHRSEA': 4784, // London to Seattle
  'LHRSIN': 10885, // London to Singapore
  'LHRBKK': 9578, // London to Bangkok
  'LHRGVA': 754, // London to Geneva
  'LHRZRH': 789, // London to Zurich
  'LHRLIS': 1639, // London to Lisbon
  'LHRBCN': 1137, // London to Barcelona
  'LHRMLA': 2105, // London to Malta
  'LHRPRG': 1044, // London to Prague
  'LHRCPH': 955, // London to Copenhagen
  'LHRSVO': 1794, // London to Moscow
  'LHRWAW': 1451, // London to Warsaw
  'LHRKRK': 1557, // London to Krakow
  'LHRBUD': 1458, // London to Budapest
  'LHRHEL': 1822, // London to Helsinki
  'LHRARN': 1440, // London to Stockholm
  'LHRTLV': 3574, // London to Tel Aviv
  'LHRCAI': 3530, // London to Cairo
  'LHRRIX': 1649, // London to Riga
  'LHREVN': 3719, // London to Yerevan
  'LHRGYD': 5400, // London to Baku
  'LHRTBS': 3224, // London to Tbilisi
  
  // Paris Routes
  'CDGJFK': 5830, // Paris to New York
  'CDGDXB': 5200, // Paris to Dubai
  'CDGFRA': 450,  // Paris to Frankfurt
  'CDGAMS': 430,  // Paris to Amsterdam
  'CDGMAD': 1050, // Paris to Madrid
  'CDGFCO': 1100, // Paris to Rome
  'CDGDUB': 780,  // Paris to Dublin
  'CDGLHR': 344,  // Paris to London
  'CDGIST': 2229, // Paris to Istanbul
  'CDGLAX': 9124, // Paris to Los Angeles
  'CDGBCN': 831,  // Paris to Barcelona
  'CDGATH': 2101, // Paris to Athens
  'CDGLIS': 1452, // Paris to Lisbon
  'CDGHKG': 9614, // Paris to Hong Kong
  'CDGMIA': 7552, // Paris to Miami
  
  // German Routes
  'FRAJFK': 6200, // Frankfurt to New York
  'FRADXB': 4800, // Frankfurt to Dubai
  'FRAAMS': 350,  // Frankfurt to Amsterdam
  'FRAMAD': 1800, // Frankfurt to Madrid
  'FRAFCO': 1000, // Frankfurt to Rome
  'FRADUB': 1050, // Frankfurt to Dublin
  'FRALHR': 650,  // Frankfurt to London
  'FRACDG': 450,  // Frankfurt to Paris
  'FRAIST': 1867, // Frankfurt to Istanbul
  'FRASIA': 9374, // Frankfurt to Singapore
  'FRACAI': 2896, // Frankfurt to Cairo
  'FRAHKG': 9230, // Frankfurt to Hong Kong
  'FRAPEK': 7785, // Frankfurt to Beijing
  'FRASFO': 9136, // Frankfurt to San Francisco
  'FRANZL': 9974, // Frankfurt to Auckland
  
  // Madrid Routes
  'MADLHR': 1260, // Madrid to London
  'MADCDG': 1050, // Madrid to Paris
  'MADFRA': 1800, // Madrid to Frankfurt
  'MADJFK': 5754, // Madrid to New York
  'MADBOG': 8048, // Madrid to Bogota
  'MADLIS': 501,  // Madrid to Lisbon
  'MADFCO': 1364, // Madrid to Rome
  'MADAMS': 1460, // Madrid to Amsterdam
  'MADGRU': 8369, // Madrid to Sao Paulo
  'MADEZX': 2612, // Madrid to Buenos Aires
  'MADMIA': 7106, // Madrid to Miami
  'MADDXB': 5839, // Madrid to Dubai
  
  // Rome Routes
  'FCOLHR': 1430, // Rome to London
  'FCOCDG': 1100, // Rome to Paris
  'FCOFRA': 1000, // Rome to Frankfurt
  'FCOMAD': 1364, // Rome to Madrid
  'FCOJFK': 6902, // Rome to New York
  'FCOATH': 1052, // Rome to Athens
  'FCOIST': 1369, // Rome to Istanbul
  'FCOBEY': 2229, // Rome to Beirut
  'FCOTEL': 2273, // Rome to Tel Aviv
  'FCOCAI': 2065, // Rome to Cairo
  
  // Amsterdam Routes
  'AMSLHR': 357,  // Amsterdam to London
  'AMSCDG': 430,  // Amsterdam to Paris
  'AMSFRA': 350,  // Amsterdam to Frankfurt
  'AMSMAD': 1460, // Amsterdam to Madrid
  'AMSFCO': 1300, // Amsterdam to Rome
  'AMSDUB': 750,  // Amsterdam to Dublin
  'AMSJFK': 5878, // Amsterdam to New York
  'AMSATL': 7102, // Amsterdam to Atlanta
  'AMSYYZ': 5873, // Amsterdam to Toronto
  'AMSKUL': 8008, // Amsterdam to Kuala Lumpur
  'AMSGRU': 9780, // Amsterdam to Sao Paulo
  'AMSNBO': 6555, // Amsterdam to Nairobi
  'AMSCPT': 9336, // Amsterdam to Cape Town
  
  // Dublin Routes
  'DUBLHR': 464,  // Dublin to London
  'DUBCDG': 780,  // Dublin to Paris
  'DUBFRA': 1050, // Dublin to Frankfurt
  'DUBMAD': 1450, // Dublin to Madrid
  'DUBAMS': 750,  // Dublin to Amsterdam
  'DUBJFK': 5127, // Dublin to New York
  'DUBBOS': 4814, // Dublin to Boston
  'DUBORD': 5835, // Dublin to Chicago
  'DUBPHL': 5203, // Dublin to Philadelphia
  'DUBMCO': 6312, // Dublin to Orlando
  'DUBLAX': 8351, // Dublin to Los Angeles
  'DUBSFO': 8207, // Dublin to San Francisco
  'DUBYWG': 5129  // Dublin to Winnipeg
};

// Fallback distance calculation using Haversine formula and airport coordinates
const airportCoordinates: Record<string, [number, number]> = {
  // Major airports [latitude, longitude]
  'LHR': [51.4700, -0.4543],   // London Heathrow
  'CDG': [49.0097, 2.5479],    // Paris Charles de Gaulle
  'FRA': [50.0379, 8.5622],    // Frankfurt
  'MAD': [40.4983, -3.5676],   // Madrid
  'FCO': [41.8003, 12.2389],   // Rome Fiumicino
  'AMS': [52.3105, 4.7683],    // Amsterdam Schiphol
  'DUB': [53.4264, -6.2499],   // Dublin
  'JFK': [40.6413, -73.7781],  // New York JFK
  'LAX': [33.9416, -118.4085], // Los Angeles
  'DXB': [25.2528, 55.3644],   // Dubai
  'SIN': [1.3644, 103.9915],   // Singapore
  'HKG': [22.3080, 113.9185],  // Hong Kong
  'SYD': [-33.9399, 151.1753], // Sydney
  'NRT': [35.7720, 140.3929],  // Tokyo Narita
  'GRU': [-23.4356, -46.4731], // Sao Paulo
  'IST': [41.2608, 28.7444],   // Istanbul
  'ATH': [37.9364, 23.9445],   // Athens
  'CPH': [55.6180, 12.6508],   // Copenhagen
  'ARN': [59.6498, 17.9237],   // Stockholm
  'OSL': [60.1976, 11.0384],   // Oslo
  'HEL': [60.3183, 24.9497],   // Helsinki
  'PRG': [50.1008, 14.2600],   // Prague
  'VIE': [48.1102, 16.5697],   // Vienna
  'WAW': [52.1672, 20.9679],   // Warsaw
  'BUD': [47.4298, 19.2611],   // Budapest
  'ZRH': [47.4647, 8.5492],    // Zurich
  'GVA': [46.2380, 6.1089],    // Geneva
  'BCN': [41.2974, 2.0833],    // Barcelona
  'LIS': [38.7742, -9.1342],   // Lisbon
  'MUC': [48.3537, 11.7860],   // Munich
  'BRU': [50.9014, 4.4844],    // Brussels
  'MAN': [53.3537, -2.2750],   // Manchester
  'EDI': [55.9500, -3.3725],   // Edinburgh
  'TLV': [32.0055, 34.8854],   // Tel Aviv
  'CAI': [30.1219, 31.4056],   // Cairo
  'DOH': [25.2609, 51.6138],   // Doha
  'AUH': [24.4330, 54.6511],   // Abu Dhabi
  'RUH': [24.9578, 46.6989],   // Riyadh
  'YYZ': [43.6772, -79.6306],  // Toronto
  'YVR': [49.1967, -123.1815], // Vancouver
  'MEX': [19.4363, -99.0721],  // Mexico City
  'GIG': [-22.8092, -43.2506], // Rio de Janeiro
  'EZE': [-34.8222, -58.5358], // Buenos Aires
  'JNB': [-26.1367, 28.2411],  // Johannesburg
  'CPT': [-33.9689, 18.6017],  // Cape Town
  'NBO': [-1.3192, 36.9280],   // Nairobi
  'PEK': [40.0799, 116.6031],  // Beijing
  'PVG': [31.1443, 121.8083],  // Shanghai
  'ICN': [37.4602, 126.4407],  // Seoul
  'BKK': [13.6900, 100.7501],  // Bangkok
  'KUL': [2.7456, 101.7099],   // Kuala Lumpur
  'SVO': [55.9736, 37.4125],   // Moscow
  'LED': [59.8003, 30.2625],   // St. Petersburg
  'DEL': [28.5562, 77.1000],   // Delhi
  'BOM': [19.0896, 72.8656]    // Mumbai
};

/**
 * Calculate distance between two airports using Haversine formula
 * @param departure Departure airport IATA code
 * @param arrival Arrival airport IATA code
 * @returns Distance in kilometers or undefined if coordinates not found
 */
export function calculateDistance(departure: string, arrival: string): number | undefined {
  // First check if we have this route in our predefined distances
  const routeKey = `${departure}${arrival}`;
  if (flightDistances[routeKey]) {
    return flightDistances[routeKey];
  }
  
  // Otherwise calculate using coordinates if available
  const depCoords = airportCoordinates[departure];
  const arrCoords = airportCoordinates[arrival];
  
  if (!depCoords || !arrCoords) {
    // Return a default value if coordinates not found
    return 1500; // A reasonable medium-distance default
  }
  
  // Haversine formula calculation
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(arrCoords[0] - depCoords[0]);
  const dLon = toRad(arrCoords[1] - depCoords[1]);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(depCoords[0])) * Math.cos(toRad(arrCoords[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c); // Round to nearest kilometer
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

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

// Comprehensive airline code mapping for country detection
const AIRLINE_COUNTRY_MAP: Record<string, string> = {
  // UK Airlines
  'BA': 'GB', 'VS': 'GB', 'BY': 'GB', 'ZB': 'GB', 'LS': 'GB', 'U2': 'GB', 'EZY': 'GB',
  'MT': 'GB', 'BE': 'GB', 'TOM': 'GB', 'TC': 'GB', 'ZE': 'GB', 'EXS': 'GB', 'VIR': 'GB',
  'T3': 'GB', 'LM': 'GB', 'SI': 'GB', 'GR': 'GB', 'W9': 'GB',
  
  // French Airlines
  'AF': 'FR', 'UU': 'FR', 'A5': 'FR', 'SS': 'FR', 'XK': 'FR', 'TO': 'FR',
  'BF': 'FR', 'TX': 'FR', 'ZI': 'FR', '5O': 'FR',
  
  // German Airlines
  'LH': 'DE', 'EW': 'DE', 'DE': 'DE', 'XQ': 'DE', '4U': 'DE', 'AB': 'DE',
  'ST': 'DE', 'HF': 'DE', 'EN': 'DE', 'X3': 'DE',
  
  // Spanish Airlines
  'IB': 'ES', 'I2': 'ES', 'VY': 'ES', 'UX': 'ES', 'NT': 'ES', 'EC': 'ES',
  'YW': 'ES', 'V7': 'ES', 'PM': 'ES', 'EB': 'ES',
  
  // Italian Airlines
  'AZ': 'IT', 'IG': 'IT', 'NO': 'IT', 'BV': 'IT', 'VE': 'IT',
  
  // Dutch Airlines
  'KL': 'NL', 'HV': 'NL', 'WA': 'NL', 'OR': 'NL', 'CD': 'NL',
  
  // Swiss Airlines (part of EEA air transport agreement despite not being EU)
  'LX': 'CH', '2L': 'CH', 'GM': 'CH', 'WK': 'CH',
  
  // Austrian Airlines
  'OS': 'AT', 'VO': 'AT', 'BR': 'AT', 'PE': 'AT', 'HG': 'AT', 'E2': 'AT',
  
  // Belgian Airlines
  'SN': 'BE', 'TB': 'BE', 'TV': 'BE', 'JAF': 'BE', 'KF': 'BE',
  
  // Other EU Airlines - Portugal, Luxembourg, etc.
  'TP': 'PT', 'S4': 'PT', 'SP': 'PT', 'NI': 'PT', 'WH': 'PT',
  'LG': 'LU', // Luxair
  
  // Nordic Airlines
  'SK': 'SE', 'DY': 'NO', 'D8': 'NO', 'DX': 'DK', 'RC': 'FO', 'FI': 'IS',
  'WF': 'NO', 'N0': 'NO', 'AY': 'FI', 'FC': 'FI',
  
  // Irish Airlines
  'FR': 'IE', 'EI': 'IE', 'RE': 'IE', 'WX': 'IE', 'AG': 'IE',
  
  // Eastern European Airlines
  'LO': 'PL', 'OK': 'CZ', 'QS': 'CZ', 'W6': 'HU', 'RO': 'RO', 'FB': 'BG',
  'BT': 'LV', 'OU': 'HR', 'JP': 'SI', '0B': 'SK', 'OV': 'EE', 'B2': 'BY',
  'JU': 'RS', '6Y': 'EE',
  
  // Greek Airlines
  'A3': 'GR', 'OA': 'GR', 'GQ': 'GR'
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

/**
 * Validates flight data for completeness and correctness
 * @param flightData The flight data to validate
 * @returns Validation result with errors if any
 */
function validateFlightData(flightData: FlightData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required fields
  if (!flightData.flightNumber || flightData.flightNumber.trim() === '') {
    errors.push('Flight number is required');
  } else if (!/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(flightData.flightNumber)) {
    errors.push('Invalid flight number format (e.g. BA123, LH1234)');
  }
  
  if (!flightData.flightDate || flightData.flightDate.trim() === '') {
    errors.push('Flight date is required');
  } else {
    // Validate date format and ensure it's not in the future
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(flightData.flightDate)) {
      errors.push('Invalid date format (YYYY-MM-DD)');
    } else {
      const flightDate = new Date(flightData.flightDate);
      const today = new Date();
      
      if (isNaN(flightDate.getTime())) {
        errors.push('Invalid date');
      } else if (flightDate > today) {
        errors.push('Flight date cannot be in the future');
      }
    }
  }
  
  // Check airport data
  if (!flightData.departure.iata || flightData.departure.iata.trim() === '') {
    errors.push('Departure airport code is required');
  } else if (!/^[A-Z]{3}$/.test(flightData.departure.iata)) {
    errors.push('Invalid departure airport code (should be 3-letter IATA code)');
  }
  
  if (!flightData.arrival.iata || flightData.arrival.iata.trim() === '') {
    errors.push('Arrival airport code is required');
  } else if (!/^[A-Z]{3}$/.test(flightData.arrival.iata)) {
    errors.push('Invalid arrival airport code (should be 3-letter IATA code)');
  }
  
  // Check country data
  if (!flightData.departure.country || flightData.departure.country.trim() === '') {
    errors.push('Departure country is required');
  }
  
  if (!flightData.arrival.country || flightData.arrival.country.trim() === '') {
    errors.push('Arrival country is required');
  }
  
  // Validate disruption data
  if (!flightData.disruption || !flightData.disruption.type) {
    errors.push('Disruption type is required');
  } else if (!['delay', 'cancellation', 'denied_boarding'].includes(flightData.disruption.type)) {
    errors.push('Invalid disruption type');
  }
  
  // For delays, validate delay duration
  if (flightData.disruption && flightData.disruption.type === 'delay' && 
      (flightData.disruption.delayDuration === undefined || flightData.disruption.delayDuration < 0)) {
    errors.push('Delay duration is required and must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function checkFlightEligibility(flightData: FlightData): Promise<CompensationResult> {
  try {
    // Validate the input data
    const validation = validateFlightData(flightData);
    if (!validation.isValid) {
      throw new Error(`Invalid flight data: ${validation.errors.join(', ')}`);
    }
    
    // Create a basic flight template
    const flightRoute: FlightRoute = {
      flight_date: flightData.flightDate,
      airline: flightData.airline,
      departure: {
        ...flightData.departure,
        terminal: flightData.departure.terminal || 'Unknown'
      },
      arrival: {
        ...flightData.arrival,
        terminal: flightData.arrival.terminal || 'Unknown'
      },
      flight: {
        iata: flightData.flightNumber,
        number: flightData.flightNumber.substring(2),
        status: 'scheduled'
      },
      departureCountry: flightData.departure.country,
      arrivalCountry: flightData.arrival.country,
      airlineCountry: flightData.airline.country || 'Unknown'
    };

    // Get route key from IATA codes
    const routeKey = `${flightData.departure.iata}${flightData.arrival.iata}`;
    
    // Get distance from our database or calculate it
    const distance = flightDistances[routeKey] || 
                     calculateDistance(flightData.departure.iata, flightData.arrival.iata) || 
                     1500; // Default to 1500km if all else fails

    // Pass to eligibility checker
    const result = EligibilityChecker.checkEligibility(
      {
        departureCountry: flightData.departure.country,
        arrivalCountry: flightData.arrival.country,
        airlineCountry: flightData.airline.country || 'Unknown'
      }, 
      flightData.disruption,
      distance
    );
    
    console.log(`Eligibility check for ${flightData.flightNumber}: ${result.isEligible ? 'Eligible' : 'Not eligible'} (${result.regulation})`);
    
    return result;
  } catch (error) {
    console.error('Error checking eligibility:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to check flight eligibility: ${error.message}`);
    }
    throw new Error('Failed to check flight eligibility: Unknown error');
  }
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
  
  // Determine airline country based on code using the mapping
  let airlineCountry = AIRLINE_COUNTRY_MAP[airlineCode] || 'EU';
  
  // Setup route information
  const route = {
    departureCountry: flightDetails.departure.country || 'Europe',
    arrivalCountry: flightDetails.arrival.country || 'Europe',
    airlineCountry: airlineCountry,
  };
  
  // Calculate eligibility based on user provided disruption
  const eligibility = EligibilityChecker.checkEligibility(route, disruption, distance);

  // Return FlightCheckResponse with both amount and compensation properties
  return {
    ...eligibility,
    compensation: eligibility.amount,
    processingTime: '2-3 weeks',
    flightDetails: {
      airline: flightDetails.airline.name,
      flightNumber: flightDetails.flightNumber,
      departure: {
        airport: flightDetails.departure.airport,
        iata: flightDetails.departure.iata,
        terminal: flightDetails.departure.terminal || '',
        country: flightDetails.departure.country,
      },
      arrival: {
        airport: flightDetails.arrival.airport,
        iata: flightDetails.arrival.iata,
        terminal: flightDetails.arrival.terminal || '',
        country: flightDetails.arrival.country,
      },
    },
  };
}

// Create basic flight template with the minimum info needed
function createBasicFlightTemplate(flightNumber: string, flightDate: string): FlightRoute {
  // Extract airline code from flight number
  const airlineCode = flightNumber.substring(0, 2);
  
  // Get airline info from our mock data
  const mockAirlines = [
    { name: 'British Airways', iata: 'BA', icao: 'BAW', country: 'United Kingdom' },
    { name: 'Lufthansa', iata: 'LH', icao: 'DLH', country: 'Germany' },
    { name: 'Air France', iata: 'AF', icao: 'AFR', country: 'France' },
    { name: 'KLM', iata: 'KL', icao: 'KLM', country: 'Netherlands' },
    { name: 'Emirates', iata: 'EK', icao: 'UAE', country: 'UAE' }
  ];

  const airline = mockAirlines.find((a: Airline) => a.iata === airlineCode) || {
    name: 'Unknown Airline',
    iata: airlineCode,
    country: 'Unknown'
  };

  // Get departure and arrival airports from our mock data
  const mockAirports = [
    { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
    { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
    { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
    { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' }
  ];

  const departureAirport = mockAirports.find((a: Airport) => a.iata === 'LHR') || {
    iata: 'LHR',
    name: 'London Heathrow',
    city: 'London',
    country: 'United Kingdom'
  };

  const arrivalAirport = mockAirports.find((a: Airport) => a.iata === 'CDG') || {
    iata: 'CDG',
    name: 'Paris Charles de Gaulle',
    city: 'Paris',
    country: 'France'
  };

  // Create a basic flight template with all required properties
  return {
    flight_date: flightDate,
    airline: {
      name: airline.name,
      iata: airline.iata,
      country: airline.country
    },
    departure: {
      airport: departureAirport.name,
      iata: departureAirport.iata,
      terminal: 'T2',
      country: departureAirport.country
    },
    arrival: {
      airport: arrivalAirport.name,
      iata: arrivalAirport.iata,
      terminal: 'T1',
      country: arrivalAirport.country
    },
    flight: {
      iata: flightNumber,
      number: flightNumber.substring(2),
      status: 'scheduled'
    },
    departureCountry: departureAirport.country,
    arrivalCountry: arrivalAirport.country,
    airlineCountry: airline.country
  };
}

// Autocomplete for airlines using AviationStack API
export async function searchAirlines(query: string): Promise<Airline[]> {
  try {
    // Input validation
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    if (query.length < 2) {
      return [];
    }
    
    // Comprehensive airline data
    const airlines = [
      // UK Airlines
      { name: 'British Airways', iata: 'BA', icao: 'BAW', country: 'United Kingdom' },
      { name: 'Virgin Atlantic', iata: 'VS', icao: 'VIR', country: 'United Kingdom' },
      { name: 'EasyJet', iata: 'U2', icao: 'EZY', country: 'United Kingdom' },
      { name: 'Jet2', iata: 'LS', icao: 'EXS', country: 'United Kingdom' },
      { name: 'TUI Airways', iata: 'BY', icao: 'TOM', country: 'United Kingdom' },
      { name: 'Flybe', iata: 'BE', icao: 'BEE', country: 'United Kingdom' },
      { name: 'Thomas Cook Airlines', iata: 'MT', icao: 'TCX', country: 'United Kingdom' },
      { name: 'Eastern Airways', iata: 'T3', icao: 'EZE', country: 'United Kingdom' },
      { name: 'LoganAir', iata: 'LM', icao: 'LOG', country: 'United Kingdom' },
      { name: 'Blue Islands', iata: 'SI', icao: 'BCI', country: 'United Kingdom' },
      { name: 'Aurigny Air Services', iata: 'GR', icao: 'AUR', country: 'United Kingdom' },
      { name: 'Wizz Air UK', iata: 'W9', icao: 'WUK', country: 'United Kingdom' },
      
      // French Airlines
      { name: 'Air France', iata: 'AF', icao: 'AFR', country: 'France' },
      { name: 'Transavia France', iata: 'TO', icao: 'TVF', country: 'France' },
      { name: 'French Bee', iata: 'BF', icao: 'FBU', country: 'France' },
      { name: 'Air Austral', iata: 'UU', icao: 'REU', country: 'France' },
      { name: 'Corsair International', iata: 'SS', icao: 'CRL', country: 'France' },
      { name: 'Air Corsica', iata: 'XK', icao: 'CCM', country: 'France' },
      { name: 'Air Caraibes', iata: 'TX', icao: 'FWI', country: 'France' },
      { name: 'Aigle Azur', iata: 'ZI', icao: 'AAF', country: 'France' },
      { name: 'ASL Airlines France', iata: '5O', icao: 'FPO', country: 'France' },
      { name: 'HOP!', iata: 'A5', icao: 'HOP', country: 'France' },
      
      // German Airlines
      { name: 'Lufthansa', iata: 'LH', icao: 'DLH', country: 'Germany' },
      { name: 'Eurowings', iata: 'EW', icao: 'EWG', country: 'Germany' },
      { name: 'Condor', iata: 'DE', icao: 'CFG', country: 'Germany' },
      { name: 'TUIfly', iata: 'X3', icao: 'TUI', country: 'Germany' },
      { name: 'Germanwings', iata: '4U', icao: 'GWI', country: 'Germany' },
      { name: 'SunExpress Deutschland', iata: 'XQ', icao: 'SXD', country: 'Germany' },
      { name: 'Germania', iata: 'ST', icao: 'GMI', country: 'Germany' },
      { name: 'Hahn Air', iata: 'HR', icao: 'HHN', country: 'Germany' },
      { name: 'Air Berlin', iata: 'AB', icao: 'BER', country: 'Germany' },
      
      // Spanish Airlines
      { name: 'Iberia', iata: 'IB', icao: 'IBE', country: 'Spain' },
      { name: 'Vueling Airlines', iata: 'VY', icao: 'VLG', country: 'Spain' },
      { name: 'Air Europa', iata: 'UX', icao: 'AEA', country: 'Spain' },
      { name: 'Iberia Express', iata: 'I2', icao: 'IBS', country: 'Spain' },
      { name: 'Binter Canarias', iata: 'NT', icao: 'BIC', country: 'Spain' },
      { name: 'Air Nostrum', iata: 'YW', icao: 'ANE', country: 'Spain' },
      { name: 'Volotea', iata: 'V7', icao: 'VOE', country: 'Spain' },
      { name: 'CanaryFly', iata: 'PM', icao: 'CNF', country: 'Spain' },
      { name: 'Wamos Air', iata: 'EB', icao: 'PLM', country: 'Spain' },
      
      // Italian Airlines
      { name: 'ITA Airways', iata: 'AZ', icao: 'ITY', country: 'Italy' }, // New Alitalia
      { name: 'Air Italy', iata: 'IG', icao: 'ISS', country: 'Italy' },
      { name: 'Neos', iata: 'NO', icao: 'NOS', country: 'Italy' },
      { name: 'Blue Panorama Airlines', iata: 'BV', icao: 'BPA', country: 'Italy' },
      { name: 'Air Dolomiti', iata: 'EN', icao: 'DLA', country: 'Italy' },
      
      // Dutch Airlines
      { name: 'KLM', iata: 'KL', icao: 'KLM', country: 'Netherlands' },
      { name: 'Transavia', iata: 'HV', icao: 'TRA', country: 'Netherlands' },
      { name: 'Corendon Dutch Airlines', iata: 'CD', icao: 'CND', country: 'Netherlands' },
      { name: 'TUI fly Netherlands', iata: 'OR', icao: 'TFL', country: 'Netherlands' },
      
      // Nordic Airlines
      { name: 'SAS', iata: 'SK', icao: 'SAS', country: 'Sweden' },
      { name: 'Norwegian', iata: 'DY', icao: 'NAX', country: 'Norway' },
      { name: 'Finnair', iata: 'AY', icao: 'FIN', country: 'Finland' },
      { name: 'Icelandair', iata: 'FI', icao: 'ICE', country: 'Iceland' },
      { name: 'Atlantic Airways', iata: 'RC', icao: 'FLI', country: 'Faroe Islands' },
      { name: 'Widerøe', iata: 'WF', icao: 'WIF', country: 'Norway' },
      { name: 'Norse Atlantic Airways', iata: 'N0', icao: 'NBT', country: 'Norway' },
      
      // Irish Airlines
      { name: 'Ryanair', iata: 'FR', icao: 'RYR', country: 'Ireland' },
      { name: 'Aer Lingus', iata: 'EI', icao: 'EIN', country: 'Ireland' },
      { name: 'CityJet', iata: 'WX', icao: 'BCY', country: 'Ireland' },
      { name: 'ASL Airlines Ireland', iata: 'AG', icao: 'ABR', country: 'Ireland' },
      { name: 'Stobart Air', iata: 'RE', icao: 'STK', country: 'Ireland' },
      
      // Portuguese & Greek Airlines
      { name: 'TAP Portugal', iata: 'TP', icao: 'TAP', country: 'Portugal' },
      { name: 'SATA Air Açores', iata: 'SP', icao: 'SAT', country: 'Portugal' },
      { name: 'Azores Airlines', iata: 'S4', icao: 'RZO', country: 'Portugal' },
      { name: 'Aegean Airlines', iata: 'A3', icao: 'AEE', country: 'Greece' },
      { name: 'Olympic Air', iata: 'OA', icao: 'OAL', country: 'Greece' },
      { name: 'Sky Express', iata: 'GQ', icao: 'SEH', country: 'Greece' },
      
      // Eastern European Airlines
      { name: 'LOT Polish Airlines', iata: 'LO', icao: 'LOT', country: 'Poland' },
      { name: 'Czech Airlines', iata: 'OK', icao: 'CSA', country: 'Czech Republic' },
      { name: 'Wizz Air', iata: 'W6', icao: 'WZZ', country: 'Hungary' },
      { name: 'Tarom', iata: 'RO', icao: 'ROT', country: 'Romania' },
      { name: 'Croatia Airlines', iata: 'OU', icao: 'CTN', country: 'Croatia' },
      { name: 'Bulgaria Air', iata: 'FB', icao: 'LZB', country: 'Bulgaria' },
      { name: 'Air Baltic', iata: 'BT', icao: 'BTI', country: 'Latvia' },
      { name: 'Smartwings', iata: 'QS', icao: 'TVS', country: 'Czech Republic' },
      { name: 'Adria Airways', iata: 'JP', icao: 'ADR', country: 'Slovenia' },
      { name: 'Air Serbia', iata: 'JU', icao: 'ASL', country: 'Serbia' },
      { name: 'Nordica', iata: 'LO', icao: 'EST', country: 'Estonia' }, // Operates under LOT's code
      { name: 'Smartlynx Airlines Estonia', iata: '6Y', icao: 'MYX', country: 'Estonia' },
      
      // Swiss & Austrian Airlines
      { name: 'Swiss International Air Lines', iata: 'LX', icao: 'SWR', country: 'Switzerland' },
      { name: 'Edelweiss Air', iata: 'WK', icao: 'EDW', country: 'Switzerland' },
      { name: 'Austrian Airlines', iata: 'OS', icao: 'AUA', country: 'Austria' },
      { name: 'People\'s', iata: 'PE', icao: 'PEV', country: 'Austria' },
      { name: 'Eurowings Europe', iata: 'E2', icao: 'EWE', country: 'Austria' },
      
      // Belgian & Luxembourgish Airlines
      { name: 'Brussels Airlines', iata: 'SN', icao: 'BEL', country: 'Belgium' },
      { name: 'TUI fly Belgium', iata: 'TB', icao: 'JAF', country: 'Belgium' },
      { name: 'Air Belgium', iata: 'KF', icao: 'ABB', country: 'Belgium' },
      { name: 'Luxair', iata: 'LG', icao: 'LGL', country: 'Luxembourg' },
      
      // Non-EU Airlines (for reference)
      { name: 'Emirates', iata: 'EK', icao: 'UAE', country: 'UAE' },
      { name: 'Qatar Airways', iata: 'QR', icao: 'QTR', country: 'Qatar' },
      { name: 'Turkish Airlines', iata: 'TK', icao: 'THY', country: 'Turkey' },
      { name: 'Singapore Airlines', iata: 'SQ', icao: 'SIA', country: 'Singapore' },
      { name: 'Cathay Pacific', iata: 'CX', icao: 'CPA', country: 'Hong Kong' },
      { name: 'Japan Airlines', iata: 'JL', icao: 'JAL', country: 'Japan' },
      { name: 'Korean Air', iata: 'KE', icao: 'KAL', country: 'South Korea' },
      { name: 'Air China', iata: 'CA', icao: 'CCA', country: 'China' },
      { name: 'Air India', iata: 'AI', icao: 'AIC', country: 'India' },
      { name: 'Qantas', iata: 'QF', icao: 'QFA', country: 'Australia' },
      { name: 'Air New Zealand', iata: 'NZ', icao: 'ANZ', country: 'New Zealand' },
      { name: 'Air Canada', iata: 'AC', icao: 'ACA', country: 'Canada' },
      { name: 'American Airlines', iata: 'AA', icao: 'AAL', country: 'USA' },
      { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL', country: 'USA' },
      { name: 'United Airlines', iata: 'UA', icao: 'UAL', country: 'USA' }
    ];

    // Validate query
    if (!query || query.length < 2) {
      return [];
    }

    const searchQuery = query.toLowerCase().trim();
    // Filter using more sophisticated approach
    return airlines.filter(airline => 
      airline.iata.toLowerCase().includes(searchQuery) ||
      airline.name.toLowerCase().includes(searchQuery) ||
      airline.country.toLowerCase().includes(searchQuery) ||
      airline.icao.toLowerCase().includes(searchQuery)
    ).slice(0, 15); // Limit results to improve performance
  } catch (error) {
    console.error('Error searching airlines:', error);
    return []; // Return empty array instead of throwing to ensure UI doesn't break
  }
}

// Autocomplete for airports using AviationStack API
export async function searchAirports(query: string): Promise<Airport[]> {
  try {
    // Input validation
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    if (query.length < 2) {
      return [];
    }

    // Mock data for testing
    const airports = [
      // UK Airports
      { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
      { iata: 'LGW', name: 'London Gatwick', city: 'London', country: 'United Kingdom' },
      { iata: 'STN', name: 'London Stansted', city: 'London', country: 'United Kingdom' },
      { iata: 'LTN', name: 'London Luton', city: 'London', country: 'United Kingdom' },
      { iata: 'LCY', name: 'London City', city: 'London', country: 'United Kingdom' },
      { iata: 'MAN', name: 'Manchester', city: 'Manchester', country: 'United Kingdom' },
      { iata: 'BHX', name: 'Birmingham', city: 'Birmingham', country: 'United Kingdom' },
      { iata: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'United Kingdom' },
      { iata: 'GLA', name: 'Glasgow', city: 'Glasgow', country: 'United Kingdom' },
      { iata: 'BRS', name: 'Bristol', city: 'Bristol', country: 'United Kingdom' },
      { iata: 'NCL', name: 'Newcastle', city: 'Newcastle', country: 'United Kingdom' },
      { iata: 'LPL', name: 'Liverpool', city: 'Liverpool', country: 'United Kingdom' },
      { iata: 'BFS', name: 'Belfast International', city: 'Belfast', country: 'United Kingdom' },
      { iata: 'BHD', name: 'Belfast City', city: 'Belfast', country: 'United Kingdom' },
      { iata: 'ABZ', name: 'Aberdeen', city: 'Aberdeen', country: 'United Kingdom' },
      { iata: 'SOU', name: 'Southampton', city: 'Southampton', country: 'United Kingdom' },
      { iata: 'EMA', name: 'East Midlands', city: 'Nottingham', country: 'United Kingdom' },
      { iata: 'CWL', name: 'Cardiff', city: 'Cardiff', country: 'United Kingdom' },
      { iata: 'NQY', name: 'Newquay', city: 'Newquay', country: 'United Kingdom' },
      { iata: 'EXT', name: 'Exeter', city: 'Exeter', country: 'United Kingdom' },

      // EU Airports
      { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
      { iata: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France' },
      { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
      { iata: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany' },
      { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
      { iata: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Spain' },
      { iata: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona', country: 'Spain' },
      { iata: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italy' },
      { iata: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy' },
      { iata: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium' },
      { iata: 'ZRH', name: 'Zurich', city: 'Zurich', country: 'Switzerland' },
      { iata: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark' },
      { iata: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
      { iata: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki', country: 'Finland' },
      { iata: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway' },
      { iata: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland' },
      { iata: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland' },
      { iata: 'PRG', name: 'Prague', city: 'Prague', country: 'Czech Republic' },
      { iata: 'BUD', name: 'Budapest', city: 'Budapest', country: 'Hungary' },
      { iata: 'VIE', name: 'Vienna', city: 'Vienna', country: 'Austria' },
      { iata: 'LIS', name: 'Lisbon', city: 'Lisbon', country: 'Portugal' },
      { iata: 'ATH', name: 'Athens', city: 'Athens', country: 'Greece' },
      { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },

      // Middle East Airports
      { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
      { iata: 'AUH', name: 'Abu Dhabi', city: 'Abu Dhabi', country: 'UAE' },
      { iata: 'DOH', name: 'Doha Hamad', city: 'Doha', country: 'Qatar' },
      { iata: 'BAH', name: 'Bahrain', city: 'Manama', country: 'Bahrain' },
      { iata: 'KWI', name: 'Kuwait', city: 'Kuwait City', country: 'Kuwait' },
      { iata: 'RUH', name: 'Riyadh', city: 'Riyadh', country: 'Saudi Arabia' },
      { iata: 'JED', name: 'Jeddah', city: 'Jeddah', country: 'Saudi Arabia' },
      { iata: 'TLV', name: 'Tel Aviv', city: 'Tel Aviv', country: 'Israel' },
      { iata: 'AMM', name: 'Amman', city: 'Amman', country: 'Jordan' },
      { iata: 'BEY', name: 'Beirut', city: 'Beirut', country: 'Lebanon' },

      // Asian Airports
      { iata: 'HKG', name: 'Hong Kong', city: 'Hong Kong', country: 'China' },
      { iata: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'China' },
      { iata: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China' },
      { iata: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan' },
      { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan' },
      { iata: 'ICN', name: 'Seoul Incheon', city: 'Seoul', country: 'South Korea' },
      { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
      { iata: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
      { iata: 'KUL', name: 'Kuala Lumpur', city: 'Kuala Lumpur', country: 'Malaysia' },
      { iata: 'DEL', name: 'Delhi', city: 'Delhi', country: 'India' },
      { iata: 'BOM', name: 'Mumbai', city: 'Mumbai', country: 'India' },
      { iata: 'MNL', name: 'Manila', city: 'Manila', country: 'Philippines' },
      { iata: 'CGK', name: 'Jakarta', city: 'Jakarta', country: 'Indonesia' },

      // North American Airports
      { iata: 'JFK', name: 'New York JFK', city: 'New York', country: 'USA' },
      { iata: 'EWR', name: 'Newark', city: 'New York', country: 'USA' },
      { iata: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'USA' },
      { iata: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'USA' },
      { iata: 'DFW', name: 'Dallas/Fort Worth', city: 'Dallas', country: 'USA' },
      { iata: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'USA' },
      { iata: 'MIA', name: 'Miami', city: 'Miami', country: 'USA' },
      { iata: 'BOS', name: 'Boston', city: 'Boston', country: 'USA' },
      { iata: 'SEA', name: 'Seattle', city: 'Seattle', country: 'USA' },
      { iata: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
      { iata: 'YUL', name: 'Montreal', city: 'Montreal', country: 'Canada' },
      { iata: 'YVR', name: 'Vancouver', city: 'Vancouver', country: 'Canada' },
    ];
    
    const searchQuery = query.toLowerCase().trim();
    return airports.filter(airport => 
      airport.iata.toLowerCase().includes(searchQuery) ||
      airport.name.toLowerCase().includes(searchQuery) ||
      airport.city?.toLowerCase().includes(searchQuery) ||
      airport.country.toLowerCase().includes(searchQuery)
    ).slice(0, 15); // Limit results to improve performance
  } catch (error) {
    console.error('Error searching airports:', error);
    return []; // Return empty array instead of throwing to ensure UI doesn't break
  }
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