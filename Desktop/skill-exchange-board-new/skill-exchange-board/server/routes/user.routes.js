import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("photo"), updateProfile);

export default router;