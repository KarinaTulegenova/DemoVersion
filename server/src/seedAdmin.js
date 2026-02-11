require("dotenv").config();
const { connectDB } = require("./config/db");
const User = require("./models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for seeding.");
  }

  await connectDB(process.env.MONGODB_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log("Existing user promoted to admin.");
    process.exit(0);
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({ username: "Admin", email, passwordHash, role: "admin" });
  console.log("Admin user created.");
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
