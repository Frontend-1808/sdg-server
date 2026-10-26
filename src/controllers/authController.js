import jwt from "jsonwebtoken";
import User from "../models/User.js";

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash",
  );
  const ok = user && (await user.checkPassword(password));

  if (!ok)
    return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });

  res.json({ token, user: publicUser(user) });
};

export const me = (req, res) => res.json(publicUser(req.user));
