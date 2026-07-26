import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import CalendarBookingUI from "./components/CalendarBookingUI.jsx";
import BookingForm from "./components/BookingForm.jsx";
import { getResources, getBookings, createBooking, deleteBooking } from "./api.js";
import { mockResources, mockBookings } from "./data/mockResources.js";

const VIEWS = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

export default function App() {
  const [resources, setResources] = useState([]);
  const [offline, setOffline] = useState(false);
  const [filters, setFilters] = useState({ type: "", building: "", tag: "" });
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [view, setView] = useState("week");
  const [bookings, setBookings] = useState([]);
  const [pendingRange, setPendingRange] = useState(null); // { start, end }
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [banner, setBanner] = useState(null); // { type, message }

  // Load resources — fall back to local mock data if the backend
  // (a separate part of this project) isn't running yet.
  useEffect(() => {
    getResources()
      .then((data) => {
        setResources(data);
        setOffline(false);
      })
      .catch(() => {
        setResources(mockResources);
        setOffline(true);
        setBanner({ type: "offline", message: "Backend not reachable — showing demo data." });
      });
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (filters.type && r.type !== filters.type) return false;
      if (filters.building && r.building !== filters.building) return false;
      if (filters.tag && !(r.tags || []).includes(filters.tag)) return false;
      return true;
    });
  }, [resources, filters]);

  // Keep the selected resource valid as filters change.
  useEffect(() => {
    if (filteredResources.length === 0) {
      setSelectedResourceId("");
      return;
    }
    if (!filteredResources.find((r) => r._id === selectedResourceId)) {
      setSelectedResourceId(filteredResources[0]._id);
    }
  }, [filteredResources, selectedResourceId]);

  const selectedResource = resources.find((r) => r._id === selectedResourceId) || null;

  const loadBookings = (resourceId) => {
    if (!resourceId) return;
    if (offline) {
      setBookings(mockBookings.filter((b) => b.resource === resourceId));
      return;
    }
    getBookings({ resource: resourceId })
      .then(setBookings)
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    loadBookings(selectedResourceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourceId, offline]);

  const handleSelectRange = (start, end) => {
    if (!selectedResource) return;
    setFormError("");
    setPendingRange({ start, end });
  };

  const handleSubmitBooking = async ({ title, attendeeCount, notes }) => {
    if (!selectedResource || !pendingRange) return;
    setSubmitting(true);
    setFormError("");

    const payload = {
      resource: selectedResource._id,
      title,
      attendeeCount,
      notes,
      startTime: pendingRange.start.toISOString(),
      endTime: pendingRange.end.toISOString(),
    };

    if (offline) {
      // Demo-mode conflict check against in-memory bookings.
      const conflict = bookings.find(
        (b) => new Date(payload.startTime) < new Date(b.endTime) && new Date(b.startTime) < new Date(payload.endTime)
      );
      setSubmitting(false);
      if (conflict) {
        setFormError("This slot conflicts with an existing booking.");
        return;
      }
      const newBooking = { ...payload, _id: `local-${Date.now()}` };
      mockBookings.push(newBooking);
      setBookings((prev) => [...prev, newBooking]);
      setPendingRange(null);
      setBanner({ type: "success", message: "Booked (demo mode) ✓" });
      return;
    }

    try {
      const booking = await createBooking(payload);
      setBookings((prev) => [...prev, booking]);
      setPendingRange(null);
      setBanner({ type: "success", message: "Booking confirmed ✓" });
    } catch (err) {
      const message = err.response?.data?.message || "Could not create booking.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (offline) {
      setBookings((prev) => prev.filter((b) => b._id !== id));
      return;
    }
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch {
      setBanner({ type: "conflict", message: "Could not cancel that booking." });
    }
  };

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  return (
    <div className="app-shell">
      <Sidebar resources={resources} filters={filters} onChange={setFilters} />

      <main className="main">
        <div className="topbar">
          <div>
            <h1 className="page-title">Calendar &amp; Booking</h1>
            <p className="page-sub">
              {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} matching filters
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="select-field"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
            >
              {filteredResources.length === 0 && <option value="">No matching resources</option>}
              {filteredResources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} · {r.building}
                </option>
              ))}
            </select>

            <div className="view-toggle">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  className={view === v.key ? "active" : ""}
                  onClick={() => setView(v.key)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {banner && <div className={`banner ${banner.type}`}>{banner.message}</div>}

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
