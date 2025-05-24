-- Create the sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  check_out TIMESTAMP WITH TIME ZONE,
  auto_closed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_checkout CHECK (check_out IS NULL OR check_out > check_in)
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS sessions_member_id_idx ON public.sessions(member_id);
CREATE INDEX IF NOT EXISTS sessions_check_in_idx ON public.sessions(check_in);
CREATE INDEX IF NOT EXISTS sessions_check_out_idx ON public.sessions(check_out) WHERE check_out IS NOT NULL;
CREATE INDEX IF NOT EXISTS sessions_auto_closed_idx ON public.sessions(auto_closed);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sessions_updated_at') THEN
    CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_updated_at();
  END IF;
END $$;

-- Function to get current session for a member
CREATE OR REPLACE FUNCTION public.get_current_session(member_uuid UUID)
RETURNS SETOF public.sessions AS $$
  SELECT * 
  FROM public.sessions 
  WHERE member_id = member_uuid 
  AND check_out IS NULL 
  ORDER BY check_in DESC 
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to check in a member
CREATE OR REPLACE FUNCTION public.check_in_member(member_uuid UUID, notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_session_id UUID;
  current_session RECORD;
BEGIN
  -- Check if there's an open session
  SELECT * INTO current_session 
  FROM public.get_current_session(member_uuid);
  
  -- If there's an open session, return its ID (idempotent operation)
  IF current_session IS NOT NULL THEN
    RETURN current_session.id;
  END IF;
  
  -- Create a new session
  INSERT INTO public.sessions (member_id, notes)
  VALUES (member_uuid, notes)
  RETURNING id INTO new_session_id;
  
  RETURN new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check out a member
CREATE OR REPLACE FUNCTION public.check_out_member(member_uuid UUID, auto_closed_flag BOOLEAN DEFAULT FALSE, notes TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  current_session RECORD;
  rows_updated INTEGER;
BEGIN
  -- Get the current open session
  SELECT * INTO current_session 
  FROM public.get_current_session(member_uuid);
  
  -- If no open session, return false
  IF current_session IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the session with checkout time
  UPDATE public.sessions
  SET 
    check_out = NOW(),
    auto_closed = auto_closed_flag,
    notes = COALESCE(notes, sessions.notes)
  WHERE id = current_session.id
  RETURNING 1 INTO rows_updated;
  
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
-- Members can view their own sessions
CREATE POLICY "Members can view their own sessions"
  ON public.sessions
  FOR SELECT
  USING (auth.uid() = member_id);

-- Members can create their own sessions (check-in)
CREATE POLICY "Members can create their own sessions"
  ON public.sessions
  FOR INSERT
  WITH CHECK (auth.uid() = member_id AND check_out IS NULL);

-- Members can update their own sessions (check-out)
CREATE POLICY "Members can update their own sessions"
  ON public.sessions
  FOR UPDATE
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- Admins can perform any operation on sessions
CREATE POLICY "Admins can manage all sessions"
  ON public.sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE public.sessions IS 'Tracks member check-ins and check-outs';
COMMENT ON COLUMN public.sessions.member_id IS 'Reference to the member who checked in';
COMMENT ON COLUMN public.sessions.check_in IS 'Timestamp when the member checked in';
COMMENT ON COLUMN public.sessions.check_out IS 'Timestamp when the member checked out (NULL if still checked in)';
COMMENT ON COLUMN public.sessions.auto_closed IS 'Whether the session was automatically closed by the system (e.g., due to geofence exit or timeout)';
COMMENT ON COLUMN public.sessions.notes IS 'Optional notes about the session';

-- Auto-checkout function to be called by a scheduled job
CREATE OR REPLACE FUNCTION public.auto_checkout_sessions()
RETURNS INTEGER AS $$
DECLARE
  sessions_closed INTEGER := 0;
  max_session_hours INTEGER := 12; -- Maximum session length in hours
BEGIN
  -- Close sessions that have been open for more than max_session_hours
  WITH updated_sessions AS (
    UPDATE public.sessions
    SET 
      check_out = check_in + (max_session_hours * INTERVAL '1 hour'),
      auto_closed = TRUE,
      notes = COALESCE(notes, '') || ' (Auto-closed after maximum session time)'
    WHERE 
      check_out IS NULL 
      AND check_in < (NOW() - (max_session_hours * INTERVAL '1 hour'))
    RETURNING 1
  )
  SELECT COUNT(*) INTO sessions_closed FROM updated_sessions;
  
  RETURN sessions_closed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
