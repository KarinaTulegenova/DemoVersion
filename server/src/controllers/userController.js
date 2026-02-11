const User = require("../models/User");
const { asyncHandler } = require("../middleware/async");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("username email role");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use." });
    }
  }

  user.username = username;
  user.email = email;
  await user.save();

  return res.json({ id: user._id, username: user.username, email: user.email, role: user.role });
});

module.exports = { getProfile, updateProfile };
