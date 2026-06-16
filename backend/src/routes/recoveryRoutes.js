const express = require("express");
const router = express.Router();
const {
  verifyAdminCredentials,
  recoveryResetPin,
  verifySecurityAnswerForAdmin,
  resetAdminCredentials,
  verifyRecoveryQA,
  verifyRecoveryPassword,
} = require("../controllers/recoveryController");

// ─── PIN Recovery (from Forgot PIN on PinPage) ────────────────────────────────
// Step 1: verify admin username + password → get resetToken
router.post("/verify-admin", verifyAdminCredentials);
// Step 2: use resetToken to reset the app PIN
router.post("/reset-pin", recoveryResetPin);

// ─── Admin Credential Recovery (from AdminLoginPage Forgot credentials?) ──────
// Step 1: verify SECURITY_ANSWER → get credResetToken
router.post("/verify-security-for-admin", verifySecurityAnswerForAdmin);
// Step 2: use credResetToken to reset admin password
router.post("/reset-admin-creds", resetAdminCredentials);

// ─── Legacy routes (kept for backward compat) ─────────────────────────────────
router.post("/verify-qa", verifyRecoveryQA);
router.post("/verify-password", verifyRecoveryPassword);

module.exports = router;
