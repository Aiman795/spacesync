"use client";

import { useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const VIEW_MAP = {
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
};

export default function CalendarBookingUI({ resource, bookings, view, onSelectRange, onDeleteBooking, onNewBooking }) {
  const calendarRef = useRef(null);
  const fcView = VIEW_MAP[view] || "timeGridWeek";

  const events = useMemo(() => {
    if (!resource) return [];
    const bufferMs = (resource.buffer_minutes || 0) * 60 * 1000;

    const bookingEvents = bookings.map((b) => ({
      id: b.id,
      title: b.title,
      start: b.start_time,
      end: b.end_time,
      classNames: ["booking-event"],
      extendedProps: { booking: b },
    }));

    const bufferEvents = bufferMs
      ? bookings.flatMap((b) => {
          const start = new Date(b.start_time);
          const end = new Date(b.end_time);
          return [
            {
              start: new Date(start.getTime() - bufferMs).toISOString(),
              end: start.toISOString(),
              display: "background",
              classNames: ["buffer-zone"],
            },
            {
              start: end.toISOString(),
              end: new Date(end.getTime() + bufferMs).toISOString(),
              display: "background",
              classNames: ["buffer-zone"],
            },
          ];
        })
      : [];

    return [...bookingEvents, ...bufferEvents];
  }, [resource, bookings]);

  const handleSelect = (selectionInfo) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.unselect();
    onSelectRange(selectionInfo.start, selectionInfo.end);
  };

  const handleEventClick = (clickInfo) => {
    const booking = clickInfo.event.extendedProps.booking;
    if (!booking) return;
    if (window.confirm(`Cancel "${booking.title}"?`)) {
      onDeleteBooking(booking.id);
    }
  };

  // Opens the booking form directly with a sensible default time slot,
  // instead of relying on the user to drag-select on the calendar.
  const handleNewBookingClick = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = minutes < 30 ? 30 : 60;
    const start = new Date(now);
    start.setMinutes(roundedMinutes % 60, 0, 0);
    if (roundedMinutes === 60) start.setHours(start.getHours() + 1);

    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour default duration

    onSelectRange(start, end);
  };

  if (!resource) {
    return (
      <div className="calendar-card grid flex-1 place-items-center rounded-2xl border border-border bg-card p-4 text-muted">
        Pick a resource above to see its calendar.
      </div>
    );
  }

  return (
    <div className="calendar-card flex-1 rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
      {onNewBooking && (
        <div className="flex justify-end px-1">
          <button
            type="button"
            onClick={handleNewBookingClick}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
          >
            + New booking
          </button>
        </div>
      )}
      <FullCalendar
        ref={calendarRef}
        key={fcView}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={fcView}
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        height="auto"
        selectable
        selectMirror
        selectMinDistance={2}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
        events={events}
        select={handleSelect}
        eventClick={handleEventClick}
        nowIndicator
      />
    </div>
  );
}