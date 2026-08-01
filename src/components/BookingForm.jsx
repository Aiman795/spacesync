"use client";

import { useState } from "react";

function formatRange(start, end) {
  const opts = { weekday: "short", month: "short", day: "numeric" };
  const timeOpts = { hour: "numeric", minute: "2-digit" };
  const day = start.toLocaleDateString(undefined, opts);
  const startTime = start.toLocaleTimeString(undefined, timeOpts);
  const endTime = end.toLocaleTimeString(undefined, timeOpts);
  return `${day} · ${startTime} – ${endTime}`;
}

export default function BookingForm({ resource, start, end, onCancel, onSubmit, submitting, error }) {
  const [title, setTitle] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ 
      title: title.trim(), 
      userEmail: userEmail.trim(), 
      attendeeCount: Number(attendeeCount) || 1, 
      notes: notes.trim() 
    });
  };

  const inputClass = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onMouseDown={onCancel}>
      <div
        className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">Book {resource?.name}</h2>
          <div className="mt-1 font-mono text-xs text-muted">{formatRange(start, end)}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-ink">
              Title
            </label>
            <input
              id="title"
              autoFocus
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint planning"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="userEmail" className="text-xs font-semibold text-ink">
              Notification Email
            </label>
            <input
              id="userEmail"
              type="email"
              className={inputClass}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="attendeeCount" className="text-xs font-semibold text-ink">
              Attendee count
            </label>
            <input
              id="attendeeCount"
              type="number"
              min={1}
              max={resource?.capacity || undefined}
              className={inputClass}
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-xs font-semibold text-ink">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the resource owner should know"
            />
          </div>

          {error && <div className="rounded-lg border border-coral/20 bg-coral/10 p-3 text-xs font-medium text-coral">{error}</div>}

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}