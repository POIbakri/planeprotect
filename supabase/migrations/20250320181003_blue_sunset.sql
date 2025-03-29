/*
  # Add performance indexes

  1. Changes
    - Add index on `flight_number` for faster searches
    - Add index on `status` for filtering
    - Add index on `user_id` for user claims lookup
    - Add composite index for common query patterns
*/

-- Add indexes for common query patterns
CREATE INDEX idx_claims_flight_number ON claims (flight_number);
CREATE INDEX idx_claims_status ON claims (status);
CREATE INDEX idx_claims_user_id ON claims (user_id);
CREATE INDEX idx_claims_created_at ON claims (created_at DESC);
CREATE INDEX idx_claims_user_status ON claims (user_id, status);

-- Add index for document lookups
CREATE INDEX idx_claim_documents_claim_id ON claim_documents (claim_id);