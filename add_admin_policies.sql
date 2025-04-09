-- Add policy to allow admins to view all claim documents
CREATE POLICY "Admins can view all claim documents"
  ON claim_documents FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Add policy for admins to manage claim documents
CREATE POLICY "Admins can manage claim documents"
  ON claim_documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Add policy for users to access the admins table (to check if they are admin)
CREATE POLICY "Users can view own admin status"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add policy for admins to bypass any RLS on claims table (redundant but ensures access)
DROP POLICY IF EXISTS "Admins can view all claims" ON claims;
CREATE POLICY "Admins can view all claims"
  ON claims FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Debug query to list all policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename; 