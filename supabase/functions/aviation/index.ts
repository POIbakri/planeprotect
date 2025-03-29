/// <reference path="../deno-env.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js';
import { corsHeaders } from "../_shared/cors.ts";

const AVIATION_STACK_API_KEY = Deno.env.get('AVIATION_STACK_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Get port from arguments (default: 8000)
const port = parseInt(Deno.args.find((arg: string) => arg.startsWith("--port="))?.split("=")[1] || "8000");
console.log(`Starting Aviation API server on port ${port}...`);

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const flightNumber = url.searchParams.get('flight_iata');
    const flightDate = url.searchParams.get('flight_date');

    if (!flightNumber || !flightDate) {
      throw new Error('Missing required parameters');
    }

    // First check our database
    const { data: dbFlights, error: dbError } = await supabase
      .from('aviation_flights')
      .select('*')
      .eq('flight_number', flightNumber)
      .eq('flight_date', flightDate)
      .single();

    if (dbFlights) {
      return new Response(JSON.stringify(dbFlights), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If not in database, fetch from Aviation Stack
    const aviationStackUrl = new URL('http://api.aviationstack.com/v1/flights');
    aviationStackUrl.searchParams.append('access_key', AVIATION_STACK_API_KEY);
    aviationStackUrl.searchParams.append('flight_iata', flightNumber);
    aviationStackUrl.searchParams.append('flight_date', flightDate);

    const response = await fetch(aviationStackUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Aviation Stack API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result in our database
    if (data.data?.[0]) {
      await supabase
        .from('aviation_flights')
        .upsert({
          flight_number: flightNumber,
          flight_date: flightDate,
          data: data.data[0],
        });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Aviation API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Internal server error';

    return new Response(
      JSON.stringify({
        error: {
          message: errorMessage,
          code: 'AVIATION_API_ERROR',
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}, { port });