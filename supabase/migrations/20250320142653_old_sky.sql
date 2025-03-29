/*
  # Create claims and documents tables

  1. New Tables
    - `claims`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `flight_number` (text)
      - `flight_date` (date)
      - `passenger_name` (text)
      - `email` (text)
      - `phone` (text)
      - `passport_number` (text)
      - `compensation_amount` (numeric)
      - `status` (text)
      - `user_id` (uuid, references auth.users)
    
    - `claim_documents`
      - `id` (uuid, primary key)
      - `claim_id` (uuid, references claims)
      - `type` (text)
      - `file_path` (text)
      - `uploaded_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own claims and documents
*/

-- Create claims table
CREATE TABLE claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  flight_number text NOT NULL,
  flight_date date NOT NULL,
  passenger_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  passport_number text NOT NULL,
  compensation_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  user_id uuid REFERENCES auth.users(id),
  CONSTRAINT status_values CHECK (status IN ('pending', 'in-review', 'approved', 'paid'))
);

-- Create claim_documents table
CREATE TABLE claim_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid REFERENCES claims(id) ON DELETE CASCADE,
  type text NOT NULL,
  file_path text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT type_values CHECK (type IN ('boarding_pass', 'booking_confirmation', 'passport'))
);

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for claims
CREATE POLICY "Users can view their own claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for claim_documents
CREATE POLICY "Users can view their own documents"
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

CREATE POLICY "Users can insert their own documents"
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