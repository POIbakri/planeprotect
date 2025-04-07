// API Response Types
export interface ApiResponse<T> {
  data: T;
  error: null | {
    message: string;
    code: string;
  };
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Aviation Types
export interface AviationSearchResult {
  id: string;
  code: string;
  name: string;
  city?: string;
  country: string;
  type: 'airport' | 'airline';
}

export interface AviationStackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: AviationStackFlight[];
}

export interface AviationStackFlight {
  flight_date: string;
  flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident';
  departure: AviationStackAirport;
  arrival: AviationStackAirport;
  airline: AviationStackAirline;
  flight: {
    number: string;
    iata: string;
    icao?: string;
  };
}

export interface AviationStackAirport {
  airport: string;
  timezone: string;
  iata: string;
  icao?: string;
  terminal?: string;
  gate?: string;
  delay?: number;
  scheduled: string;
  estimated: string;
  actual?: string;
  latitude: number;
  longitude: number;
}

export interface AviationStackAirline {
  name: string;
  iata: string;
  icao: string;
  country_name: string;
  country_iso2: string;
}

// Claim Types
export interface Claim {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  flight_number: string;
  flight_date: string;
  passenger_name: string;
  email: string;
  phone: string;
  passport_number: string;
  compensation_amount: number;
  status: ClaimStatus;
  disruption_type: DisruptionType;
  disruption_reason?: string;
  delay_duration?: number;
  documents?: ClaimDocument[];
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  type: 'boarding_pass' | 'booking_confirmation' | 'passport';
  file_path: string;
  uploaded_at: string;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export type ClaimStatus = 'pending' | 'in-review' | 'approved' | 'paid' | 'rejected' | 'archived';
export type DisruptionType = 'delay' | 'cancellation' | 'denied_boarding';
export type DisruptionReason = 
  | 'technical_issue'      // General technical issues
  | 'maintenance'          // Maintenance problems
  | 'staff_shortage'       // Staff shortages
  | 'weather'             // Bad weather
  | 'air_traffic_control' // ATC restrictions
  | 'security'            // Security issues
  | 'strike'              // Strikes
  | 'medical'             // Medical emergencies
  | 'bird_strike'         // Bird strikes
  | 'volcanic_ash'        // Volcanic ash
  | 'terrorism'           // Terrorist threats
  | 'military_conflict'   // Military conflicts
  | 'natural_disaster'    // Natural disasters
  | 'airport_closure'     // Airport closures
  | 'customs_immigration' // Customs/immigration issues
  | 'airport_strike'      // Airport staff strikes
  | 'airport_technical'   // Airport technical issues
  | 'aircraft_rotation'   // Aircraft rotation issues
  | 'baggage_handling'    // Baggage handling problems
  | 'fuel_issue'         // Fuel-related issues
  | 'catering_issue'     // Catering problems
  | 'cleaning_issue'     // Cleaning problems
  | 'airline_strike'     // Airline staff strikes
  | 'other';             // Other reasons

export interface ClaimFilters {
  status?: ClaimStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Eligibility Types
export interface DisruptionDetails {
  type: DisruptionType;
  delayDuration?: number;    // in hours
  noticeGiven?: number;      // in hours
  reason?: DisruptionReason;
  reroutingTime?: number;    // in hours
  voluntary?: boolean;
  alternativeFlight?: boolean | {
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
  };
  additionalInfo?: string;   // Free text for additional details
  isDomestic?: boolean;
}

export interface FlightData {
  flightNumber: string;
  flightDate: string;
  departure: {
    airport: string;
    iata: string;
    terminal?: string;
    country: string;
  };
  arrival: {
    airport: string;
    iata: string;
    terminal?: string;
    country: string;
  };
  airline: {
    name: string;
    iata: string;
    country: string;
  };
  disruption: DisruptionDetails;
}

export interface CompensationResult {
  isEligible: boolean;
  amount: number;
  reason: string;
  regulation: 'EU261' | 'UK261';
  requiresManualReview?: boolean;
  details?: {
    departureCountry: string;
    arrivalCountry: string;
    airlineCountry: string;
    distance: number;
    disruptionType?: DisruptionType;
    disruptionReason?: DisruptionReason;
    noticeGiven?: number;
    delayDuration?: number;
    reroutingTime?: number;
    voluntary?: boolean;
    alternativeFlight?: boolean | {
      airline: string;
      flightNumber: string;
      departureTime: string;
      arrivalTime: string;
    };
    additionalInfo?: string;
    isDomestic?: boolean;
    dutyOfCare?: any;
  };
  flightDetails: {
    airline: string;
    flightNumber: string;
    departure: {
      airport: string;
      iata: string;
      terminal?: string;
      country: string;
    };
    arrival: {
      airport: string;
      iata: string;
      terminal?: string;
      country: string;
    };
  };
}

export interface FlightCheckResponse extends CompensationResult {
  processingTime: string;
  disruption?: DisruptionDetails;
  compensation: number;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  count: number | null;
  page: number;
  limit: number;
}

// Error Types
export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  status: number;
  details?: unknown;
}

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  name: string;
  iata: string;
  icao: string;
  country: string;
}

export interface FlightRoute {
  flight_date: string;
  airline: {
    name: string;
    iata: string;
    country: string;
  };
  departure: {
    airport: string;
    iata: string;
    terminal: string;
    country: string;
  };
  arrival: {
    airport: string;
    iata: string;
    terminal: string;
    country: string;
  };
  flight: {
    iata: string;
    number: string;
    status: string;
  };
  departureCountry: string;
  arrivalCountry: string;
  airlineCountry: string;
}