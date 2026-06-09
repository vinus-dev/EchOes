require("dotenv").config({ override: true });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Admin = require("./src/models/Admin");
const AppConfig = require("./src/models/AppConfig");
const { configureMongoDns } = require("./src/config/mongodbDns");

const seed = async () => {
  try {
    configureMongoDns();

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB for seeding...");

    // Seed admin
    const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (!existing) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await Admin.create({ username: process.env.ADMIN_USERNAME, passwordHash });
      console.log(`✅ Admin "${process.env.ADMIN_USERNAME}" created.`);
    } else {
      console.log(`ℹ️  Admin "${process.env.ADMIN_USERNAME}" already exists.`);
    }

    // Seed AppConfig (PIN)
    await AppConfig.getConfig();
    console.log("✅ AppConfig seeded.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
