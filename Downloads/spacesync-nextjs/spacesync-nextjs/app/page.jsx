"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../components/Sidebar.jsx";
import BookingForm from "../components/BookingForm.jsx";

// FullCalendar touches the DOM at import time, so it must never be
// server-rendered.
const CalendarBookingUI = dynamic(() => import("../components/CalendarBookingUI.jsx"), { ssr: false });

const VIEWS = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

export default function Page() {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({ type: "", building: "", tag: "" });
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [view, setView] = useState("week");
  const [bookings, setBookings] = useState([]);
  const [pendingRange, setPendingRange] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then(setResources)
      .catch(() => setBanner({ type: "conflict", message: "Could not load resources." }));
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (filters.type && r.type !== filters.type) return false;
      if (filters.building && r.building !== filters.building) return false;
      if (filters.tag && !(r.tags || []).includes(filters.tag)) return false;
      return true;
    });
  }, [resources, filters]);

  useEffect(() => {
    if (filteredResources.length === 0) {
      setSelectedResourceId("");
      return;
    }
    if (!filteredResources.find((r) => r.id === selectedResourceId)) {
      setSelectedResourceId(filteredResources[0].id);
    }
  }, [filteredResources, selectedResourceId]);

  const selectedResource = resources.find((r) => r.id === selectedResourceId) || null;

  useEffect(() => {
    if (!selectedResourceId) return;
    fetch(`/api/bookings?resource=${selectedResourceId}`)
      .then((r) => r.json())
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [selectedResourceId]);

  const handleSelectRange = (start, end) => {
    if (!selectedResource) return;
    setFormError("");
    setPendingRange({ start, end });
  };

  const handleSubmitBooking = async ({ title, attendeeCount, notes }) => {
    if (!selectedResource || !pendingRange) return;
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: selectedResource.id,
          title,
          attendeeCount,
          notes,
          startTime: pendingRange.start.toISOString(),
          endTime: pendingRange.end.toISOString(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "Could not create booking.");
        return;
      }

      setBookings((prev) => [...prev, data]);
      setPendingRange(null);
      setBanner({ type: "success", message: "Booking confirmed ✓" });
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setBanner({ type: "conflict", message: "Could not cancel that booking." });
    }
  };

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const bannerClass =
    banner?.type === "conflict"
      ? "border-[#f3c2c3] bg-coral-soft text-[#9c2b2f]"
      : banner?.type === "offline"
      ? "border-[#f2d59a] bg-amber-soft text-[#8a5a02]"
      : "border-[#b8e5df] bg-teal-soft text-[#0a6d61]";

  return (
    <div className="grid min-h-screen grid-cols-[264px_1fr] max-[860px]:grid-cols-1">
      <Sidebar resources={resources} filters={filters} onChange={setFilters} />

      <main className="flex flex-col gap-4 px-8 pb-10 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight">Calendar &amp; Booking</h1>
            <p className="mt-1 text-sm text-muted">
              {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} matching filters
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-ink"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
            >
              {filteredResources.length === 0 && <option value="">No matching resources</option>}
              {filteredResources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.building}
                </option>
              ))}
            </select>

            <div className="flex gap-0.5 rounded-[10px] border border-border bg-card p-[3px]">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-medium ${
                    view === v.key ? "bg-primary text-white" : "text-muted"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {banner && <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${bannerClass}`}>{banner.message}</div>}

        <CalendarBookingUI
          resource={selectedResource}
          bookings={bookings}
          view={view}
          onSelectRange={handleSelectRange}
          onDeleteBooking={handleDeleteBooking}
        />
      </main>

      {pendingRange && selectedResource && (
        <BookingForm
          resource={selectedResource}
          start={pendingRange.start}
          end={pendingRange.end}
          submitting={submitting}
          error={formError}
          onCancel={() => {
            setPendingRange(null);
            setFormError("");
          }}
          onSubmit={handleSubmitBooking}
        />
      )}
    </div>
  );
}
