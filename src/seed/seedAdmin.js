import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (8 or more characters) in .env",
  );
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const email = ADMIN_EMAIL.toLowerCase().trim();
const exists = await User.findOne({ email });

if (exists) {
  console.log("Admin already exists");
} else {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: ADMIN_NAME || "Admin",
    email,
    passwordHash,
    role: "admin",
  });
  console.log("Admin created:", email);
}

await mongoose.disconnect();
