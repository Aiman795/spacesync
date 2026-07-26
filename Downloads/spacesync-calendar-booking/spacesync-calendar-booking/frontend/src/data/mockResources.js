// Fallback data used only if the backend API is unreachable, so the UI
// for Issue #4 can still be reviewed/demoed standalone (e.g. on GitHub
// Pages or before the backend issue lands).
export const mockResources = [
  { _id: "r1", name: "Boardroom A", type: "Room", building: "Block A", tags: ["projector", "whiteboard"], capacity: 12, bufferMinutes: 15 },
  { _id: "r2", name: "Focus Room 3", type: "Room", building: "Block A", tags: ["whiteboard"], capacity: 4, bufferMinutes: 10 },
  { _id: "r3", name: "Study Room 1", type: "Room", building: "Library", tags: ["wheelchair-accessible"], capacity: 6, bufferMinutes: 5 },
  { _id: "r4", name: "AV Kit - Projector Cart", type: "Equipment", building: "Block A", tags: ["projector"], capacity: 1, bufferMinutes: 20 },
  { _id: "r5", name: "Court 1", type: "Court", building: "Sports Complex", tags: [], capacity: 10, bufferMinutes: 30 },
];

export const mockBookings = [];
