// Connect to MongoDB Function

const mongoose = require("mongoose");
require("dotenv").config();

const mongoConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
};

module.exports = mongoConnect;
