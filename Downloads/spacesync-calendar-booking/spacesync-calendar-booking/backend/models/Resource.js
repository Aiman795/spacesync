import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Room", "Desk", "Equipment", "Vehicle", "Court", "Other"],
      required: true,
    },
    building: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }], // e.g. amenities: projector, whiteboard
    capacity: { type: Number, default: 1 },
    // Buffer time setting per resource (PRD 5.2) — minutes of gap
    // enforced before/after every booking on this resource.
    bufferMinutes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
