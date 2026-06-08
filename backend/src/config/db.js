const mongoose = require("mongoose");

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(
        `❌ MongoDB connection attempt ${retries}/${maxRetries} failed: ${error.message}`
      );

      if (retries === maxRetries) {
        console.error("💀 Max retries reached. Exiting process.");
        process.exit(1);
      }

      const delay = Math.pow(2, retries) * 1000;
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected.");
});

module.exports = connectDB;
