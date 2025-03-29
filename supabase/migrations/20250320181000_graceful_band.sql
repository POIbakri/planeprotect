/*
  # Add updated_at column and trigger

  1. Changes
    - Add `updated_at` column to `claims` table
    - Add trigger to automatically update `updated_at` timestamp
*/

ALTER TABLE claims ADD COLUMN updated_at timestamptz DEFAULT now();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();