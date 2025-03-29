-- Initial Schema Setup for RefundHero
-- This migration creates all necessary tables, functions, triggers, and policies

/*
  Table of Contents:
  1. Core Tables
    - profiles
    - claims
    - claim_documents
    - admins
    - notifications
  2. Email System
    - email_templates
    - sent_emails
  3. Aviation Data
    - aviation_airlines
    - aviation_airports
    - aviation_cities
    - aviation_flights
  4. System Tables
    - audit_logs
    - settings
  5. Functions & Triggers
  6. Policies
  7. Indexes
  8. Initial Data
*/

-- Disable triggers temporarily for bulk operations
SET session_replication_role = replica;

--[ 1. Core Tables ]--

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text,
  phone text,
  email text UNIQUE NOT NULL,
  preferred_language text DEFAULT 'en',
  avatar_url text,
  address jsonb DEFAULT '{}'::jsonb,
  notification_preferences jsonb DEFAULT '{
    "email": true,
    "push": true,
    "claim_updates": true,
    "marketing": false
  }'::jsonb,
  marketing_preferences jsonb DEFAULT '{
    "email": false,
    "sms": false,
    "push": false
  }'::jsonb,
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[\d\s-()]{8,}$'),
  CONSTRAINT valid_email CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT valid_language CHECK (preferred_language ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

-- Create claims table
CREATE TABLE claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_number text NOT NULL,
  flight_date date NOT NULL,
  passenger_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  passport_number text NOT NULL,
  compensation_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  disruption_type text NOT NULL DEFAULT 'delay',
  disruption_reason text,
  delay_duration integer,
  bank_name text,
  bank_account text,
  bank_holder text,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in-review', 'approved', 'paid')),
  CONSTRAINT valid_disruption_type CHECK (disruption_type IN ('delay', 'cancellation')),
  CONSTRAINT valid_disruption_reason CHECK (
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
  ),
  CONSTRAINT valid_flight_number CHECK (flight_number ~ '^[A-Z]{2}\d{1,4}$'),
  CONSTRAINT valid_compensation_amount CHECK (compensation_amount >= 0 AND compensation_amount <= 600),
  CONSTRAINT valid_delay_duration CHECK (
    (disruption_type = 'delay' AND delay_duration >= 3) OR
    (disruption_type = 'cancellation' AND delay_duration IS NULL)
  )
);

-- Create claim_documents table
CREATE TABLE claim_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  claim_id uuid REFERENCES claims(id) ON DELETE CASCADE,
  type text NOT NULL,
  file_path text NOT NULL,
  verification_status text DEFAULT 'pending',
  expires_at timestamptz,
  tags text[] DEFAULT '{}',
  CONSTRAINT valid_type CHECK (type IN ('boarding_pass', 'booking_confirmation', 'passport')),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  CONSTRAINT valid_file_path CHECK (file_path ~ '^[a-zA-Z0-9\-_/\.]+$'),
  CONSTRAINT valid_file_extension CHECK (file_path ~ '\.(pdf|jpg|jpeg|png)$')
);

-- Create admins table
CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  permissions jsonb DEFAULT '{}'::jsonb
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_type CHECK (type IN ('claim_update', 'system', 'payment'))
);

--[ 2. Email System ]--

-- Create email_templates table
CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  description text,
  variables jsonb DEFAULT '[]'::jsonb,
  last_modified_by uuid REFERENCES auth.users(id)
);

-- Create sent_emails table
CREATE TABLE sent_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  template text NOT NULL,
  recipient text NOT NULL,
  subject text,
  status text NOT NULL,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb
);

--[ 3. Aviation Data ]--

-- Create aviation_airlines table
CREATE TABLE aviation_airlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iata_code text UNIQUE,
  icao_code text,
  name text NOT NULL,
  country text,
  is_active boolean DEFAULT true,
  last_sync timestamptz DEFAULT now()
);

-- Create aviation_airports table
CREATE TABLE aviation_airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iata_code text UNIQUE,
  icao_code text,
  name text NOT NULL,
  city text,
  country text,
  latitude numeric,
  longitude numeric,
  timezone text,
  is_active boolean DEFAULT true,
  last_sync timestamptz DEFAULT now()
);

-- Create aviation_cities table
CREATE TABLE aviation_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  timezone text,
  last_sync timestamptz DEFAULT now()
);

-- Create aviation_flights table
CREATE TABLE aviation_flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  flight_number text NOT NULL,
  flight_date date NOT NULL,
  data jsonb NOT NULL,
  last_sync timestamptz DEFAULT now(),
  UNIQUE(flight_number, flight_date)
);

--[ 4. System Tables ]--

-- Create audit_logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_action CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'admin_action'))
);

-- Create settings table
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  category text NOT NULL,
  is_public boolean DEFAULT false,
  last_modified_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_category CHECK (category IN ('system', 'claims', 'notifications', 'security'))
);

--[ 5. Functions & Triggers ]--

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create new user handler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create claim notification handler
CREATE OR REPLACE FUNCTION notify_claim_update()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    )
    VALUES (
      NEW.user_id,
      'claim_update',
      'Claim Status Updated',
      CASE NEW.status
        WHEN 'approved' THEN 'Your claim has been approved!'
        WHEN 'paid' THEN 'Your compensation has been paid'
        WHEN 'in-review' THEN 'Your claim is being reviewed'
        ELSE 'Your claim status has been updated'
      END,
      jsonb_build_object(
        'claim_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create document verification handler
CREATE OR REPLACE FUNCTION handle_document_verification()
RETURNS trigger AS $$
BEGIN
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

-- Create compensation validation function
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

-- Create flight data cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_flight_data()
RETURNS void AS $$
BEGIN
  DELETE FROM aviation_flights
  WHERE flight_date < now() - interval '3 months';
END;
$$ language plpgsql security definer;

-- Create triggers
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE handle_new_user();

CREATE TRIGGER on_claim_status_update
  AFTER UPDATE OF status ON claims
  FOR EACH ROW
  EXECUTE PROCEDURE notify_claim_update();

CREATE TRIGGER on_document_verification
  AFTER UPDATE OF verification_status ON claim_documents
  FOR EACH ROW
  EXECUTE FUNCTION handle_document_verification();

CREATE TRIGGER validate_claim_compensation
  BEFORE INSERT OR UPDATE OF compensation_amount ON claims
  FOR EACH ROW
  EXECUTE FUNCTION validate_compensation_amount();

--[ 6. Enable RLS & Create Policies ]--

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviation_airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviation_airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviation_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviation_flights ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims"
  ON claims FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own documents"
  ON claim_documents FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM claims
    WHERE claims.id = claim_documents.claim_id
    AND claims.user_id = auth.uid()
  ));

CREATE POLICY "Users can upload own documents"
  ON claim_documents FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM claims
    WHERE claims.id = claim_documents.claim_id
    AND claims.user_id = auth.uid()
  ));

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification read status"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    (OLD.read IS DISTINCT FROM NEW.read) AND
    (OLD.* IS NOT DISTINCT FROM NEW.* OR OLD.read IS DISTINCT FROM NEW.read)
  );

CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read aviation data"
  ON aviation_airlines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read airport data"
  ON aviation_airports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read city data"
  ON aviation_cities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read flight data"
  ON aviation_flights FOR SELECT
  TO authenticated
  USING (true);

--[ 7. Create Indexes ]--

-- Core table indexes
CREATE INDEX idx_claims_user ON claims (user_id);
CREATE INDEX idx_claims_status ON claims (status);
CREATE INDEX idx_claims_flight ON claims (flight_number);
CREATE INDEX idx_claims_date ON claims (flight_date);
CREATE INDEX idx_claims_user_status ON claims (user_id, status);
CREATE INDEX idx_claims_user_date ON claims (user_id, flight_date DESC);

CREATE INDEX idx_documents_claim ON claim_documents (claim_id);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE NOT read;
CREATE INDEX idx_notifications_user_read ON notifications (user_id, read);

-- Aviation indexes
CREATE INDEX idx_aviation_airlines_search 
  ON aviation_airlines USING gin(to_tsvector('english', name || ' ' || iata_code));
CREATE INDEX idx_aviation_airports_search 
  ON aviation_airports USING gin(to_tsvector('english', name || ' ' || city || ' ' || iata_code));
CREATE INDEX idx_aviation_flights_lookup ON aviation_flights (flight_number, flight_date);
CREATE INDEX idx_aviation_flights_date ON aviation_flights (flight_date);

-- System table indexes
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- Full text search
CREATE INDEX idx_claims_search ON claims 
  USING gin(to_tsvector('english', 
    coalesce(flight_number, '') || ' ' || 
    coalesce(passenger_name, '') || ' ' || 
    coalesce(email, '')
  ));

--[ 8. Insert Initial Data ]--

-- Insert initial settings
INSERT INTO settings (key, value, description, category, is_public) VALUES
  ('max_claim_amount', '600', 'Maximum compensation amount in EUR', 'claims', true),
  ('min_delay_hours', '3', 'Minimum delay hours for eligibility', 'claims', true),
  ('allowed_file_types', '["pdf", "jpg", "png"]', 'Allowed document file types', 'claims', true),
  ('max_file_size', '10485760', 'Maximum file size in bytes (10MB)', 'claims', true),
  ('notification_types', '["email", "push"]', 'Available notification channels', 'notifications', true),
  ('support_email', '"support@refundhero.com"', 'Support email address', 'system', true),
  ('maintenance_mode', 'false', 'System maintenance mode', 'system', false),
  ('rate_limit_window', '60000', 'Rate limit window in milliseconds', 'security', false),
  ('max_login_attempts', '5', 'Maximum failed login attempts', 'security', false),
  ('session_timeout', '3600', 'Session timeout in seconds', 'security', false);

-- Re-enable triggers
SET session_replication_role = DEFAULT;