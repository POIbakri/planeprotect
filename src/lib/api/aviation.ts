import { makeApiRequest } from './base';
import { supabase } from './supabase';
import { logger } from '../logger';
import { EligibilityChecker } from '../eligibility';
import { API_CONFIG } from '../constants';
import type { 
  AviationStackResponse, 
  AviationStackFlight,
  FlightCheckResponse 
} from '../types';

// Maximum age of claims in years
const MAX_CLAIM_AGE_YEARS = 6;

export async function checkFlightEligibility(
  flightNumber: string,
  flightDate: string
): Promise<FlightCheckResponse> {
  try {
    logger.debug('Checking flight eligibility', { flightNumber, flightDate });

    // Validate flight number format
    if (!flightNumber.match(/^[A-Z]{2}\d{1,4}$/)) {
      throw new Error('Invalid flight number format');
    }

    // Validate date range
    const date = new Date(flightDate);
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - MAX_CLAIM_AGE_YEARS);
    
    if (date > new Date()) {
      throw new Error('Flight date cannot be in the future');
    }
    
    if (date < maxAge) {
      throw new Error(`Flight date must be within the last ${MAX_CLAIM_AGE_YEARS} years`);
    }

    // Get flight details from Aviation Stack API via Edge Function
    const response = await fetch(
      `${API_CONFIG.baseUrl}/rest/v1/aviation/flights?flight_iata=${flightNumber}&flight_date=${flightDate}&flight_status=landed,cancelled,incident`,
      {
        headers: {
          ...API_CONFIG.headers,
          'Prefer': 'return=minimal'
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch flight data');
    }

    const data = await response.json();
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Flight not found');
    }

    return processFlightData(data[0]);
  } catch (error) {
    logger.error('Flight eligibility check failed', error as Error);
    throw error;
  }
}

function processFlightData(flight: AviationStackFlight): FlightCheckResponse {
  // Calculate route information
  const route = {
    departureCountry: flight.departure.timezone.split('/')[0],
    arrivalCountry: flight.arrival.timezone.split('/')[0],
    airlineCountry: flight.airline.country_iso2,
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
  const disruption = {
    type: flight.flight_status === 'cancelled' ? 'cancellation' as const : 'delay' as const,
    delayDuration: delayHours,
    reason: flight.flight_status === 'incident' ? 'technical_issue' : undefined,
  };

  const eligibility = EligibilityChecker.checkEligibility(route, disruption, distance);

  // Determine regulation
  const regulation = EligibilityChecker.isUKFlight(route) ? 'UK261' : 'EU261';

  return {
    isEligible: eligibility.isEligible,
    compensation: eligibility.amount,
    reason: eligibility.reason,
    processingTime: '2-3 weeks',
    regulation,
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
}

export async function searchAirports(query: string) {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('aviation_airports')
    .select('*')
    .or(`
      name.ilike.%${query}%,
      iata_code.ilike.%${query}%,
      city.ilike.%${query}%
    `)
    .order('name')
    .limit(10);

  if (error) throw error;
  return data;
}

export async function searchAirlines(query: string) {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('aviation_airlines')
    .select('*')
    .or(`
      name.ilike.%${query}%,
      iata_code.ilike.%${query}%
    `)
    .order('name')
    .limit(10);

  if (error) throw error;
  return data;
}