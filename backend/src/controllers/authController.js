const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const AppConfig = require("../models/AppConfig");

/**
 * POST /api/v1/auth/verify-pin
 * Verify the app-level PIN for all users
 */
const verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ success: false, message: "PIN is required." });
    }

    const config = await AppConfig.getConfig();
    const isValid = await config.verifyPin(pin);

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Incorrect PIN." });
    }

    return res.status(200).json({ success: true, message: "PIN verified." });
  } catch (error) {
    console.error("verifyPin error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/v1/auth/admin/login
 * Admin login — returns JWT
 */
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    console.error("adminLogin error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/v1/auth/admin/reset-pin
 * Reset the app PIN (admin only) — requires current PIN for authentication.
 */
const resetPin = async (req, res) => {
  try {
    const { newPin, currentPin } = req.body;

    if (!currentPin) {
      return res.status(400).json({ success: false, message: "Current PIN is required." });
    }

    if (!newPin || String(newPin).length < 4) {
      return res.status(400).json({ success: false, message: "New PIN must be at least 4 digits." });
    }

    const config = await AppConfig.getConfig();

    // Verify the current PIN before allowing reset
    const isCurrentValid = await config.verifyPin(String(currentPin));
    if (!isCurrentValid) {
      return res.status(401).json({ success: false, message: "Current PIN is incorrect." });
    }

    config.pinHash = await bcrypt.hash(String(newPin), 12);
    await config.save();

    return res.status(200).json({ success: true, message: "PIN updated successfully." });
  } catch (error) {
    console.error("resetPin error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { verifyPin, adminLogin, resetPin };
