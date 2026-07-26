// Run with: node seed.js
// Populates a few demo resources so the Calendar & Booking UI has
// something real to filter and book against.
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Resource from "./models/Resource.js";
import mongoose from "mongoose";

dotenv.config();

const demoResources = [
  { name: "Boardroom A", type: "Room", building: "Block A", tags: ["projector", "whiteboard"], capacity: 12, bufferMinutes: 15 },
  { name: "Focus Room 3", type: "Room", building: "Block A", tags: ["whiteboard"], capacity: 4, bufferMinutes: 10 },
  { name: "Study Room 1", type: "Room", building: "Library", tags: ["wheelchair-accessible"], capacity: 6, bufferMinutes: 5 },
  { name: "AV Kit - Projector Cart", type: "Equipment", building: "Block A", tags: ["projector"], capacity: 1, bufferMinutes: 20 },
  { name: "Court 1", type: "Court", building: "Sports Complex", tags: [], capacity: 10, bufferMinutes: 30 },
  { name: "Desk 12", type: "Desk", building: "Block A", tags: [], capacity: 1, bufferMinutes: 0 },
  { name: "Shuttle Van", type: "Vehicle", building: "Block A", tags: [], capacity: 8, bufferMinutes: 15 },
  { name: "3D Printer", type: "Other", building: "Library", tags: [], capacity: 1, bufferMinutes: 10 },
];

async function seed() {
  await connectDB();
  await Resource.deleteMany({});
  await Resource.insertMany(demoResources);
  console.log(`[SpaceSync] Seeded ${demoResources.length} resources`);
  await mongoose.disconnect();
}

seed();