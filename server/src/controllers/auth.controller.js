const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const response = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.role) });
const validEmail = value => typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
async function registerUser(req, res) {
  const { name, email, password } = req.body;
  if (typeof name !== "string" || !name.trim() || name.length > 120 || !validEmail(email) || typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Enter your name, a valid email, and a password of 8-72 bytes." });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account already uses this email. Please sign in." });
    // Public sign-up cannot grant an admin role based on an unverified email address.
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), role: "user" });
    res.status(201).json(response(user));
  } catch (err) { res.status(err.code === 11000 ? 409 : 500).json({ message: err.code === 11000 ? "An account already uses this email." : "Unable to create account. Please try again." }); }
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!validEmail(email) || typeof password !== "string" || !password || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Enter your email and password." });
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Email or password is incorrect." });
    res.json(response(user));
  } catch { res.status(500).json({ message: "Unable to sign in. Please try again." }); }
}
module.exports = { registerUser, loginUser };
