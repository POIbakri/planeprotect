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
  'volcanic_ash',     // Volcanic ash clouds
  'terrorism',        // Terrorist threats
  'military_conflict', // Military conflicts
  'natural_disaster', // Natural disasters
  'airport_closure',  // Airport closures
  'customs_immigration', // Customs/immigration issues
  'airport_strike',   // Airport staff strikes
  'airport_technical', // Airport technical issues
]);

// Technical issues that are NOT extraordinary circumstances
const NON_EXTRAORDINARY_TECHNICAL = new Set([
  'technical_issue',  // General technical issues
  'maintenance',      // Maintenance problems
  'staff_shortage',   // Staff shortages
  'aircraft_rotation', // Aircraft rotation issues
  'baggage_handling', // Baggage handling problems
  'fuel_issue',      // Fuel-related issues
  'catering_issue',  // Catering problems
  'cleaning_issue',  // Cleaning problems
  'airline_strike',  // Airline staff strikes
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

// Duty of care requirements
const DUTY_OF_CARE = {
  SHORT: { delay: 2 },    // Short-haul flights (≤1,500km)
  MEDIUM: { delay: 3 },   // Medium-haul flights (1,500-3,500km)
  LONG: { delay: 4 },     // Long-haul flights (>3,500km)
};

export class EligibilityChecker {
  static isEUFlight(route: FlightRoute): boolean {
    // Check if departure is from EU
    if (EU_COUNTRIES.has(route.departureCountry)) {
      return true;
    }
    
    // Check if arrival is in EU and airline is EU-based
    if (EU_COUNTRIES.has(route.arrivalCountry) && EU_COUNTRIES.has(route.airlineCountry)) {
      return true;
    }
    
    return false;
  }

  static isUKFlight(route: FlightRoute): boolean {
    // UK domestic flights are not covered
    if (UK_COUNTRIES.has(route.departureCountry) && UK_COUNTRIES.has(route.arrivalCountry)) {
      return false;
    }
    
    // Check if departure is from UK
    if (UK_COUNTRIES.has(route.departureCountry)) {
      return true;
    }
    
    // Check if arrival is in UK and airline is UK-based
    if (UK_COUNTRIES.has(route.arrivalCountry) && UK_COUNTRIES.has(route.airlineCountry)) {
      return true;
    }
    
    return false;
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
    // Technical issues are NOT extraordinary circumstances
    if (NON_EXTRAORDINARY_TECHNICAL.has(reason)) {
      return false;
    }
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
          
          // For short flights (≤1,500km)
          if (distance <= 1500) {
            // Not eligible if 7-14 days notice and rerouting within 2 hours
            if (disruption.noticeGiven >= 7 * 24 && disruption.reroutingTime && disruption.reroutingTime <= 2) {
              return false;
            }
          }
          // For medium flights (1,500-3,500km)
          else if (distance <= 3500) {
            // Not eligible if 7-14 days notice and rerouting within 3 hours
            if (disruption.noticeGiven >= 7 * 24 && disruption.reroutingTime && disruption.reroutingTime <= 3) {
              return false;
            }
          }
          // For long flights (>3,500km)
          else {
            // Not eligible if 7-14 days notice and rerouting within 4 hours
            if (disruption.noticeGiven >= 7 * 24 && disruption.reroutingTime && disruption.reroutingTime <= 4) {
              return false;
            }
          }
        }
        return true;

      case 'denied_boarding':
        // Always eligible unless voluntary
        return !disruption.voluntary;

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
      // Check for UK domestic flights
      if (UK_COUNTRIES.has(route.departureCountry) && UK_COUNTRIES.has(route.arrivalCountry)) {
        return {
          isEligible: false,
          amount: 0,
          reason: 'UK domestic flights are not covered by UK261',
          regulation: 'UK261',
          requiresManualReview: true,
          details: {
            departureCountry: route.departureCountry,
            arrivalCountry: route.arrivalCountry,
            airlineCountry: route.airlineCountry,
            distance,
            isDomestic: true,
          }
        };
      }

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
          requiresManualReview: true,
          details: {
            departureCountry: route.departureCountry,
            arrivalCountry: route.arrivalCountry,
            airlineCountry: route.airlineCountry,
            distance,
            isDomestic: false,
          }
        };
      }

      // Check eligibility based on disruption type and circumstances
      const isEligible = this.isEligibleForCompensation(disruption, distance);

      // Determine duty of care requirements
      let dutyOfCare = {
        meals: false,
        refreshments: false,
        hotel: false,
        transport: false,
        communication: false,
      };

      if (disruption.type === 'delay' && disruption.delayDuration) {
        // Determine flight category
        const category = distance <= 1500 ? 'SHORT' : 
                        distance <= 3500 ? 'MEDIUM' : 'LONG';
        
        const requiredDelay = DUTY_OF_CARE[category].delay;
        
        if (disruption.delayDuration >= requiredDelay) {
          dutyOfCare = {
            meals: true,
            refreshments: true,
            hotel: disruption.delayDuration >= 12,
            transport: disruption.delayDuration >= 12,
            communication: true,
          };
        }
      }

      if (!isEligible) {
        let reason = '';
        let requiresManualReview = false;

        if (disruption.reason && this.isExtraordinaryCircumstance(disruption.reason)) {
          reason = 'Disruption caused by extraordinary circumstances';
          requiresManualReview = true; // Extraordinary circumstances may need review
        } else if (disruption.type === 'delay' && disruption.delayDuration! < 3) {
          reason = `Delay of ${disruption.delayDuration} hours is less than the required 3 hours`;
          requiresManualReview = true; // Close to threshold may need review
        } else if (disruption.type === 'cancellation' && disruption.noticeGiven! >= 14 * 24) {
          reason = 'Flight cancelled with more than 14 days notice';
          requiresManualReview = true; // Notice period close to threshold may need review
        } else if (disruption.type === 'denied_boarding' && disruption.voluntary) {
          reason = 'Voluntary denied boarding';
          requiresManualReview = true; // Voluntary denied boarding may need review
        } else {
          reason = 'Disruption does not qualify for compensation';
        }

        return {
          isEligible: false,
          amount: 0,
          reason,
          regulation,
          requiresManualReview,
          details: {
            departureCountry: route.departureCountry,
            arrivalCountry: route.arrivalCountry,
            airlineCountry: route.airlineCountry,
            distance,
            disruptionType: disruption.type,
            disruptionReason: disruption.reason,
            noticeGiven: disruption.noticeGiven,
            delayDuration: disruption.delayDuration,
            reroutingTime: disruption.reroutingTime,
            isVoluntary: disruption.voluntary,
            dutyOfCare,
          }
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
          if (disruption.alternativeFlight) {
            reason += ` (Alternative flight: ${disruption.alternativeFlight.airline} ${disruption.alternativeFlight.flightNumber})`;
          }
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
        requiresManualReview: false,
        details: {
          departureCountry: route.departureCountry,
          arrivalCountry: route.arrivalCountry,
          airlineCountry: route.airlineCountry,
          distance,
          disruptionType: disruption.type,
          disruptionReason: disruption.reason,
          noticeGiven: disruption.noticeGiven,
          delayDuration: disruption.delayDuration,
          reroutingTime: disruption.reroutingTime,
          isVoluntary: disruption.voluntary,
          alternativeFlight: disruption.alternativeFlight,
          additionalInfo: disruption.additionalInfo,
          dutyOfCare,
        }
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