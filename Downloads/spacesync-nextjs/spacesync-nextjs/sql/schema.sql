-- SpaceSync — Issue #4: Calendar & Booking UI
-- Run this in the Supabase SQL Editor.

create extension if not exists btree_gist;

-- ---------- Resources ----------

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('Room', 'Desk', 'Equipment', 'Vehicle', 'Court', 'Other')),
  building text not null,
  tags text[] not null default '{}',
  capacity int not null default 1,
  buffer_minutes int not null default 0 check (buffer_minutes >= 0),
  created_at timestamptz not null default now()
);

-- ---------- Bookings ----------

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete cascade,
  title text not null,
  attendee_count int not null default 1 check (attendee_count >= 1),
  notes text not null default '',
  start_time timestamptz not null,
  end_time timestamptz not null check (end_time > start_time),
  -- Buffer-widened range, computed by the trigger below. This is what the
  -- exclusion constraint actually checks, so the resource's buffer time
  -- (PRD 5.2) is enforced atomically at the database level, not just in
  -- application code.
  effective_range tsrange,
  created_at timestamptz not null default now()
);

-- Recompute effective_range from the resource's buffer_minutes on every
-- insert/update, before the row is checked against the exclusion constraint.
create or replace function set_booking_effective_range()
returns trigger as $$
declare
  buf int;
begin
  select buffer_minutes into buf from resources where id = new.resource_id;
  new.effective_range := tsrange(
    new.start_time - (coalesce(buf, 0) || ' minutes')::interval,
    new.end_time + (coalesce(buf, 0) || ' minutes')::interval,
    '[)'
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_booking_effective_range on bookings;
create trigger trg_set_booking_effective_range
  before insert or update on bookings
  for each row execute function set_booking_effective_range();

-- The atomic guarantee from the PRD's "Technical Considerations":
-- reject overlapping bookings (including buffer zones) for the same
-- resource at the database level — never relying on application-layer
-- checks alone, which race under concurrent requests.
alter table bookings
  drop constraint if exists no_overlapping_bookings;
alter table bookings
  add constraint no_overlapping_bookings
  exclude using gist (resource_id with =, effective_range with &&);

create index if not exists idx_bookings_resource_start on bookings (resource_id, start_time);

-- ---------- Row-Level Security ----------
-- Issue #4 is UI-only scope, so these are permissive placeholder policies.
-- Fine-grained per-access-group visibility (PRD 5.4, "Role-Based Access")
-- belongs to the auth/roles issue and should tighten these later.

alter table resources enable row level security;
alter table bookings enable row level security;

drop policy if exists "resources are readable by everyone" on resources;
create policy "resources are readable by everyone"
  on resources for select using (true);

drop policy if exists "bookings are readable by everyone" on bookings;
create policy "bookings are readable by everyone"
  on bookings for select using (true);

drop policy if exists "anyone can create a booking" on bookings;
create policy "anyone can create a booking"
  on bookings for insert with check (true);

drop policy if exists "anyone can cancel a booking" on bookings;
create policy "anyone can cancel a booking"
  on bookings for delete using (true);

-- ---------- Demo data ----------

insert into resources (name, type, building, tags, capacity, buffer_minutes) values
  ('Boardroom A', 'Room', 'Block A', array['projector', 'whiteboard'], 12, 15),
  ('Focus Room 3', 'Room', 'Block A', array['whiteboard'], 4, 10),
  ('Study Room 1', 'Room', 'Library', array['wheelchair-accessible'], 6, 5),
  ('AV Kit - Projector Cart', 'Equipment', 'Block A', array['projector'], 1, 20),
  ('Court 1', 'Court', 'Sports Complex', array[]::text[], 10, 30),
  ('Desk 12', 'Desk', 'Block A', array[]::text[], 1, 0),
  ('Shuttle Van', 'Vehicle', 'Block A', array[]::text[], 8, 15),
  ('3D Printer', 'Other', 'Library', array[]::text[], 1, 10)
on conflict do nothing;
