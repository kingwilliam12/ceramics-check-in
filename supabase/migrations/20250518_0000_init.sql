create table members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  photo_url text,
  status text default 'active',
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  check_in timestamptz not null,
  check_out timestamptz,
  auto_closed boolean default false,
  created_at timestamptz default now()
);

alter table members enable row level security;
alter table sessions enable row level security;

-- Policies for 'members' table
CREATE POLICY "Members can view their own data." ON members
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Members can update their own data." ON members
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for 'sessions' table
CREATE POLICY "Members can view their own sessions." ON sessions
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Members can insert their own sessions." ON sessions
  FOR INSERT WITH CHECK (auth.uid() = member_id);
  
CREATE POLICY "Members can update their own sessions." ON sessions
  FOR UPDATE USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- Note: Admin policies for full access are not yet defined.
-- This typically involves checking for a specific role or custom claim.
-- For now, operations requiring broader access (like admin viewing all data
-- or Edge Functions operating across user data if not using service_role)
-- would need to be handled by service_role or further RLS refinement.
