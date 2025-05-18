create table members (
  id uuid primary key default gen_random_uuid(),
  firstName text not null,
  lastName text not null,
  createdAt timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  memberId uuid references members(id) on delete cascade,
  startedAt timestamptz default now(),
  endedAt timestamptz,
  createdAt timestamptz default now()
);

alter table members enable row level security;
alter table sessions enable row level security;
-- TODO: row policies
