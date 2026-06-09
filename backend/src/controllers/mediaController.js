const { cloudinary } = require("../config/cloudinary");
const { uploadMedia } = require("../middlewares/uploadMiddleware");

/**
 * POST /api/v1/media/upload
 * Admin: Upload media files to Cloudinary
 * Returns array of media item objects to attach to a memory
 */
const uploadFiles = (req, res) => {
  uploadMedia(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      const errMsg = err.message || "Upload failed.";
      const isCloudinaryAuthError =
        /Unknown API key|Invalid Signature|api key|cloudinary/i.test(errMsg);

      if (isCloudinaryAuthError) {
        return res.status(502).json({
          success: false,
          message:
            "Cloudinary authentication failed. Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env, then restart the backend.",
        });
      }

      return res.status(400).json({ success: false, message: errMsg });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }

    const mediaItems = req.files.map((file, index) => {
      const isVideo = file.mimetype.startsWith("video/");
      return {
        publicId: file.filename, // set by multer-storage-cloudinary
        url: file.path,          // secure_url set by cloudinary
        thumbnail: isVideo
          ? file.path.replace("/upload/", "/upload/so_1,w_400,h_300,c_fill/f_jpg/")
          : null,
        resourceType: isVideo ? "video" : "image",
        order: index,
      };
    });

    return res.status(200).json({
      success: true,
      message: `${mediaItems.length} file(s) uploaded successfully.`,
      data: mediaItems,
    });
  });
};

/**
 * DELETE /api/v1/media/:publicId
 * Admin: Delete a single media item from Cloudinary
 */
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = "image" } = req.query;

    // publicId may contain slashes (e.g. echoes/photos/abc123)
    const decodedId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedId, {
      resource_type: resourceType,
    });

    if (result.result === "not found") {
      return res.status(404).json({ success: false, message: "File not found in Cloudinary." });
    }

    return res.status(200).json({ success: true, message: "File deleted from Cloudinary." });
  } catch (error) {
    console.error("deleteFile error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { uploadFiles, deleteFile };
