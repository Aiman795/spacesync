# 🏢 SpaceSync — Campus/Office Resource Booking Platform

A booking platform for shared resources (rooms, desks, equipment, courts) that eliminates double-bookings through real-time, database-level conflict detection.

> Built as **Project 2** for the Fellowship Program — Web Development Track (2026 Cohort)

🔗 **Live Demo:** [spacesync-brown.vercel.app](https://spacesync-brown.vercel.app/)

---

## 📌 Problem Statement

Shared resources are managed through fragmented tools (Excel sheets, WhatsApp groups, sticky notes), causing double-bookings, no accountability, and access chaos. SpaceSync solves this with a self-serve booking platform with atomic conflict detection.

---

## ✨ Features

- 🔐 **Auth:** Magic link login via Supabase Auth
- 👥 **Role-Based Access:** Super Admin, Space Admin, Member roles with Row-Level Security
- 🏢 **Resource Management:** Create/manage rooms, desks, equipment, courts with type, building, capacity, tags
- 📅 **Calendar & Booking:** Month/Week/Day views, drag-to-select booking (FullCalendar)
- ⚡ **Atomic Conflict Detection:** Postgres exclusion constraint guarantees no double-bookings, even under concurrent requests — includes buffer-zone enforcement between bookings
- ✅ **Approval Workflow:** Approve/reject bookings for flagged resources
- 📧 **Email Notifications:** Booking confirmations via Resend
- ⏰ **Check-in & No-Show Handling:** Auto-release of unclaimed bookings via scheduled cron job

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) |
| Backend & Database | Supabase (Postgres + Auth + Realtime) |
| Calendar UI | FullCalendar |
| Email | Resend |
| Hosting | Vercel |

**Key technical detail:** Conflict detection uses a Postgres exclusion constraint (`EXCLUDE USING gist`) on `(resource_id, tstzrange(start_time, end_time))` — rejecting overlapping bookings at the database level rather than relying on application-layer checks alone.

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| Aiman Abbasi | Team Lead | [@Aiman795](https://github.com/Aiman795) |
| Nabeela Ashiq | Member | [@nabeelaashiq005-gif](https://github.com/nabeelaashiq005-gif) |
| Fatimatul Zahra | Member | [@Fatimatulzahra-tech](https://github.com/Fatimatulzahra-tech) |
| Fatima Noor ul Imran | Member | [@FatimaNoorulImran](https://github.com/FatimaNoorulImran) |

---

## 🌿 Branching Strategy

```
main   → stable, production-ready code (protected, PR required)
dev    → integration branch (default branch, protected, PR required)
feature/* → individual feature branches
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/Aiman795/spacesync.git
cd spacesync
npm install
```

Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
```

Then run the database schema in Supabase SQL Editor (`supabase/schema.sql`), and start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## 📋 Project Board

Tasks tracked via [GitHub Issues](../../issues).

---

## 📄 License

This project is licensed under the MIT License.
