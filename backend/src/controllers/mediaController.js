const { cloudinary } = require("../config/cloudinary");

/**
 * GET /api/v1/media/sign
 * Admin: Generate a signed Cloudinary upload signature.
 * The browser uses this to upload directly to Cloudinary (no Node buffering).
 *
 * Query params:
 *   resourceType  — "image" | "video"  (default: "image")
 *   chunkIndex    — optional, for chunked uploads
 */
const generateSignature = (req, res) => {
  try {
    const resourceType = req.query.resourceType === "video" ? "video" : "image";
    const folder = resourceType === "video" ? "echoes/videos" : "echoes/photos";
    const timestamp = Math.round(Date.now() / 1000);

    // Parameters that must be signed (must match what browser sends)
    const paramsToSign = {
      folder,
      timestamp,
    };

    // For images, add auto-quality + auto-format transformations
    if (resourceType === "image") {
      paramsToSign.transformation = "q_auto,f_auto";
    }

    // For videos, add eager thumbnail + quality settings
    if (resourceType === "video") {
      paramsToSign.eager = "so_1,w_400,h_300,c_fill/f_jpg";
      paramsToSign.eager_async = "true";
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
        resourceType,
        // Echo back the signed params so the browser knows exactly what to send
        transformation: resourceType === "image" ? "q_auto,f_auto" : undefined,
        eager: resourceType === "video" ? "so_1,w_400,h_300,c_fill/f_jpg" : undefined,
        eager_async: resourceType === "video" ? "true" : undefined,
      },
    });
  } catch (error) {
    console.error("generateSignature error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate upload signature." });
  }
};

/**
 * DELETE /api/v1/media/:publicId
 * Admin: Delete a single media item from Cloudinary
 */
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = "image" } = req.query;

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

module.exports = { generateSignature, deleteFile };
