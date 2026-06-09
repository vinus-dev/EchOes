const mongoose = require("mongoose");

const mediaItemSchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: null,
  },
  resourceType: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const memorySchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    type: {
      type: String,
      enum: ["video", "photos", "mixed"],
      required: [true, "Memory type is required"],
    },
    mediaItems: {
      type: [mediaItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one media item is required",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for fuzzy search on name and title
memorySchema.index({ name: "text", title: "text", tags: "text" });

// Ensure at least one of code or name is provided
memorySchema.pre("save", function () {
  if (!this.code && !this.name) {
    throw new Error("Memory must have either a code or a name");
  }
});

module.exports = mongoose.model("Memory", memorySchema);
