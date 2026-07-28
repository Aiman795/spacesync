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
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), attendeeCount: Number(attendeeCount) || 1, notes: notes.trim() });
  };

  const inputClass = "rounded-lg border border-border px-3 py-2.5 text-sm text-ink";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5" onMouseDown={onCancel}>
      <div
        className="w-full max-w-[420px] rounded-2xl bg-card p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold">Book {resource?.name}</h2>
        <div className="mb-4 mt-1 font-mono text-xs text-muted">{formatRange(start, end)}</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3.5 flex flex-col gap-1.5">
            <label htmlFor="title" className="text-xs font-semibold">
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

          <div className="mb-3.5 flex flex-col gap-1.5">
            <label htmlFor="attendeeCount" className="text-xs font-semibold">
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

          <div className="mb-3.5 flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-xs font-semibold">
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

          {error && <div className="mt-1.5 text-xs text-coral">{error}</div>}

          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-paper"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
