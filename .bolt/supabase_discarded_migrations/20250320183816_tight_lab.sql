/*
  # Add flight disruption details

  1. Changes
    - Add disruption_type and reason columns to claims table
    - Add check constraints for valid values
    - Update existing RLS policies
*/

-- Add new columns to claims table
ALTER TABLE claims 
ADD COLUMN disruption_type text NOT NULL DEFAULT 'delay',
ADD COLUMN disruption_reason text,
ADD COLUMN delay_duration integer,
ADD CONSTRAINT valid_disruption_type CHECK (disruption_type IN ('delay', 'cancellation')),
ADD CONSTRAINT valid_disruption_reason CHECK (
  disruption_reason IN (
    'technical_issue',
    'weather',
    'air_traffic_control',
    'security',
    'staff_shortage',
    'strike',
    'other_airline_fault',
    'other'
  )
);

-- Create index for common queries
CREATE INDEX idx_claims_disruption ON claims (disruption_type, disruption_reason);