import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/spacesync";
  try {
    await mongoose.connect(uri);
    console.log("[SpaceSync] MongoDB connected:", uri);
  } catch (err) {
    console.error("[SpaceSync] MongoDB connection error:", err.message);
    process.exit(1);
  }
};
