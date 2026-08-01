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
  requires_approval boolean default false,
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
  status text check (status in ('confirmed', 'cancelled', 'pending', 'checked-in', 'expired')) default 'confirmed',
  rrule text,
  is_override boolean default false,
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

create or replace function public.create_recurring_bookings(
  p_resource_id uuid,
  p_user_id uuid,
  p_title text,
  p_attendee_count integer,
  p_notes text,
  p_occurrences jsonb,
  p_status text,
  p_is_override boolean
)
returns table (
  id uuid,
  resource_id uuid,
  user_id uuid,
  title text,
  attendee_count integer,
  notes text,
  start_time timestamptz,
  end_time timestamptz,
  status text,
  is_override boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  occurrence jsonb;
  occurrence_start timestamptz;
  occurrence_end timestamptz;
  resource_buffer integer;
  inserted_booking bookings%rowtype;
begin
  select coalesce(buffer_minutes, 0)
  into resource_buffer
  from resources
  where id = p_resource_id;

  for occurrence in select * from jsonb_array_elements(p_occurrences)
  loop
    occurrence_start := (occurrence->>'start')::timestamptz;
    occurrence_end := (occurrence->>'end')::timestamptz;

    if exists (
      select 1
      from bookings b
      where b.resource_id = p_resource_id
        and b.status = 'confirmed'
        and tstzrange(
          b.start_time - make_interval(mins => coalesce(resource_buffer, 0)),
          b.end_time + make_interval(mins => coalesce(resource_buffer, 0))
        ) && tstzrange(occurrence_start, occurrence_end)
    ) then
      raise exception 'Booking conflict';
    end if;
  end loop;

  for occurrence in select * from jsonb_array_elements(p_occurrences)
  loop
    occurrence_start := (occurrence->>'start')::timestamptz;
    occurrence_end := (occurrence->>'end')::timestamptz;

    insert into bookings (
      resource_id,
      user_id,
      title,
      attendee_count,
      notes,
      start_time,
      end_time,
      status,
      is_override
    )
    values (
      p_resource_id,
      p_user_id,
      p_title,
      p_attendee_count,
      p_notes,
      occurrence_start,
      occurrence_end,
      p_status,
      p_is_override
    )
    returning * into inserted_booking;

    return query
    select
      inserted_booking.id,
      inserted_booking.resource_id,
      inserted_booking.user_id,
      inserted_booking.title,
      inserted_booking.attendee_count,
      inserted_booking.notes,
      inserted_booking.start_time,
      inserted_booking.end_time,
      inserted_booking.status,
      inserted_booking.is_override,
      inserted_booking.created_at;
  end loop;
end;
$$;