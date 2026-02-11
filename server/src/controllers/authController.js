const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/async");

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already in use." });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ username, email, passwordHash, role: "user" });
  const token = signToken(user);
  return res.status(201).json({
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const token = signToken(user);
  return res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
  });
});

module.exports = { register, login };
