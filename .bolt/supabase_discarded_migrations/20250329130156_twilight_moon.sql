/*
  # Complete Schema Setup with RLS

  1. Tables
    - `profiles`
      - User profile information
      - Linked to auth.users
    - `notifications`
      - User notifications
      - System and claim updates

  2. Security
    - Enable RLS on all tables
    - Implement policies for:
      - User data access
      - Admin access
      - Document management
      - Notification handling
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text,
  phone text,
  email text UNIQUE NOT NULL,
  preferred_language text DEFAULT 'en',
  notification_preferences jsonb DEFAULT '{"email": true, "push": true}'::jsonb,
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[\d\s-()]{8,}$')
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
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

-- Add RLS to profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add RLS to notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification read status"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    (OLD.read IS DISTINCT FROM NEW.read) AND
    (OLD.* IS NOT DISTINCT FROM NEW.* OR OLD.read IS DISTINCT FROM NEW.read)
  );

-- Enhanced claims policies
CREATE POLICY "Users can view own claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update claims"
  ON claims
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Enhanced claim documents policies
CREATE POLICY "Users can view own documents"
  ON claim_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_documents.claim_id
      AND claims.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload own documents"
  ON claim_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_documents.claim_id
      AND claims.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents"
  ON claim_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE NOT read;

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_updated_at ON profiles (updated_at DESC);

-- Functions for claim status updates
CREATE OR REPLACE FUNCTION notify_claim_update()
RETURNS trigger AS $$
DECLARE
  claim_user_id uuid;
BEGIN
  -- Get the user_id from the claim
  SELECT user_id INTO claim_user_id FROM claims WHERE id = NEW.id;

  -- Only proceed if status has changed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    )
    VALUES (
      claim_user_id,
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

-- Create trigger for claim status updates
CREATE TRIGGER on_claim_status_update
  AFTER UPDATE OF status ON claims
  FOR EACH ROW
  EXECUTE FUNCTION notify_claim_update();