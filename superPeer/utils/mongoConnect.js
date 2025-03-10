// Connect to MongoDB Function

const mongoose = require("mongoose");
require("dotenv").config();

async function mongoConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.log("❌ Error connecting to MongoDB");
    throw new Error(error);
  }
}

module.exports = mongoConnect;
