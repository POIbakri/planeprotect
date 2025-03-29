import { logger } from './logger';
import type { DisruptionDetails, CompensationResult } from './types';

interface FlightRoute {
  departureCountry: string;
  arrivalCountry: string;
  airlineCountry: string;
}

// EU member states
const EU_COUNTRIES = new Set([
  'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 
  'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 
  'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE'
]);

// UK territories
const UK_COUNTRIES = new Set(['GBR']);

// Extraordinary circumstances that exempt airlines from compensation
const EXTRAORDINARY_CIRCUMSTANCES = new Set([
  'weather',           // Severe weather conditions
  'security',          // Security risks
  'political',         // Political instability
  'strike_external',   // External strikes (not airline strikes)
  'atc',              // Air traffic control restrictions
  'medical',          // Medical emergencies
  'bird_strike',      // Bird strikes
]);

// Compensation amounts in EUR for EU flights
const EU_COMPENSATION = {
  SHORT: { distance: 1500, amount: 250 },   // Flights up to 1,500km
  MEDIUM: { distance: 3500, amount: 400 },  // Flights between 1,500-3,500km
  LONG: { amount: 600 },                    // Flights over 3,500km
};

// Compensation amounts in GBP for UK flights
const UK_COMPENSATION = {
  SHORT: { distance: 1500, amount: 220 },   // Flights up to 1,500km
  MEDIUM: { distance: 3500, amount: 350 },  // Flights between 1,500-3,500km
  LONG: { amount: 520 },                    // Flights over 3,500km
};

export class EligibilityChecker {
  static isEUFlight(route: FlightRoute): boolean {
    return (
      EU_COUNTRIES.has(route.departureCountry) ||
      (EU_COUNTRIES.has(route.arrivalCountry) && EU_COUNTRIES.has(route.airlineCountry))
    );
  }

  static isUKFlight(route: FlightRoute): boolean {
    return (
      UK_COUNTRIES.has(route.departureCountry) ||
      (UK_COUNTRIES.has(route.arrivalCountry) && UK_COUNTRIES.has(route.airlineCountry))
    );
  }

  static calculateDistance(
    departureLat: number,
    departureLon: number,
    arrivalLat: number,
    arrivalLon: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(arrivalLat - departureLat);
    const dLon = this.toRad(arrivalLon - departureLon);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(departureLat)) * Math.cos(this.toRad(arrivalLat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private static getCompensationAmount(
    distance: number,
    disruption: DisruptionDetails,
    regulation: 'EU261' | 'UK261'
  ): number {
    const compensation = regulation === 'EU261' ? EU_COMPENSATION : UK_COMPENSATION;

    // For short flights
    if (distance <= compensation.SHORT.distance) {
      return compensation.SHORT.amount;
    }
    
    // For medium flights
    if (distance <= compensation.MEDIUM.distance) {
      return compensation.MEDIUM.amount;
    }
    
    // For long flights
    return compensation.LONG.amount;
  }

  private static isExtraordinaryCircumstance(reason: string): boolean {
    return EXTRAORDINARY_CIRCUMSTANCES.has(reason);
  }

  private static isEligibleForCompensation(
    disruption: DisruptionDetails,
    distance: number
  ): boolean {
    // Check for extraordinary circumstances
    if (disruption.reason && this.isExtraordinaryCircumstance(disruption.reason)) {
      return false;
    }

    switch (disruption.type) {
      case 'delay':
        // Eligible if delay is 3 hours or more
        return disruption.delayDuration! >= 3;

      case 'cancellation':
        // Check notice period for cancellations
        if (disruption.noticeGiven) {
          // Not eligible if 14 days or more notice
          if (disruption.noticeGiven >= 14 * 24) {
            return false;
          }
          // For short flights, not eligible if 7-14 days notice and rerouting within 2/4 hours
          if (disruption.noticeGiven >= 7 * 24 && distance <= 1500) {
            return false;
          }
        }
        return true;

      case 'denied_boarding':
        // Always eligible unless voluntary
        return true;

      default:
        return false;
    }
  }

  static checkEligibility(
    route: FlightRoute,
    disruption: DisruptionDetails,
    distance: number
  ): CompensationResult {
    try {
      // Determine applicable regulation
      const isEU = this.isEUFlight(route);
      const isUK = this.isUKFlight(route);
      const regulation = isUK ? 'UK261' : 'EU261';

      // Check if flight is covered by any regulation
      if (!isEU && !isUK) {
        return {
          isEligible: false,
          amount: 0,
          reason: 'Flight not covered by EU or UK regulations',
          regulation,
        };
      }

      // Check eligibility based on disruption type and circumstances
      const isEligible = this.isEligibleForCompensation(disruption, distance);

      if (!isEligible) {
        return {
          isEligible: false,
          amount: 0,
          reason: disruption.reason && this.isExtraordinaryCircumstance(disruption.reason)
            ? 'Disruption caused by extraordinary circumstances'
            : 'Disruption does not qualify for compensation',
          regulation,
        };
      }

      // Calculate compensation amount
      const amount = this.getCompensationAmount(distance, disruption, regulation);

      // Build response message
      let reason = '';
      switch (disruption.type) {
        case 'delay':
          reason = `Flight delayed by ${disruption.delayDuration} hours`;
          break;
        case 'cancellation':
          reason = 'Flight cancelled with insufficient notice';
          break;
        case 'denied_boarding':
          reason = 'Involuntarily denied boarding';
          break;
      }

      return {
        isEligible: true,
        amount,
        reason,
        regulation,
      };
    } catch (error) {
      logger.error('Error checking eligibility', error as Error);
      throw error;
    }
  }

  static validateClaim(
    route: FlightRoute,
    disruption: DisruptionDetails,
    distance: number
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate route
    if (!route.departureCountry || !route.arrivalCountry || !route.airlineCountry) {
      errors.push('Missing route information');
    }

    // Validate disruption
    if (!disruption.type) {
      errors.push('Missing disruption type');
    }

    if (disruption.type === 'delay' && !disruption.delayDuration) {
      errors.push('Missing delay duration');
    }

    if (disruption.type === 'cancellation' && disruption.noticeGiven === undefined) {
      errors.push('Missing cancellation notice period');
    }

    // Validate distance
    if (!distance || distance <= 0) {
      errors.push('Invalid flight distance');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}