import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
// 1. Naya listing routes import kiya
import listingRoutes from "./routes/listing.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Skill Exchange Board API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// 2. Listing routes ko yahan endpoint ke sath connect kar diya
app.use("/api/listings", listingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});