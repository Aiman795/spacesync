import express from "express";
import Booking from "../models/Booking.js";
import Resource from "../models/Resource.js";

const router = express.Router();

// GET /api/bookings?resource=<id>&from=<iso>&to=<iso>
// Used to populate the calendar grid for a given visible range.
router.get("/", async (req, res) => {
  try {
    const { resource, from, to } = req.query;
    const filter = {};
    if (resource) filter.resource = resource;
    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }
    const bookings = await Booking.find(filter).populate("resource").sort({ startTime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper: does [aStart, aEnd] overlap [bStart, bEnd]?
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

// POST /api/bookings
// Body: { resource, title, attendeeCount, notes, startTime, endTime }
//
// NOTE on conflict detection (see PRD "Technical Considerations"):
// The PRD's reference stack (Postgres) enforces this atomically at the DB
// level with an EXCLUDE USING gist constraint. MongoDB has no equivalent
// range-exclusion constraint. This route uses a plain application-level
// overlap check (no session/transaction — transactions require a replica
// set, which a standalone local MongoDB instance is not, so relying on
// them would break the common local-dev setup). Under high concurrent
// load two requests could still race past this check at the same instant;
// call this out if/when this project is reviewed against the PRD.
router.post("/", async (req, res) => {
  const { resource, title, attendeeCount, notes, startTime, endTime } = req.body;

  if (!resource || !title || !startTime || !endTime) {
    return res.status(400).json({ message: "resource, title, startTime and endTime are required" });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start) || isNaN(end) || start >= end) {
    return res.status(400).json({ message: "Invalid time range" });
  }

  try {
    const resourceDoc = await Resource.findById(resource);
    if (!resourceDoc) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const bufferMs = (resourceDoc.bufferMinutes || 0) * 60 * 1000;
    // Widen the candidate window by the resource's buffer so any existing
    // booking that overlaps the buffer zone is also treated as a conflict.
    const checkStart = new Date(start.getTime() - bufferMs);
    const checkEnd = new Date(end.getTime() + bufferMs);

    const existing = await Booking.find({ resource });
    const conflict = existing.find((b) => overlaps(checkStart, checkEnd, b.startTime, b.endTime));

    if (conflict) {
      return res.status(409).json({
        message: resourceDoc.bufferMinutes
          ? `This slot conflicts with an existing booking (including the ${resourceDoc.bufferMinutes}-min buffer).`
          : "This slot conflicts with an existing booking.",
        conflictingBooking: conflict,
      });
    }

    const booking = await Booking.create({ resource, title, attendeeCount, notes, startTime: start, endTime: end });
    const populated = await booking.populate("resource");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;