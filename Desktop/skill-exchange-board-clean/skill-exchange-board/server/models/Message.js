import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "senderId is required"],
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "receiverId is required"],
  },
  listingId: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: [true, "listingId is required"],
  },
  content: {
    type: String,
    required: [true, "Message content is required"],
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Message", messageSchema);
