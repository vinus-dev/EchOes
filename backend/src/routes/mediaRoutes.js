const express = require("express");
const router = express.Router();
const { generateSignature, deleteFile } = require("../controllers/mediaController");
const { verifyAdminToken } = require("../middlewares/authMiddleware");

// Admin only — generate upload signature (browser uploads directly to Cloudinary)
router.get("/sign", verifyAdminToken, generateSignature);

// Admin only — delete media from Cloudinary
router.delete("/:publicId", verifyAdminToken, deleteFile);

module.exports = router;
