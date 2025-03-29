export * from './aviation';
export * from './claims';
export { supabase } from './supabase';
export { makeApiRequest } from './base';

// Re-export common types
export type {
  Claim,
  ClaimDocument,
  ClaimStatus,
  FlightCheckResponse,
  DisruptionDetails,
  CompensationResult,
} from '../types';

// Export main functions
export { checkFlightEligibility } from './aviation';
export { getUserClaims, getClaimStatus, updateClaimStatus } from './claims';