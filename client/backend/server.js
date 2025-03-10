const express = require("express");
require("dotenv").config();

// Add Custom Modules
const mongoConnect = require("./utils/mongoConnect");
const routeConfig = require("./routes/routeConfig");

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Function
mongoConnect();

// All route configurations are defined here
// This file is used by the server to configure the routes
// and the corresponding controllers
app.use("/", routeConfig);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
