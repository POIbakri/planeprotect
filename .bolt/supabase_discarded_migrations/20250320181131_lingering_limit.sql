/*
  # Complete Schema Enhancement

  1. New Tables
    - `audit_logs`
      - Track all important system actions
    - `api_keys`
      - For external integrations
    - `settings`
      - System-wide configuration
    - `feedback`
      - User feedback and ratings

  2. Security
    - Enhanced RLS policies
    - Audit logging
    - API key management

  3. Features
    - System configuration
    - Feedback management
    - Activity tracking
*/

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

-- Create api_keys table
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  permissions jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true
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

-- Create feedback table
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  claim_id uuid REFERENCES claims(id),
  rating integer NOT NULL,
  comment text,
  status text DEFAULT 'pending',
  response text,
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'reviewed', 'responded'))
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- API keys policies
CREATE POLICY "Admins can manage API keys"
  ON api_keys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Settings policies
CREATE POLICY "Anyone can view public settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Admins can manage all settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Feedback policies
CREATE POLICY "Users can view own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can respond to feedback"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

CREATE INDEX idx_api_keys_hash ON api_keys (key_hash);
CREATE INDEX idx_api_keys_active ON api_keys (is_active);
CREATE INDEX idx_api_keys_expires ON api_keys (expires_at);

CREATE INDEX idx_settings_key ON settings (key);
CREATE INDEX idx_settings_category ON settings (category);
CREATE INDEX idx_settings_public ON settings (is_public);

CREATE INDEX idx_feedback_user_id ON feedback (user_id);
CREATE INDEX idx_feedback_claim_id ON feedback (claim_id);
CREATE INDEX idx_feedback_rating ON feedback (rating);
CREATE INDEX idx_feedback_status ON feedback (status);

-- Functions
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  )
  VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ language plpgsql security definer;

-- Audit triggers
CREATE TRIGGER audit_claims
  AFTER INSERT OR UPDATE OR DELETE ON claims
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event('claim_action');

CREATE TRIGGER audit_claim_documents
  AFTER INSERT OR UPDATE OR DELETE ON claim_documents
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event('document_action');

CREATE TRIGGER audit_settings
  AFTER INSERT OR UPDATE OR DELETE ON settings
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event('settings_action');

CREATE TRIGGER audit_api_keys
  AFTER INSERT OR UPDATE OR DELETE ON api_keys
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event('api_key_action');

-- Initial settings
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