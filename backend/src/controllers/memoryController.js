const Memory = require("../models/Memory");
const { cloudinary } = require("../config/cloudinary");

/**
 * GET /api/v1/memories/search?q=<query>
 * Public: Search memory by numeric code or name (fuzzy on name/title)
 */
const searchMemory = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const query = q.trim();
    let memory = null;

    // Try numeric code first
    const numericCode = parseInt(query, 10);
    if (!isNaN(numericCode)) {
      memory = await Memory.findOne({ code: numericCode, isActive: true });
    }

    // Fallback: exact name match (case-insensitive)
    if (!memory) {
      memory = await Memory.findOne({
        name: { $regex: `^${query}$`, $options: "i" },
        isActive: true,
      });
    }

    // Fallback: partial name/title text search
    if (!memory) {
      memory = await Memory.findOne({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { title: { $regex: query, $options: "i" } },
        ],
        isActive: true,
      });
    }

    if (!memory) {
      return res.status(404).json({ success: false, message: "No memory found for this code." });
    }

    // Increment view count
    await Memory.findByIdAndUpdate(memory._id, { $inc: { viewCount: 1 } });

    return res.status(200).json({ success: true, data: memory });
  } catch (error) {
    console.error("searchMemory error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/v1/memories
 * Admin: List all memories with pagination
 */
const getAllMemories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const type = req.query.type || "";

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
      const numCode = parseInt(search, 10);
      if (!isNaN(numCode)) filter.$or.push({ code: numCode });
    }
    if (type) filter.type = type;

    const [memories, total] = await Promise.all([
      Memory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Memory.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: memories,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getAllMemories error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/v1/memories/:id
 * Admin: Get single memory
 */
const getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: "Memory not found." });
    }
    return res.status(200).json({ success: true, data: memory });
  } catch (error) {
    console.error("getMemoryById error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/v1/memories
 * Admin: Create memory (media uploaded separately via /api/v1/media/upload)
 */
const createMemory = async (req, res) => {
  try {
    const { code, name, title, description, type, mediaItems, tags } = req.body;

    const memory = new Memory({
      code: code ? Number(code) : undefined,
      name,
      title,
      description,
      type,
      mediaItems: typeof mediaItems === "string" ? JSON.parse(mediaItems) : mediaItems,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
    });

    await memory.save();
    return res.status(201).json({ success: true, data: memory });
  } catch (error) {
    console.error("createMemory error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A memory with this code already exists." });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/memories/:id
 * Admin: Update memory
 */
const updateMemory = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.code) updates.code = Number(updates.code);
    if (updates.mediaItems && typeof updates.mediaItems === "string") {
      updates.mediaItems = JSON.parse(updates.mediaItems);
    }
    if (updates.tags && typeof updates.tags === "string") {
      updates.tags = updates.tags.split(",").map((t) => t.trim());
    }

    const memory = await Memory.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!memory) {
      return res.status(404).json({ success: false, message: "Memory not found." });
    }

    return res.status(200).json({ success: true, data: memory });
  } catch (error) {
    console.error("updateMemory error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/v1/memories/:id
 * Admin: Delete memory + all its Cloudinary media
 */
const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: "Memory not found." });
    }

    // Delete all associated Cloudinary media
    const deletePromises = memory.mediaItems.map((item) =>
      cloudinary.uploader.destroy(item.publicId, {
        resource_type: item.resourceType,
      })
    );
    await Promise.allSettled(deletePromises);

    await Memory.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Memory deleted successfully." });
  } catch (error) {
    console.error("deleteMemory error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/v1/memories/stats
 * Admin: Get dashboard statistics
 */
const getStats = async (req, res) => {
  try {
    const [total, videos, photos, mixed, totalViews] = await Promise.all([
      Memory.countDocuments(),
      Memory.countDocuments({ type: "video" }),
      Memory.countDocuments({ type: "photos" }),
      Memory.countDocuments({ type: "mixed" }),
      Memory.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        videos,
        photos,
        mixed,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("getStats error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { searchMemory, getAllMemories, getMemoryById, createMemory, updateMemory, deleteMemory, getStats };
