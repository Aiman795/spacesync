import mongoose from "mongoose";

const { Schema } = mongoose;

const matchSchema = new Schema({
  listingIdA: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: [true, "listingIdA is required"],
  },
  listingIdB: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: [true, "listingIdB is required"],
  },
  matchedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Match", matchSchema);
