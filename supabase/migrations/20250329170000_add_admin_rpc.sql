-- Drop existing function first to avoid return type conflict
DROP FUNCTION IF EXISTS get_all_claims_admin(
  INT, INT, TEXT, TEXT, DATE, DATE, TEXT, TEXT
);

-- Ensure hardcoded admin users exist in the database
DO $$
BEGIN
  -- Insert the hardcoded admin users if they don't exist
  IF NOT EXISTS (SELECT 1 FROM admins WHERE user_id = 'bade31d2-c74d-4da4-ac50-b143b0220106') THEN
    INSERT INTO admins (user_id, permissions) 
    VALUES ('bade31d2-c74d-4da4-ac50-b143b0220106', '{"superadmin": true}'::jsonb);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM admins WHERE user_id = '179a0c8f-6239-44ed-976e-652c81bd7e3d') THEN
    INSERT INTO admins (user_id, permissions) 
    VALUES ('179a0c8f-6239-44ed-976e-652c81bd7e3d', '{"superadmin": true}'::jsonb);
  END IF;
END
$$;

-- Add RPC function to allow admins to get all claims with filtering and pagination
CREATE OR REPLACE FUNCTION get_all_claims_admin(
  page_num INT DEFAULT 1,
  page_size INT DEFAULT 10,
  filter_status TEXT DEFAULT NULL,
  filter_search TEXT DEFAULT NULL,
  filter_start_date DATE DEFAULT NULL,
  filter_end_date DATE DEFAULT NULL,
  sort_field TEXT DEFAULT 'created_at',
  sort_dir TEXT DEFAULT 'desc'
)
RETURNS SETOF json AS $$
DECLARE
  v_limit INT := page_size;
  v_offset INT := (page_num - 1) * page_size;
  v_total_count INT;
  v_is_admin BOOLEAN;
  v_query TEXT;
  v_order_by TEXT;
  v_claim record;
  v_result record;
  v_claim_docs json;
  v_user_id TEXT;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid()::text;
  
  -- Check if the user is an admin (including hardcoded IDs for backward compatibility)
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  ) OR v_user_id = 'bade31d2-c74d-4da4-ac50-b143b0220106' 
     OR v_user_id = '179a0c8f-6239-44ed-976e-652c81bd7e3d'
  INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'User is not authorized to call this function';
  END IF;

  -- Build the ORDER BY clause
  v_order_by := format(' ORDER BY %I %s', sort_field, sort_dir);
  
  -- Build the dynamic query with all possible filters
  v_query := '
    WITH filtered_claims AS (
      SELECT c.*
      FROM claims c
      WHERE 1=1';
      
  -- Add filters if provided
  IF filter_status IS NOT NULL THEN
    v_query := v_query || ' AND c.status = ' || quote_literal(filter_status);
  END IF;
  
  IF filter_search IS NOT NULL THEN
    v_query := v_query || ' AND (
      c.flight_number ILIKE ' || quote_literal('%' || filter_search || '%') || '
      OR c.passenger_name ILIKE ' || quote_literal('%' || filter_search || '%') || '
      OR c.email ILIKE ' || quote_literal('%' || filter_search || '%') || '
    )';
  END IF;
  
  IF filter_start_date IS NOT NULL THEN
    v_query := v_query || ' AND c.flight_date >= ' || quote_literal(filter_start_date);
  END IF;
  
  IF filter_end_date IS NOT NULL THEN
    v_query := v_query || ' AND c.flight_date <= ' || quote_literal(filter_end_date);
  END IF;
  
  -- Get total count for pagination
  EXECUTE v_query || ')
    SELECT COUNT(*) FROM filtered_claims' INTO v_total_count;
  
  -- Execute the main query with pagination
  FOR v_claim IN EXECUTE v_query || ')
    SELECT c.*
    FROM filtered_claims c' 
    || v_order_by || '
    LIMIT ' || v_limit || '
    OFFSET ' || v_offset
  LOOP
    -- Get documents for each claim
    SELECT json_agg(cd.*)
    FROM claim_documents cd
    WHERE cd.claim_id = v_claim.id
    INTO v_claim_docs;
    
    -- Return the results as JSON
    RETURN NEXT json_build_object(
      'claim_data', json_build_object(
        'id', v_claim.id,
        'created_at', v_claim.created_at,
        'updated_at', v_claim.updated_at,
        'user_id', v_claim.user_id,
        'flight_number', v_claim.flight_number,
        'flight_date', v_claim.flight_date,
        'passenger_name', v_claim.passenger_name,
        'email', v_claim.email,
        'phone', v_claim.phone,
        'passport_number', v_claim.passport_number,
        'compensation_amount', v_claim.compensation_amount,
        'status', v_claim.status,
        'disruption_type', v_claim.disruption_type,
        'disruption_reason', v_claim.disruption_reason,
        'delay_duration', v_claim.delay_duration,
        'bank_name', v_claim.bank_name,
        'bank_account', v_claim.bank_account,
        'bank_holder', v_claim.bank_holder,
        'claim_documents', COALESCE(v_claim_docs, '[]'::json)
      ),
      'total_count', v_total_count
    );
  END LOOP;
  
  -- If no claims found, return empty result with count 0
  IF NOT FOUND THEN
    RETURN NEXT json_build_object(
      'claim_data', '{}'::json,
      'total_count', v_total_count
    );
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION get_all_claims_admin TO authenticated;

-- Make sure service_role has necessary permissions
GRANT EXECUTE ON FUNCTION get_all_claims_admin TO service_role;

-- Update or create RLS policies for admin access to claims and documents
DO $$
BEGIN
  -- Ensure admins can view all claims
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'claims' 
    AND policyname = 'Admins can view all claims'
  ) THEN
    CREATE POLICY "Admins can view all claims"
      ON claims FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
  END IF;

  -- Ensure admins can update claims
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'claims' 
    AND policyname = 'Admins can update claims'
  ) THEN
    CREATE POLICY "Admins can update claims"
      ON claims FOR UPDATE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
  END IF;

  -- Ensure admins can view all claim documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'claim_documents' 
    AND policyname = 'Admins can view all claim documents'
  ) THEN
    CREATE POLICY "Admins can view all claim documents"
      ON claim_documents FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
  END IF;
END $$; 