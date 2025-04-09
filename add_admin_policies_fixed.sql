-- Check existing policies and only create what's needed
DO $$
BEGIN
  -- 1. Policy for admins to view own admin status (check first for existence)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins' 
    AND policyname = 'Users can view own admin status'
  ) THEN
    RAISE NOTICE 'Creating policy: Users can view own admin status';
    CREATE POLICY "Users can view own admin status"
      ON admins FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  ELSE
    RAISE NOTICE 'Policy already exists: Users can view own admin status';
  END IF;

  -- 2. Policy for admins to manage claim documents (uses ALL instead of separate operations)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'claim_documents' 
    AND policyname = 'Admins can manage claim documents'
  ) THEN
    RAISE NOTICE 'Creating policy: Admins can manage claim documents';
    CREATE POLICY "Admins can manage claim documents"
      ON claim_documents FOR ALL
      TO authenticated
      USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
  ELSE
    RAISE NOTICE 'Policy already exists: Admins can manage claim documents';
  END IF;

  -- 3. Update the claim policy to ensure it works correctly (recreate)
  RAISE NOTICE 'Updating policy: Admins can view all claims';
  DROP POLICY IF EXISTS "Admins can view all claims" ON claims;
  CREATE POLICY "Admins can view all claims"
    ON claims FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

  -- 4. Ensure admins table has proper policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins'
    AND policyname = 'Admins can view all admins'
  ) THEN
    RAISE NOTICE 'Creating policy: Admins can view all admins';
    CREATE POLICY "Admins can view all admins"
      ON admins FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
  ELSE
    RAISE NOTICE 'Policy already exists: Admins can view all admins';
  END IF;

END $$;

-- Check the final policy configuration
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Run a query to directly check if admin can see claims
SELECT count(*) FROM claims; 