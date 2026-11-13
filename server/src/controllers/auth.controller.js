const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Settings = require("../models/Settings");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require("../services/gmail");
const { verifyGoogleCredential } = require("../services/googleIdentity");

const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
const clientUrl = () => (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
const rawToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = token => crypto.createHash("sha256").update(token).digest("hex");
const validEmail = email => typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const accountResponse = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.role) });
async function site() { return (await Settings.findById("store"))?.site || {}; }

async function registerUser(req, res) {
  let user;
  let created = false;
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!name || name.length > 120 || !validEmail(email) || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Enter your name, a valid email, and a password of 8–72 characters." });
    const config = await site();
    if (config.blockSignUp && !adminEmails.includes(email)) return res.status(503).json({ message: "New account registration is temporarily unavailable." });
    user = await User.findOne({ email });
    if (user && user.emailVerified !== false) return res.status(409).json({ message: "An account with this email already exists. Sign in or reset your password." });
    const token = rawToken();
    if (user) {
      user.name = name; user.password = await bcrypt.hash(password, 12); user.emailVerificationTokenHash = hashToken(token); user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (adminEmails.includes(email)) user.role = "admin";
      await user.save();
    } else {
      created = true;
      user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: adminEmails.includes(email) ? "admin" : "user", emailVerified: false, emailVerificationTokenHash: hashToken(token), emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    }
    const link = `${clientUrl()}/login?verify=${encodeURIComponent(token)}`;
    await sendEmail({ to: email, subject: "Confirm your Moris Clothing account", text: `Hello ${name},\n\nConfirm your email address to activate your Moris Clothing account:\n${link}\n\nThis link expires in 24 hours. If you did not create this account, you can ignore this email.` });
    return res.status(created ? 201 : 200).json({ message: "Check your email for a confirmation link to activate your account." });
  } catch (err) {
    if (created && user) await User.deleteOne({ _id: user._id }).catch(() => {});
    return res.status(err.code === 11000 ? 409 : 503).json({ message: err.code === 11000 ? "An account with this email already exists." : "We could not send the confirmation email. Please try again later." });
  }
}

async function verifyEmail(req, res) {
  try {
    const token = String(req.query.token || "");
    const user = token && await User.findOne({ emailVerificationTokenHash: hashToken(token), emailVerificationExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: "The confirmation link is invalid or expired." });
    user.emailVerified = true; user.emailVerificationTokenHash = null; user.emailVerificationExpires = null; await user.save();
    return res.json({ message: "Email confirmed. You can now sign in." });
  } catch { return res.status(500).json({ message: "We could not confirm your email. Please try again." }); }
}

async function loginUser(req, res) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!validEmail(email) || !password || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Enter your email and password." });
    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Email or password is incorrect." });
    if (adminEmails.includes(email)) { user.role = "admin"; user.emailVerified = true; await user.save(); }
    else if (!user.emailVerified) return res.status(403).json({ message: "Confirm your email before signing in. Check your inbox for the confirmation link." });
    const config = await site();
    if (config.blockSignIn && user.role !== "admin") return res.status(503).json({ message: "Customer sign-in is temporarily unavailable." });
    return res.json(accountResponse(user));
  } catch { return res.status(500).json({ message: "Unable to sign in. Please try again." }); }
}

async function requestPasswordReset(req, res) {
  const genericMessage = "If an account exists for that email, a password reset link has been sent.";
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!validEmail(email)) return res.json({ message: genericMessage });
    const user = await User.findOne({ email, password: { $ne: null } });
    if (!user) return res.json({ message: genericMessage });
    const token = rawToken(); user.passwordResetTokenHash = hashToken(token); user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); await user.save();
    const link = `${clientUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail({ to: email, subject: "Reset your Moris Clothing password", text: `Hello ${user.name},\n\nUse this link to choose a new password for your Moris Clothing account:\n${link}\n\nThis link expires in one hour. If you did not request a reset, you can ignore this email.` });
    return res.json({ message: genericMessage });
  } catch { return res.status(503).json({ message: "We could not send the reset email. Please try again later." }); }
}

async function resetPassword(req, res) {
  try {
    const token = String(req.body.token || "");
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Use a password of 8–72 characters." });
    const user = await User.findOne({ passwordResetTokenHash: hashToken(token), passwordResetExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: "The reset link is invalid or expired." });
    user.password = await bcrypt.hash(password, 12); user.passwordResetTokenHash = null; user.passwordResetExpires = null; await user.save();
    return res.json({ message: "Password updated. You can now sign in." });
  } catch { return res.status(500).json({ message: "We could not reset your password. Please try again." }); }
}

async function googleSignIn(req, res) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: "Google sign-in is not configured." });
    const claims = await verifyGoogleCredential(String(req.body.credential || ""), process.env.GOOGLE_CLIENT_ID);
    if (!(claims.email_verified === true || claims.email_verified === "true") || !claims.sub || !validEmail(claims.email)) return res.status(401).json({ message: "Google could not verify this account. Please try again." });
    const email = claims.email.trim().toLowerCase();
    const config = await site();
    if (config.blockSignIn && !adminEmails.includes(email)) return res.status(503).json({ message: "Customer sign-in is temporarily unavailable." });
    let user = await User.findOne({ $or: [{ googleId: claims.sub }, { email }] });
    if (user?.googleId && user.googleId !== claims.sub) return res.status(409).json({ message: "This email is linked to a different Google account." });
    if (!user) user = new User({ name: claims.name || email.split("@")[0], email, googleId: claims.sub, emailVerified: true, role: adminEmails.includes(email) ? "admin" : "user" });
    else { user.googleId = claims.sub; user.emailVerified = true; if (adminEmails.includes(email)) user.role = "admin"; }
    await user.save();
    return res.json(accountResponse(user));
  } catch { return res.status(401).json({ message: "Google could not verify this account. Please try again." }); }
}

async function getMe(req, res) { return res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }); }

module.exports = { registerUser, verifyEmail, loginUser, requestPasswordReset, resetPassword, googleSignIn, getMe };
