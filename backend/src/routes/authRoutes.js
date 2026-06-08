const express = require("express");
const router = express.Router();
const { verifyPin, adminLogin, resetPin } = require("../controllers/authController");
const { verifyAdminToken } = require("../middlewares/authMiddleware");

// Public
router.post("/verify-pin", verifyPin);
router.post("/admin/login", adminLogin);

// Admin protected
router.put("/admin/reset-pin", verifyAdminToken, resetPin);

module.exports = router;
