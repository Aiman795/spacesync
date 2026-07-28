# SpaceSync — Issue #4: Calendar & Booking UI (Next.js + Supabase)

Rebuild of the same Issue #4 scope, now matching the PRD's actual stack:
**Next.js (App Router) + Tailwind CSS + Supabase (Postgres)**, instead of
the earlier MERN version.

Same four features, same UI/UX, same design — only the framework and
database underneath changed:

- [x] Calendar view: Day / Week / Month, filterable by type / building / tag
- [x] Book a time slot (drag-to-select on the calendar grid)
- [x] Booking form: title, attendee count, notes
- [x] Buffer time setting per resource

## What changed vs. the MERN version

| | MERN version | This version |
|---|---|---|
| Framework | React (Vite) | Next.js (App Router) |
| Styling | plain CSS | Tailwind CSS (same colors/fonts) |
| API | Express routes | Next.js Route Handlers (`app/api/**/route.js`) |
| Database | MongoDB (Mongoose) | Postgres (Supabase) |
| Conflict detection | app-level overlap check | **Postgres `EXCLUDE USING gist` constraint** — atomic, exactly what the PRD asks for |

The Postgres version is a genuine improvement here: the PRD specifically
calls for atomic, database-level conflict detection because
application-level checks can race under concurrent requests. MongoDB has
no equivalent, so the earlier version could only approximate it. Supabase/
Postgres can do it for real — see `sql/schema.sql`.

## Project structure

```
spacesync-nextjs/
├── app/
│   ├── layout.jsx        fonts + global shell
│   ├── page.jsx           the Calendar & Booking UI itself
│   ├── globals.css        Tailwind + FullCalendar theme + buffer-zone styling
│   └── api/
│       ├── resources/route.js
│       └── bookings/route.js, bookings/[id]/route.js
├── components/
│   ├── Sidebar.jsx         filters (type/building/tag)
│   ├── CalendarBookingUI.jsx   FullCalendar wrapper (drag-select, buffer zones)
│   └── BookingForm.jsx     title / attendee count / notes modal
├── lib/
│   ├── supabase-client.js  browser client (for future realtime work)
│   └── supabase-server.js  server client used by the API routes
└── sql/
    └── schema.sql          tables, buffer-aware exclusion constraint, RLS, demo data
```

## Setup

**1. Create a Supabase project** (supabase.com → New project)

**2. Run the schema**
Open the Supabase SQL Editor and run the contents of `sql/schema.sql`.
This creates `resources` and `bookings`, the buffer-aware trigger, the
atomic exclusion constraint, basic RLS policies, and 8 demo resources.

**3. Environment variables**
```bash
cp .env.local.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from Supabase → Settings → API.

**4. Install and run**
```bash
npm install
npm run dev
```
Open http://localhost:3000

## How conflict detection works now

`sql/schema.sql` adds a trigger that, on every insert/update to `bookings`,
computes an `effective_range` (the booking's time range widened by the
resource's `buffer_minutes` on both sides). A Postgres `EXCLUDE USING gist`
constraint then rejects any new row whose `effective_range` overlaps an
existing one for the same resource — enforced by the database itself, so
it can't be raced by concurrent requests the way an application-level
check can. `app/api/bookings/route.js` just attempts the insert and turns
a Postgres `23P01` (exclusion_violation) error into an HTTP 409.

## Out of scope (per Issue #4)

Auth/roles, approval workflows, recurring bookings, reminders/notifications,
analytics, calendar sync — these belong to other issues per the PRD.
`lib/supabase-client.js` is included but unused for now; it's there for
whoever picks up Realtime (PRD 5.2, "a booked slot disappears for other
viewers within ~1 second") as a follow-up.
