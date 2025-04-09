-- Fix the issue with handle_new_user trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if this user already exists in profiles
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Skip the insert to avoid duplicate key issues
    RETURN NEW;
  END IF;

  -- Create a safe version of the insert that ignores errors
  BEGIN
    INSERT INTO profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE NOTICE 'Error creating profile for new user: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create a policy to allow the trigger function to insert into profiles
DROP POLICY IF EXISTS "Allow trigger function to insert profiles" ON profiles;
CREATE POLICY "Allow trigger function to insert profiles" ON profiles
FOR INSERT TO postgres
WITH CHECK (true);

-- Create a policy for service_role access
DROP POLICY IF EXISTS "Allow service_role to insert profiles" ON profiles;
CREATE POLICY "Allow service_role to insert profiles" ON profiles
FOR INSERT TO service_role
WITH CHECK (true);

-- Grant insert privileges to ensure the trigger has proper permissions
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON TABLE profiles TO postgres;
GRANT INSERT ON TABLE profiles TO service_role;
GRANT INSERT ON TABLE profiles TO anon;
GRANT INSERT ON TABLE profiles TO authenticated;

-- Ensure the trigger is properly created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user(); 