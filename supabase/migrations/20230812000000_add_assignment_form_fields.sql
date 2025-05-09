-- Add assignment form fields to claims table
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS assignment_form_signed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS assignment_form_url TEXT;

-- Create an index for faster queries filtering by assignment_form_signed
CREATE INDEX IF NOT EXISTS idx_claims_assignment_form_signed ON claims (assignment_form_signed);

-- Add policy to allow authenticated users to view assignment forms
CREATE POLICY "Users can view own assignment forms" ON claims
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add policy to allow admins to view all assignment forms
CREATE POLICY "Admins can view all assignment forms" ON claims
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())); 