import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, location } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
    };

    if (req.file) {
      updateData.photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};