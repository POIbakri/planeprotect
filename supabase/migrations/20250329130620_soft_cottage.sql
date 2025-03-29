/*
  # Complete Database Schema

  1. Core Tables
    - profiles (user profiles)
    - claims (compensation claims)
    - claim_documents (claim attachments)
    - admins (admin users)
    - notifications (user notifications)

  2. Support Tables
    - email_templates (email templates)
    - sent_emails (email tracking)
    - audit_logs (system audit trail)
    - settings (system configuration)

  3. Aviation Data
    - aviation_airlines (airline information)
    - aviation_airports (airport information)
    - aviation_cities (city information)

  4. Security
    - RLS policies for all tables
    - Admin access controls
    - Document management policies
*/

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
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[\d\s-()]{8,}$')
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
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected'))
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

-- Create aviation tables
CREATE TABLE aviation_airlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iata_code text UNIQUE,
  icao_code text,
  name text NOT NULL,
  country text,
  is_active boolean DEFAULT true,
  last_sync timestamptz DEFAULT now()
);

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

CREATE TABLE aviation_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  timezone text,
  last_sync timestamptz DEFAULT now()
);

-- Enable Row Level Security
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

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Claims policies
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

-- Claim documents policies
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

-- Notifications policies
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

-- Email templates policies
CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Aviation data policies
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

-- Create indexes
CREATE INDEX idx_claims_user ON claims (user_id);
CREATE INDEX idx_claims_status ON claims (status);
CREATE INDEX idx_claims_flight ON claims (flight_number);
CREATE INDEX idx_claims_date ON claims (flight_date);
CREATE INDEX idx_documents_claim ON claim_documents (claim_id);
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE NOT read;
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_aviation_airlines_search ON aviation_airlines USING gin(to_tsvector('english', name || ' ' || iata_code));
CREATE INDEX idx_aviation_airports_search ON aviation_airports USING gin(to_tsvector('english', name || ' ' || city || ' ' || iata_code));

-- Create functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ language plpgsql security definer;

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

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

CREATE TRIGGER on_claim_status_update
  AFTER UPDATE OF status ON claims
  FOR EACH ROW
  EXECUTE PROCEDURE notify_claim_update();

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