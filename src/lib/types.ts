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

export type ClaimStatus = 'pending' | 'in-review' | 'approved' | 'paid';
export type DisruptionType = 'delay' | 'cancellation' | 'denied_boarding';
export type DisruptionReason = 
  | 'technical_issue'
  | 'weather'
  | 'air_traffic_control'
  | 'security'
  | 'staff_shortage'
  | 'strike'
  | 'other_airline_fault'
  | 'other';

export interface ClaimFilters {
  status?: ClaimStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Eligibility Types
export interface DisruptionDetails {
  type: DisruptionType;
  reason?: DisruptionReason;
  delayDuration?: number;
  noticeGiven?: number;
}

export interface CompensationResult {
  isEligible: boolean;
  amount: number;
  reason: string;
  regulation: 'EU261' | 'UK261';
}

export interface FlightCheckResponse {
  isEligible: boolean;
  compensation: number;
  reason: string;
  processingTime: string;
  regulation: 'EU261' | 'UK261';
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

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
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