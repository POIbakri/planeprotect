-- Create aviation_flights table for caching flight data
CREATE TABLE aviation_flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  flight_number text NOT NULL,
  flight_date date NOT NULL,
  data jsonb NOT NULL,
  last_sync timestamptz DEFAULT now(),
  UNIQUE(flight_number, flight_date)
);

-- Add missing updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS to aviation_flights
ALTER TABLE aviation_flights ENABLE ROW LEVEL SECURITY;

-- Add policy for aviation_flights
CREATE POLICY "Anyone can read flight data"
  ON aviation_flights FOR SELECT
  TO authenticated
  USING (true);

-- Add indexes for aviation_flights
CREATE INDEX idx_aviation_flights_lookup ON aviation_flights (flight_number, flight_date);
CREATE INDEX idx_aviation_flights_date ON aviation_flights (flight_date);

-- Add function to clean old flight data
CREATE OR REPLACE FUNCTION cleanup_old_flight_data()
RETURNS void AS $$
BEGIN
  DELETE FROM aviation_flights
  WHERE flight_date < now() - interval '3 months';
END;
$$ language plpgsql security definer;

-- Add better constraints to claims table
ALTER TABLE claims
  ADD CONSTRAINT valid_flight_number CHECK (flight_number ~ '^[A-Z]{2}\d{1,4}$'),
  ADD CONSTRAINT valid_compensation_amount CHECK (compensation_amount >= 0 AND compensation_amount <= 600),
  ADD CONSTRAINT valid_delay_duration CHECK (
    (disruption_type = 'delay' AND delay_duration >= 3) OR
    (disruption_type = 'cancellation' AND delay_duration IS NULL)
  );

-- Add better constraints to claim_documents
ALTER TABLE claim_documents
  ADD CONSTRAINT valid_file_path CHECK (file_path ~ '^[a-zA-Z0-9\-_/\.]+$'),
  ADD CONSTRAINT valid_file_extension CHECK (
    file_path ~ '\.(pdf|jpg|jpeg|png)$'
  );

-- Add better constraints to profiles
ALTER TABLE profiles
  ADD CONSTRAINT valid_email CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT valid_language CHECK (preferred_language ~ '^[a-z]{2}(-[A-Z]{2})?$');

-- Add composite indexes for common queries
CREATE INDEX idx_claims_user_status ON claims (user_id, status);
CREATE INDEX idx_claims_user_date ON claims (user_id, flight_date DESC);
CREATE INDEX idx_notifications_user_read ON notifications (user_id, read);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- Add full text search indexes
CREATE INDEX idx_claims_search ON claims 
  USING gin(to_tsvector('english', 
    coalesce(flight_number, '') || ' ' || 
    coalesce(passenger_name, '') || ' ' || 
    coalesce(email, '')
  ));

-- Add function to handle claim document verification
CREATE OR REPLACE FUNCTION handle_document_verification()
RETURNS trigger AS $$
BEGIN
  -- Update claim status to in-review when all required documents are verified
  IF EXISTS (
    SELECT 1 FROM claim_documents
    WHERE claim_id = NEW.claim_id
    GROUP BY claim_id
    HAVING count(*) FILTER (WHERE verification_status = 'verified') = 3
  ) THEN
    UPDATE claims
    SET status = 'in-review'
    WHERE id = NEW.claim_id
    AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Add trigger for document verification
CREATE TRIGGER on_document_verification
  AFTER UPDATE OF verification_status ON claim_documents
  FOR EACH ROW
  EXECUTE FUNCTION handle_document_verification();

-- Add function to validate compensation amount
CREATE OR REPLACE FUNCTION validate_compensation_amount()
RETURNS trigger AS $$
BEGIN
  IF NEW.compensation_amount > (
    SELECT (value::jsonb->>'max_amount')::numeric 
    FROM settings 
    WHERE key = 'max_claim_amount'
  ) THEN
    RAISE EXCEPTION 'Compensation amount exceeds maximum allowed';
  END IF;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Add trigger for compensation validation
CREATE TRIGGER validate_claim_compensation
  BEFORE INSERT OR UPDATE OF compensation_amount ON claims
  FOR EACH ROW
  EXECUTE FUNCTION validate_compensation_amount();