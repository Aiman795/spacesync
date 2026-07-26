import express from "express";
const router = express.Router();
import {
  createListing,
  getListings,
  getMyListings,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";
import verifyToken from "../middleware/auth.middleware.js"; // Apni team ka exact auth middleware path check kar lein

// GET api/listings (Public — browse all)
router.get("/", getListings);

// GET api/listings/mine (Protected — apni khud ki listings)
router.get("/mine", verifyToken, getMyListings);

// POST api/listings (Protected)
router.post("/", verifyToken, createListing);

// PUT api/listings/:id (Protected — sirf apni listing edit kar sakte hain)
router.put("/:id", verifyToken, updateListing);

// DELETE api/listings/:id (Protected — sirf apni listing delete kar sakte hain)
router.delete("/:id", verifyToken, deleteListing);

export default router;
