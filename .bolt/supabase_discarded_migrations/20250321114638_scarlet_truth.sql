/*
  # Add Password Reset and Help Center Tables

  1. New Tables
    - `password_reset_requests`
      - Track password reset requests
      - Store reset tokens and expiration
    - `help_articles`
      - Store help center articles and FAQs
      - Categorized content management
    - `help_categories`
      - Organize help articles
    - `support_tickets`
      - Track user support requests
      - Link to claims if applicable

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
    - Add admin management policies

  3. Functions
    - Password reset token management
    - Support ticket status updates
*/

-- Create help_categories table
CREATE TABLE help_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Create help_articles table
CREATE TABLE help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  category_id uuid REFERENCES help_categories(id),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  keywords text[],
  author_id uuid REFERENCES auth.users(id),
  is_published boolean DEFAULT false,
  published_at timestamptz,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0
);

-- Create support_tickets table
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  claim_id uuid REFERENCES claims(id),
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolution_notes text,
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create support_ticket_messages table
CREATE TABLE support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  is_internal boolean DEFAULT false
);

-- Create password_reset_requests table
CREATE TABLE password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Help categories policies
CREATE POLICY "Help categories are viewable by everyone"
  ON help_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage help categories"
  ON help_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Help articles policies
CREATE POLICY "Published help articles are viewable by everyone"
  ON help_articles
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage help articles"
  ON help_articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Support tickets policies
CREATE POLICY "Users can view own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Support ticket messages policies
CREATE POLICY "Users can view messages for own tickets"
  ON support_ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for own tickets"
  ON support_ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all ticket messages"
  ON support_ticket_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Password reset requests policies
CREATE POLICY "Users can view own reset requests"
  ON password_reset_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION create_password_reset_token(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  reset_token text;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Generate token
  reset_token := encode(gen_random_bytes(32), 'hex');

  -- Insert reset request
  INSERT INTO password_reset_requests (
    user_id,
    token,
    expires_at,
    ip_address,
    user_agent
  ) VALUES (
    user_id,
    reset_token,
    now() + interval '1 hour',
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent'
  );

  RETURN reset_token;
END;
$$;

-- Create indexes
CREATE INDEX idx_help_articles_category ON help_articles (category_id);
CREATE INDEX idx_help_articles_slug ON help_articles (slug);
CREATE INDEX idx_help_articles_published ON help_articles (is_published, published_at);
CREATE INDEX idx_support_tickets_user ON support_tickets (user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets (status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets (assigned_to);
CREATE INDEX idx_ticket_messages_ticket ON support_ticket_messages (ticket_id);
CREATE INDEX idx_password_reset_token ON password_reset_requests (token);
CREATE INDEX idx_password_reset_user ON password_reset_requests (user_id);

-- Update functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_help_categories_updated_at
  BEFORE UPDATE ON help_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at
  BEFORE UPDATE ON help_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial help categories
INSERT INTO help_categories (name, slug, description, icon, display_order) VALUES
  ('Getting Started', 'getting-started', 'Learn the basics of using RefundHero', 'book-open', 1),
  ('Claims Process', 'claims-process', 'Understanding how claims work', 'file-text', 2),
  ('Eligibility', 'eligibility', 'Check if your flight qualifies', 'check-circle', 3),
  ('Payments', 'payments', 'Information about compensation payments', 'credit-card', 4),
  ('Account Management', 'account', 'Managing your RefundHero account', 'user', 5),
  ('Technical Support', 'support', 'Technical help and troubleshooting', 'help-circle', 6);

-- Insert initial help articles
INSERT INTO help_articles (
  category_id,
  title,
  slug,
  content,
  excerpt,
  is_published,
  published_at
) VALUES
  (
    (SELECT id FROM help_categories WHERE slug = 'getting-started'),
    'Welcome to RefundHero',
    'welcome',
    '# Welcome to RefundHero

RefundHero helps you claim compensation for flight delays, cancellations, and overbooking under EU Regulation 261/2004.

## How it works

1. Enter your flight details
2. We check your eligibility
3. Submit your claim with required documents
4. We handle all communication with the airline
5. Receive your compensation

## Getting Started

To start your claim:

1. Create an account
2. Enter your flight information
3. Upload required documents
4. Track your claim status
5. Get paid when successful',
    'Learn how RefundHero helps you get compensation for flight disruptions',
    true,
    now()
  );