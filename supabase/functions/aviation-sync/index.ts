/// <reference path="../deno-env.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js';
import { corsHeaders } from "../_shared/cors.ts";

const AVIATION_STACK_API_KEY = Deno.env.get('AVIATION_STACK_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Get port from arguments (default: 8000)
const port = parseInt(Deno.args.find((arg: string) => arg.startsWith("--port="))?.split("=")[1] || "8000");
console.log(`Starting Aviation Sync server on port ${port}...`);

interface AviationData {
  airlines: any[];
  airports: any[];
  cities: any[];
}

async function fetchAviationData(type: keyof AviationData): Promise<any[]> {
  const url = `https://api.aviationstack.com/v1/${type}?access_key=${AVIATION_STACK_API_KEY}&limit=100`;
  const response = await fetch(url);
  const data = await response.json();
  return data.data || [];
}

async function syncAviationData() {
  try {
    // Fetch data from Aviation Stack
    const [airlines, airports, cities] = await Promise.all([
      fetchAviationData('airlines'),
      fetchAviationData('airports'),
      fetchAviationData('cities'),
    ]);

    // Update Supabase tables
    await Promise.all([
      supabase.from('aviation_airlines').upsert(
        airlines.map(airline => ({
          iata_code: airline.iata_code,
          icao_code: airline.icao_code,
          name: airline.airline_name,
          country: airline.country_name,
          is_active: true,
          last_sync: new Date().toISOString(),
        }))
      ),
      supabase.from('aviation_airports').upsert(
        airports.map(airport => ({
          iata_code: airport.iata_code,
          icao_code: airport.icao_code,
          name: airport.airport_name,
          city: airport.city_name,
          country: airport.country_name,
          latitude: airport.latitude,
          longitude: airport.longitude,
          timezone: airport.timezone,
          is_active: true,
          last_sync: new Date().toISOString(),
        }))
      ),
      supabase.from('aviation_cities').upsert(
        cities.map(city => ({
          name: city.city_name,
          country: city.country_name,
          timezone: city.timezone,
          last_sync: new Date().toISOString(),
        }))
      ),
    ]);

    return { success: true };
  } catch (error: unknown) {
    console.error('Sync error:', error);
    throw error;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'airports';

    // Handle sync request
    if (url.pathname.endsWith('/sync')) {
      const result = await syncAviationData();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle search request
    let query = supabase.from(`aviation_${type}`).select('*');

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,iata_code.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Internal server error';
      
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}, { port });