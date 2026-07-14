import Listing from "../models/Listing.js";

// POST /api/listings  (Protected)
export const createListing = async (req, res) => {
  try {
    const { title, category, description, type, availability, radiusKm } = req.body;

    // Validation
    if (!title || !category || !description || !type || !availability) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    const newListing = new Listing({
      userId: req.userId, // Real logged-in user ki ID jo verifyToken middleware se aa rahi hai
      type: type.toLowerCase(), // Enum match karne ke liye lowercase kiya
      title,
      category,
      description,
      availability,
      radiusKm: radiusKm ? Number(radiusKm) : 5, // Default 5 agar value na di jaye
    });

    const savedListing = await newListing.save();
    res.status(201).json({ success: true, data: savedListing });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ message: "Server Error. Could not create listing." });
  }
};

// GET /api/listings  (Public) — browse all active listings
export const getListings = async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { status: "active" };
    if (type) filter.type = type.toLowerCase();
    if (category) filter.category = category;

    const listings = await Listing.find(filter)
      .populate("userId", "name photoUrl location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ message: "Server Error. Could not fetch listings." });
  }
};

// GET /api/listings/mine  (Protected) — the logged-in user's own listings
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    console.error("Error fetching your listings:", error);
    res.status(500).json({ message: "Server Error. Could not fetch your listings." });
  }
};

// PUT /api/listings/:id  (Protected) — edit only if you own the listing
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Ownership check: only the creator can edit their own listing
    if (listing.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own listings." });
    }

    const { title, category, description, type, availability, radiusKm, status } = req.body;

    if (title !== undefined) listing.title = title;
    if (category !== undefined) listing.category = category;
    if (description !== undefined) listing.description = description;
    if (type !== undefined) listing.type = type.toLowerCase();
    if (availability !== undefined) listing.availability = availability;
    if (radiusKm !== undefined) listing.radiusKm = Number(radiusKm);
    if (status !== undefined) listing.status = status;

    const updatedListing = await listing.save();
    res.status(200).json({ success: true, data: updatedListing });
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ message: "Server Error. Could not update listing." });
  }
};

// DELETE /api/listings/:id  (Protected) — delete only if you own the listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Ownership check: only the creator can delete their own listing
    if (listing.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own listings." });
    }

    await listing.deleteOne();
    res.status(200).json({ success: true, message: "Listing deleted successfully." });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ message: "Server Error. Could not delete listing." });
  }
};
