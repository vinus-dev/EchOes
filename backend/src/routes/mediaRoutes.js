const express = require("express");
const router = express.Router();
const { uploadFiles, deleteFile } = require("../controllers/mediaController");
const { verifyAdminToken } = require("../middlewares/authMiddleware");

// Admin only — upload and delete media
router.post("/upload", verifyAdminToken, uploadFiles);
router.delete("/:publicId", verifyAdminToken, deleteFile);

module.exports = router;
