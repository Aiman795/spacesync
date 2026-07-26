import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

// GET /api/resources?type=Room&building=Block%20A&tag=projector
router.get("/", async (req, res) => {
  try {
    const { type, building, tag } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (building) filter.building = building;
    if (tag) filter.tags = tag;
    const resources = await Resource.find(filter).sort({ building: 1, name: 1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/resources
router.post("/", async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/resources/:id  (e.g. update buffer time setting)
router.patch("/:id", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/resources/:id
router.delete("/:id", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
