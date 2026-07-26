import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
    title: { type: String, required: true, trim: true },
    attendeeCount: { type: Number, default: 1, min: 1 },
    notes: { type: String, trim: true, default: "" },
    startTime: { type: Date, required: true }, // stored in UTC
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

bookingSchema.index({ resource: 1, startTime: 1, endTime: 1 });

export default mongoose.model("Booking", bookingSchema);
