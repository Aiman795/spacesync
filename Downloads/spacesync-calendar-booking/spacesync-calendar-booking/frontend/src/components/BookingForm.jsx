import React, { useState } from "react";

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

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h2>Book {resource?.name}</h2>
        <div className="modal-meta">{formatRange(start, end)}</div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint planning"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="attendeeCount">Attendee count</label>
            <input
              id="attendeeCount"
              type="number"
              min={1}
              max={resource?.capacity || undefined}
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the resource owner should know"
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
