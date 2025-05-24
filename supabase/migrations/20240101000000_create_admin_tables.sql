-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'staff', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'member')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE;

-- Grant necessary permissions
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.profiles TO authenticated;

-- Update members table to include role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'members' AND column_name = 'role') THEN
    ALTER TABLE public.members 
    ADD COLUMN role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'staff', 'member'));
  END IF;
END $$;

-- Create a function to sync profile updates to members table
CREATE OR REPLACE FUNCTION public.sync_profile_to_member()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.members
  SET 
    email = NEW.email,
    full_name = NEW.full_name,
    role = NEW.role,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_profile_to_member();

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE;

-- Create a function to check if current user is staff or admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$ LANGUAGE SQL STABLE;

-- Update RLS policies for members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all members
CREATE POLICY "Admins can view all members"
ON public.members FOR SELECT
USING (public.is_admin());

-- Allow staff to view active members
CREATE POLICY "Staff can view active members"
ON public.members FOR SELECT
USING (public.is_staff() AND status = 'active');

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.members FOR SELECT
USING (id = auth.uid());

-- Allow admins to update any member
CREATE POLICY "Admins can update any member"
ON public.members FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.members FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create a function to log admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_logs FOR SELECT
USING (public.is_admin());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action TEXT,
  resource_type TEXT,
  resource_id TEXT DEFAULT NULL,
  metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  user_agent TEXT := current_setting('request.headers', true)::json->>'user-agent';
  ip_address TEXT := current_setting('request.headers', true)::json->>'x-forwarded-for';
  user_id UUID := auth.uid();
BEGIN
  INSERT INTO public.admin_audit_logs (
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    metadata, 
    ip_address, 
    user_agent
  ) VALUES (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    split_part(ip_address, ',', 1), -- Handle multiple IPs in x-forwarded-for
    user_agent
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't let logging failures affect the main operation
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
