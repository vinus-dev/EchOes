const express = require("express");
const router = express.Router();
const { verifyRecoveryQA, verifyRecoveryPassword } = require("../controllers/recoveryController");

// Recovery routes (no auth required)
router.post("/verify-qa", verifyRecoveryQA);
router.post("/verify-password", verifyRecoveryPassword);

module.exports = router;
