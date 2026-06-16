const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const AppConfig = require("../models/AppConfig");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const signToken = (payload, expiresIn) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

// ─── [1] PIN Recovery — Verify Admin Credentials ─────────────────────────────
/**
 * POST /api/v1/recovery/verify-admin
 * Verify admin username + password → issue a short-lived pin-reset token.
 * Used by ForgotPinModal on the Pin page.
 */
const verifyAdminCredentials = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  try {
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Short-lived token that only allows PIN reset
    const resetToken = signToken(
      { recovery: true, type: "pin-reset", adminId: String(admin._id) },
      "5m"
    );

    return res.status(200).json({
      success: true,
      message: "Credentials verified. You may now set a new PIN.",
      data: { resetToken },
    });
  } catch (error) {
    console.error("verifyAdminCredentials error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── [2] PIN Recovery — Reset PIN with Token ─────────────────────────────────
/**
 * POST /api/v1/recovery/reset-pin
 * Reset the app PIN using a pin-reset recovery token (no admin JWT needed).
 * Used by ForgotPinModal after admin credentials have been verified.
 */
const recoveryResetPin = async (req, res) => {
  const { newPin, resetToken } = req.body;

  if (!resetToken) {
    return res.status(400).json({ success: false, message: "Recovery token is required. Please start over." });
  }

  if (!newPin || String(newPin).length < 4 || !/^\d{4,}$/.test(String(newPin))) {
    return res.status(400).json({ success: false, message: "PIN must be at least 4 digits." });
  }

  try {
    const decoded = verifyToken(resetToken);
    if (!decoded.recovery || decoded.type !== "pin-reset") {
      return res.status(401).json({ success: false, message: "Invalid or expired recovery token." });
    }

    const config = await AppConfig.getConfig();
    config.pinHash = await bcrypt.hash(String(newPin), 12);
    await config.save();

    return res.status(200).json({ success: true, message: "PIN reset successfully." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Recovery session expired. Please start over." });
    }
    console.error("recoveryResetPin error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── [3] Admin Credential Recovery — Verify Security Answer ──────────────────
/**
 * POST /api/v1/recovery/verify-security-for-admin
 * Verify the SECURITY_ANSWER env variable → issue a short-lived cred-reset token.
 * Used from AdminLoginPage "Forgot credentials?" flow.
 */
const verifySecurityAnswerForAdmin = (req, res) => {
  const { answer } = req.body;

  if (!answer || answer.trim() === "") {
    return res.status(400).json({ success: false, message: "Answer is required." });
  }

  const correctAnswer = process.env.SECURITY_ANSWER || "";

  if (answer.toLowerCase().trim() !== correctAnswer.toLowerCase().trim()) {
    return res.status(401).json({ success: false, message: "Incorrect security answer. Please try again." });
  }

  const credResetToken = signToken(
    { recovery: true, type: "admin-cred-reset" },
    "10m"
  );

  return res.status(200).json({
    success: true,
    message: "Security answer verified. You may now reset your admin password.",
    data: { credResetToken },
  });
};

// ─── [4] Admin Credential Recovery — Reset Admin Password ────────────────────
/**
 * POST /api/v1/recovery/reset-admin-creds
 * Reset the admin's password using a cred-reset recovery token.
 * Returns the admin's username so they can log in.
 */
const resetAdminCredentials = async (req, res) => {
  const { newPassword, credResetToken } = req.body;

  if (!credResetToken) {
    return res.status(400).json({ success: false, message: "Recovery token is required. Please start over." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
  }

  try {
    const decoded = verifyToken(credResetToken);
    if (!decoded.recovery || decoded.type !== "admin-cred-reset") {
      return res.status(401).json({ success: false, message: "Invalid or expired recovery token." });
    }

    // Find the first (and only) admin
    const admin = await Admin.findOne({});
    if (!admin) {
      return res.status(404).json({ success: false, message: "No admin account found." });
    }

    admin.password = newPassword; // Model pre-save hook will hash it
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin password reset successfully.",
      data: { username: admin.username },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Recovery session expired. Please start over." });
    }
    console.error("resetAdminCredentials error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Legacy: Q&A + Password Recovery (kept for backward compat) ──────────────

/**
 * POST /api/v1/recovery/verify-qa
 */
const verifyRecoveryQA = (req, res) => {
  const { answer } = req.body;
  if (!answer || answer.trim() === "") {
    return res.status(400).json({ success: false, message: "Answer is required." });
  }

  const correctAnswer = process.env.SECURITY_ANSWER || "";
  if (answer.toLowerCase().trim() !== correctAnswer.toLowerCase().trim()) {
    return res.status(401).json({ success: false, message: "Incorrect answer. Please try again." });
  }

  const recoveryToken = signToken(
    { recovery: true, type: "pin-recovery-qa" },
    "10m"
  );

  return res.status(200).json({
    success: true,
    message: "Security answer verified.",
    data: { recoveryToken },
  });
};

/**
 * POST /api/v1/recovery/verify-password
 */
const verifyRecoveryPassword = (req, res) => {
  const { password, recoveryToken } = req.body;

  if (!recoveryToken) {
    return res.status(400).json({ success: false, message: "Invalid recovery state. Please start over." });
  }
  if (!password || password.trim() === "") {
    return res.status(400).json({ success: false, message: "Password is required." });
  }

  try {
    const decoded = verifyToken(recoveryToken);
    if (!decoded.recovery || decoded.type !== "pin-recovery-qa") {
      return res.status(401).json({ success: false, message: "Invalid recovery token." });
    }

    const correctPassword = process.env.ADMIN_PASSWORD || "";
    if (password !== correctPassword) {
      return res.status(401).json({ success: false, message: "Incorrect password. Please try again." });
    }

    const resetToken = signToken(
      { recovery: true, type: "pin-reset" },
      "5m"
    );

    return res.status(200).json({ success: true, message: "Password verified.", data: { resetToken } });
  } catch (error) {
    console.error("Recovery verification error:", error);
    return res.status(401).json({ success: false, message: "Recovery session expired. Please start over." });
  }
};

module.exports = {
  verifyAdminCredentials,
  recoveryResetPin,
  verifySecurityAnswerForAdmin,
  resetAdminCredentials,
  verifyRecoveryQA,
  verifyRecoveryPassword,
};
