/*
  # Add missing features

  1. New Tables
    - `user_sessions`
      - Track active sessions
    - `login_history`
      - Track login attempts
    - `user_devices`
      - Track trusted devices
    - `help_article_feedback`
      - Track article helpfulness
    - `help_search_logs`
      - Track search analytics

  2. Changes to Existing Tables
    - Add columns to `profiles`
      - Avatar URL
      - Language preferences
      - Address information
      - Marketing preferences
    - Add columns to `claim_documents`
      - Verification status
      - Expiration date
      - Document tags
*/

-- Add new columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_preferences jsonb DEFAULT '{
  "email_marketing": false,
  "sms_marketing": false,
  "push_marketing": false
}'::jsonb;

-- Add new columns to claim_documents
ALTER TABLE claim_documents 
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD CONSTRAINT valid_verification_status 
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Create user_sessions table
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_active_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  device_id uuid REFERENCES user_devices(id),
  is_active boolean DEFAULT true
);

-- Create login_history table
CREATE TABLE login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  ip_address text NOT NULL,
  user_agent text,
  status text NOT NULL,
  failure_reason text,
  CONSTRAINT valid_status CHECK (status IN ('success', 'failure'))
);

-- Create user_devices table
CREATE TABLE user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  type text NOT NULL,
  last_used_at timestamptz DEFAULT now(),
  is_trusted boolean DEFAULT false,
  fingerprint text UNIQUE NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create help_article_feedback table
CREATE TABLE help_article_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES help_articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  is_helpful boolean NOT NULL,
  comment text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create help_search_logs table
CREATE TABLE help_search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  query text NOT NULL,
  results_count integer,
  selected_result uuid REFERENCES help_articles(id),
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_search_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own login history"
  ON login_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own devices"
  ON user_devices FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can submit article feedback"
  ON help_article_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_user_id uuid,
  p_status text,
  p_failure_reason text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO login_history (
    user_id,
    status,
    failure_reason,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_status,
    p_failure_reason,
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent'
  );
END;
$$;

-- Indexes
CREATE INDEX idx_user_sessions_user ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions (user_id, is_active);
CREATE INDEX idx_login_history_user ON login_history (user_id);
CREATE INDEX idx_user_devices_user ON user_devices (user_id);
CREATE INDEX idx_help_feedback_article ON help_article_feedback (article_id);
CREATE INDEX idx_help_search_query ON help_search_logs USING gin (to_tsvector('english', query));