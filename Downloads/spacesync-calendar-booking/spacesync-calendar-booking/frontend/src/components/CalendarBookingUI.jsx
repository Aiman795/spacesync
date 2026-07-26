import React, { useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const VIEW_MAP = {
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
};

export default function CalendarBookingUI({ resource, bookings, view, onSelectRange, onDeleteBooking }) {
  const calendarRef = useRef(null);

  // Re-render the toolbar-less view whenever the "view" prop changes,
  // since the toggle lives in our own topbar rather than FullCalendar's.
  const fcView = VIEW_MAP[view] || "timeGridWeek";

  const events = useMemo(() => {
    if (!resource) return [];
    const bufferMs = (resource.bufferMinutes || 0) * 60 * 1000;

    const bookingEvents = bookings.map((b) => ({
      id: b._id,
      title: b.title,
      start: b.startTime,
      end: b.endTime,
      classNames: ["booking-event"],
      extendedProps: { booking: b },
    }));

    const bufferEvents = bufferMs
      ? bookings.flatMap((b) => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
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
    if (!booking) return; // ignore clicks on background/buffer events
    if (window.confirm(`Cancel "${booking.title}"?`)) {
      onDeleteBooking(booking._id);
    }
  };

  if (!resource) {
    return (
      <div className="calendar-card" style={{ display: "grid", placeItems: "center", color: "var(--muted)" }}>
        Pick a resource above to see its calendar.
      </div>
    );
  }

  return (
    <div className="calendar-card">
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
