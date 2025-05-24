-- Ensure the members table has all required columns for authentication
-- This migration is idempotent and can be run multiple times safely

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'members' AND column_name = 'email') THEN
    ALTER TABLE members ADD COLUMN email TEXT;
    COMMENT ON COLUMN members.email IS 'User email address, must be unique';
  END IF;
END $$;

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'members' AND column_name = 'full_name') THEN
    ALTER TABLE members ADD COLUMN full_name TEXT;
    COMMENT ON COLUMN members.full_name IS 'User full name';
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'members' AND column_name = 'status') THEN
    ALTER TABLE members ADD COLUMN status TEXT DEFAULT 'active';
    COMMENT ON COLUMN members.status IS 'User account status (active, suspended, etc.)';
  END IF;
END $$;

-- Add photo_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'members' AND column_name = 'photo_url') THEN
    ALTER TABLE members ADD COLUMN photo_url TEXT;
    COMMENT ON COLUMN members.photo_url IS 'URL to user profile photo';
  END IF;
END $$;

-- Add created_at and updated_at timestamps if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'members' AND column_name = 'created_at') THEN
    ALTER TABLE members ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'members' AND column_name = 'updated_at') THEN
    ALTER TABLE members ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column on each update
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_members_updated_at') THEN
    CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create an index on the email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'members' AND indexname = 'members_email_idx'
  ) THEN
    CREATE UNIQUE INDEX members_email_idx ON members (LOWER(email));
  END IF;
END $$;

-- Update comments on the table and columns
COMMENT ON TABLE members IS 'Studio members with access to the check-in system';
COMMENT ON COLUMN members.id IS 'Unique identifier for the member, matches Supabase Auth ID';

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Policy to allow members to view their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Members can view their own profile'
  ) THEN
    CREATE POLICY "Members can view their own profile" 
    ON members FOR SELECT 
    USING (auth.uid() = id);
  END IF;

  -- Policy to allow members to update their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Members can update their own profile'
  ) THEN
    CREATE POLICY "Members can update their own profile" 
    ON members FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;

  -- Policy to allow admins to perform any action on members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Admins can manage all members'
  ) THEN
    CREATE POLICY "Admins can manage all members" 
    ON members 
    USING (EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));
  END IF;
END $$;
