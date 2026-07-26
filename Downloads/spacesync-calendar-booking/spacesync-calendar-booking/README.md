# SpaceSync — Issue #4: Calendar & Booking UI

Implementation of GitHub issue **#4** from `Aiman795/spacesync` (see `Aiman795/spacesync#4`),
scoped to the four items in that issue:

- [x] Calendar view: Day / Week / Month, filterable by type / building / tag
- [x] Book a time slot (drag-to-select on the calendar grid)
- [x] Booking form: title, attendee count, notes
- [x] Buffer time setting per resource

Stack: **MERN** (MongoDB, Express, React, Node) — matches the PRD's technical section.

## Project structure

```
spacesync-calendar-booking/
├── backend/            Express + MongoDB API (resources, bookings)
│   ├── models/          Resource.js, Booking.js
│   ├── routes/          resources.js, bookings.js
│   ├── config/db.js
│   ├── seed.js          demo data for local testing
│   └── server.js
└── frontend/            React (Vite) — the actual "Calendar & Booking UI"
    └── src/
        ├── components/  Sidebar, CalendarBookingUI (FullCalendar), BookingForm
        ├── data/         mock fallback data (demo mode, see below)
        └── App.jsx
```

## Running it

**Backend**
```bash
cd backend
cp .env.example .env      # point MONGO_URI at your local/Atlas Mongo
npm install
npm run dev                # or: node server.js
node seed.js                # (optional) load 5 demo resources
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api -> :5000
```

### Demo mode

If the frontend can't reach the backend, it automatically falls back to
local mock resources/bookings (`src/data/mockResources.js`) so the UI can
still be reviewed on its own — you'll see an "offline" banner when this
happens. This isn't meant to replace the real API, just to keep the UI
demoable if the backend piece isn't up yet.

## How the four features map to code

| Issue bullet | Where |
|---|---|
| Day/Week/Month, filterable by type/building/tag | `Sidebar.jsx` (filters) + `App.jsx` view toggle + `CalendarBookingUI.jsx` (FullCalendar `initialView`) |
| Drag-to-select booking | `CalendarBookingUI.jsx` — FullCalendar `selectable`/`select` |
| Booking form (title, attendee count, notes) | `BookingForm.jsx` |
| Buffer time per resource | `Resource.bufferMinutes` field (backend) + rendered as diagonal-hatched "buffer zone" bands on the calendar (`buffer-zone` class), and enforced server-side in `POST /api/bookings` |

## Known limitation (flagged, not hidden)

The PRD's reference stack (Postgres) enforces conflict-free bookings
**atomically** at the database level via `EXCLUDE USING gist` on the time
range. This project uses MongoDB per the MERN requirement, which has no
equivalent range-exclusion constraint. `backend/routes/bookings.js` uses a
session transaction plus an application-level overlap check to narrow the
race window, but under high concurrent load this is not as airtight as the
Postgres constraint — worth a note if this gets reviewed against the PRD's
"Technical Considerations" section.

Out of scope for this issue (left for other issues per the PRD): auth/roles,
approval workflows, recurring bookings, reminders/notifications, analytics,
calendar sync.
