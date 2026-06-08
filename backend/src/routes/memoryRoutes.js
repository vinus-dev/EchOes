const express = require("express");
const router = express.Router();
const {
  searchMemory,
  getAllMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory,
  getStats,
} = require("../controllers/memoryController");
const { verifyAdminToken } = require("../middlewares/authMiddleware");

// Public
router.get("/search", searchMemory);

// Admin protected
router.get("/stats", verifyAdminToken, getStats);
router.get("/", verifyAdminToken, getAllMemories);
router.get("/:id", verifyAdminToken, getMemoryById);
router.post("/", verifyAdminToken, createMemory);
router.put("/:id", verifyAdminToken, updateMemory);
router.delete("/:id", verifyAdminToken, deleteMemory);

module.exports = router;
