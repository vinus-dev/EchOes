const cloudinary = require("cloudinary").v2;

const isPlaceholder = (value) => !value || /^your_/i.test(String(value).trim());

const maskKey = (value) => {
  const str = String(value || "");
  if (str.length <= 4) {
    return "****";
  }
  return `${"*".repeat(str.length - 4)}${str.slice(-4)}`;
};

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
    throw new Error(
      "Cloudinary credentials are missing or placeholder values. Update CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env and restart the backend."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log(`☁️  Cloudinary configured (cloud: ${cloudName}, key: ${maskKey(apiKey)}).`);
};

module.exports = { cloudinary, configureCloudinary };
