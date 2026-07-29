-- ============================================
-- User Roles & Access Groups
-- ============================================

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('super_admin', 'space_admin', 'member', 'guest')) default 'member',
  access_group_id uuid,
  created_at timestamp with time zone default now(),
  unique(user_id)
);

create table access_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

alter table user_roles enable row level security;
alter table access_groups enable row level security;

create policy "Users can view own role"
  on user_roles for select
  using (auth.uid() = user_id);

create policy "Access groups are viewable by authenticated users"
  on access_groups for select
  to authenticated
  using (true);

-- Auto-assign 'member' role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Resources
-- ============================================

create table resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('room', 'desk', 'equipment', 'vehicle', 'court', 'other')) not null,
  location text,
  capacity integer,
  photo_url text,
  amenities text[],
  access_group_id uuid references access_groups(id),
  created_at timestamp with time zone default now()
);

alter table resources enable row level security;

create policy "Resources are viewable by authenticated users"
  on resources for select
  to authenticated
  using (true);

create policy "Only admins can create resources"
  on resources for insert
  to authenticated
  with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role in ('super_admin', 'space_admin')
    )
  );

-- ============================================
-- Bookings (with atomic conflict detection)
-- ============================================

create extension if not exists btree_gist;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references resources(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  title text,
  attendee_count integer,
  notes text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text check (status in ('confirmed', 'cancelled')) default 'confirmed',
  rrule text,
  created_at timestamptz default now(),

  exclude using gist (
    resource_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status = 'confirmed')
);

alter table bookings enable row level security;

create policy "Bookings are viewable by authenticated users"
  on bookings for select
  to authenticated
  using (true);

create policy "Users can create their own bookings"
  on bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own bookings"
  on bookings for update
  to authenticated
  using (auth.uid() = user_id);
-- Additional columns for calendar/booking UI (Issue 4)
alter table resources
  add column building text,
  add column tags text[],
  add column buffer_minutes integer default 0;