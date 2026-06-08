const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

/**
 * Cloudinary storage for images
 */
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "echoes/photos",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

/**
 * Cloudinary storage for videos
 */
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "echoes/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "webm", "mkv"],
    transformation: [{ quality: "auto" }],
  }),
});

/**
 * Cloudinary storage for mixed (auto-detect)
 */
const mixedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: isVideo ? "echoes/videos" : "echoes/photos",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "avi", "webm", "mkv"],
      transformation: [{ quality: "auto" }],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "video/avi",
    "video/webm",
    "video/x-matroska",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed.`), false);
  }
};

// Upload middleware for up to 20 mixed files
const uploadMedia = multer({
  storage: mixedStorage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max per file
}).array("media", 20);

module.exports = { uploadMedia };
