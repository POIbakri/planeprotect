/*
  # Add email system tables

  1. New Tables
    - `email_templates`
      - Store email templates with variables
    - `sent_emails`
      - Track all sent emails
    - Add email preferences to profiles

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

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

-- Add email_preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_preferences jsonb DEFAULT '{
  "welcome": true,
  "claim_submitted": true,
  "claim_in_review": true,
  "claim_approved": true,
  "claim_paid": true,
  "account_confirmation": true,
  "password_reset": true,
  "marketing": true
}'::jsonb;

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates
CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Policies for sent_emails
CREATE POLICY "Users can view their own sent emails"
  ON sent_emails
  FOR SELECT
  TO authenticated
  USING (recipient IN (
    SELECT email FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can view all sent emails"
  ON sent_emails
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, description, variables) VALUES
  (
    'welcome',
    'Welcome to RefundHero!',
    '<!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome to RefundHero, {{name}}!</h1>
        <p>We''re excited to help you get the compensation you deserve for your flight delays and cancellations.</p>
        <p>Here''s what you can do with RefundHero:</p>
        <ul>
          <li>Check if your flight is eligible for compensation</li>
          <li>Submit claims easily with our guided process</li>
          <li>Track your claim status in real-time</li>
          <li>Get expert support throughout the process</li>
        </ul>
        <p>Ready to start? <a href="{{appUrl}}/dashboard">Visit your dashboard</a></p>
      </body>
    </html>',
    'Welcome email sent to new users',
    '["name", "appUrl"]'
  ),
  (
    'claim_submitted',
    'Your Claim Has Been Submitted Successfully',
    '<!DOCTYPE html>
    <html>
      <body>
        <h1>Thank you for your claim, {{name}}!</h1>
        <p>We''ve received your claim for flight {{flightNumber}} on {{flightDate}}.</p>
        <p>Claim Details:</p>
        <ul>
          <li>Claim ID: {{claimId}}</li>
          <li>Flight: {{flightNumber}}</li>
          <li>Date: {{flightDate}}</li>
          <li>Potential Compensation: €{{compensation}}</li>
        </ul>
        <p>What happens next?</p>
        <ol>
          <li>Our team will review your claim within 24-48 hours</li>
          <li>We''ll contact the airline on your behalf</li>
          <li>You''ll receive updates at each stage of the process</li>
        </ol>
        <p><a href="{{appUrl}}/claim/{{claimId}}">Track your claim status here</a></p>
      </body>
    </html>',
    'Confirmation email for new claims',
    '["name", "claimId", "flightNumber", "flightDate", "compensation", "appUrl"]'
  ),
  (
    'claim_in_review',
    'Your Claim is Being Reviewed',
    '<!DOCTYPE html>
    <html>
      <body>
        <h1>Good news, {{name}}!</h1>
        <p>Your claim (ID: {{claimId}}) is now being reviewed by the airline.</p>
        <p>We''re actively working with them to secure your compensation and will keep you updated on any developments.</p>
        <p><a href="{{appUrl}}/claim/{{claimId}}">View claim status</a></p>
      </body>
    </html>',
    'Email sent when claim enters review stage',
    '["name", "claimId", "appUrl"]'
  ),
  (
    'claim_approved',
    'Your Claim Has Been Approved! 🎉',
    '<!DOCTYPE html>
    <html>
      <body>
        <h1>Congratulations, {{name}}!</h1>
        <p>Your claim has been approved! The airline has agreed to pay compensation of €{{compensation}}.</p>
        <p>Next Steps:</p>
        <ul>
          <li>We''ll process the payment to your provided bank account</li>
          <li>This typically takes 5-7 business days</li>
          <li>You''ll receive another email once the payment is sent</li>
        </ul>
        <p><a href="{{appUrl}}/claim/{{claimId}}">View claim details</a></p>
      </body>
    </html>',
    'Email sent when claim is approved',
    '["name", "claimId", "compensation", "appUrl"]'
  ),
  (
    'claim_paid',
    'Payment Sent! 💰',
    '<!DOCTYPE html>
    <html>
      <body>
        <h1>Payment Sent, {{name}}!</h1>
        <p>We''ve transferred €{{compensation}} to your bank account.</p>
        <p>The payment should appear in your account within 2-3 business days.</p>
        <p>Thank you for choosing RefundHero. We hope you''ll recommend us to friends and family!</p>
        <p><a href="{{appUrl}}/dashboard">View your dashboard</a></p>
      </body>
    </html>',
    'Email sent when compensation is paid',
    '["name", "compensation", "appUrl"]'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_sent_emails_recipient ON sent_emails (recipient);
CREATE INDEX idx_sent_emails_template ON sent_emails (template);
CREATE INDEX idx_sent_emails_status ON sent_emails (status);
CREATE INDEX idx_sent_emails_created_at ON sent_emails (created_at DESC);