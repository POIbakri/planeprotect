/*
  # Add Aviation Data Tables

  1. New Tables
    - `aviation_airlines`
      - Airline information from Aviation Stack
    - `aviation_airports`
      - Airport information from Aviation Stack
    - `aviation_cities`
      - City information from Aviation Stack

  2. Security
    - Enable RLS
    - Add policies for read access
*/

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

-- Enable RLS
ALTER TABLE aviation_airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviation_airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviation_cities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to aviation_airlines"
  ON aviation_airlines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to aviation_airports"
  ON aviation_airports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to aviation_cities"
  ON aviation_cities
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for search
CREATE INDEX idx_airlines_search ON aviation_airlines 
  USING gin(to_tsvector('english', name || ' ' || iata_code || ' ' || country));

CREATE INDEX idx_airports_search ON aviation_airports 
  USING gin(to_tsvector('english', name || ' ' || iata_code || ' ' || city || ' ' || country));

CREATE INDEX idx_cities_search ON aviation_cities 
  USING gin(to_tsvector('english', name || ' ' || country));

-- Create function to update last_sync
CREATE OR REPLACE FUNCTION update_last_sync()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_sync = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers
CREATE TRIGGER update_airlines_last_sync
  BEFORE UPDATE ON aviation_airlines
  FOR EACH ROW
  EXECUTE FUNCTION update_last_sync();

CREATE TRIGGER update_airports_last_sync
  BEFORE UPDATE ON aviation_airports
  FOR EACH ROW
  EXECUTE FUNCTION update_last_sync();

CREATE TRIGGER update_cities_last_sync
  BEFORE UPDATE ON aviation_cities
  FOR EACH ROW
  EXECUTE FUNCTION update_last_sync();