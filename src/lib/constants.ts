export const VALIDATION_RULES = {
  flightNumber: /^[A-Z]{2}\d{1,4}$/,
  phone: /^\+?[\d\s-()]{8,}$/,
  email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
  passportNumber: /^[A-Z0-9]{6,12}$/,
} as const;

export const COMPENSATION_LIMITS = {
  EU: {
    SHORT_FLIGHT: { distance: 1500, amount: 250 },
    MEDIUM_FLIGHT: { distance: 3500, amount: 400 },
    LONG_FLIGHT: { distance: Infinity, amount: 600 },
  },
  UK: {
    SHORT_FLIGHT: { distance: 1500, amount: 220 },
    MEDIUM_FLIGHT: { distance: 3500, amount: 350 },
    LONG_FLIGHT: { distance: Infinity, amount: 520 },
  },
} as const;

export const DISRUPTION_THRESHOLDS = {
  MIN_DELAY_HOURS: 3,
  LONG_DELAY_HOURS: 4,
  CANCELLATION_NOTICE_DAYS: 14,
  SHORT_FLIGHT_NOTICE_DAYS: 7,
} as const;

export const DATE_LIMITS = {
  MAX_CLAIM_AGE_DAYS: 365 * 6, // 6 years
  MIN_FLIGHT_DATE: new Date(Date.now() - (365 * 6 * 24 * 60 * 60 * 1000)),
  MAX_FLIGHT_DATE: new Date(),
} as const;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_SUPABASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  },
  retryAttempts: 3,
  timeout: 30000,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
} as const;

export const CLAIM_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in-review',
  APPROVED: 'approved',
  PAID: 'paid',
} as const;

export const DOCUMENT_TYPES = {
  BOARDING_PASS: 'boarding_pass',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  PASSPORT: 'passport',
} as const;

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const DISRUPTION_REASONS = [
  { id: 'technical_issue', label: 'Technical Issue' },
  { id: 'weather', label: 'Bad Weather' },
  { id: 'air_traffic_control', label: 'Air Traffic Control' },
  { id: 'security', label: 'Security Issue' },
  { id: 'staff_shortage', label: 'Staff Shortage' },
  { id: 'strike', label: 'Strike' },
  { id: 'other_airline_fault', label: 'Other Airline Fault' },
  { id: 'other', label: 'Other Reason' },
] as const;