const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Singleton document — only one config record ever exists
const appConfigSchema = new mongoose.Schema(
  {
    pinHash: {
      type: String,
      required: true,
    },
    appName: {
      type: String,
      default: "EchOes",
    },
    tagline: {
      type: String,
      default: "Every number unlocks a memory.",
    },
  },
  { timestamps: true }
);

// Verify plain PIN against stored hash
appConfigSchema.methods.verifyPin = async function (pin) {
  return bcrypt.compare(String(pin), this.pinHash);
};

// Static method to get or create the singleton config
appConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    const defaultPin = process.env.DEFAULT_PIN || "1234";
    const pinHash = await bcrypt.hash(defaultPin, 12);
    config = await this.create({ pinHash });
    console.log("🔑 Default PIN config created.");
  }
  return config;
};

module.exports = mongoose.model("AppConfig", appConfigSchema);
