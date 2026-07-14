import mongoose from "mongoose";

const { Schema } = mongoose;

const listingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    type: {
      type: String,
      enum: ["offer", "request"], // Frontend se value lowercase ("offer"/"request") bhejiye ga
      required: [true, "Type is required (offer or request)"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    // 1. Availability field jo Aiman ke issue mein demanded hai
    availability: {
      type: String,
      required: [true, "Availability is required"],
      trim: true, // e.g., "Online", "In-Person", "Weekends"
    },
    // 2. RadiusKm pehle se maujood hai, standard default value 5 ke sath
    radiusKm: {
      type: Number,
      default: 5,
      min: [0, "Radius cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "matched", "closed"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Listing", listingSchema);