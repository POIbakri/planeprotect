-- This migration ensures proper permissions for authentication-related operations

-- First make sure we have the service_role permission set up correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'service_role'
  ) THEN
    CREATE ROLE service_role;
  END IF;
END
$$;

-- Grant proper permissions to ensure user creation works
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Ensure the service_role can manage profiles
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure auth triggers can create profiles
DROP POLICY IF EXISTS "Allow service_role to insert profiles" ON public.profiles;
CREATE POLICY "Allow service_role to insert profiles" 
ON public.profiles FOR INSERT 
TO service_role
WITH CHECK (true);

-- Allow authenticated users to view and update their own profiles
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.profiles;
CREATE POLICY "Allow authenticated users to view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.profiles;
CREATE POLICY "Allow authenticated users to update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Make the handle_new_user trigger more robust with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  -- Only attempt insert if profile doesn't exist
  IF NOT profile_exists THEN
    BEGIN
      INSERT INTO public.profiles (id, email, created_at, updated_at)
      VALUES (NEW.id, NEW.email, NOW(), NOW());
    EXCEPTION 
      WHEN unique_violation THEN
        -- Silently handle duplicate key errors
        RAISE NOTICE 'Profile already exists for user %', NEW.id;
      WHEN OTHERS THEN
        -- Log other errors but don't fail the trigger
        RAISE NOTICE 'Error in handle_new_user trigger: %', SQLERRM;
    END;
  END IF;

  -- Always return the new row to allow the insert to complete
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 