const express = require("express");
require("dotenv").config();
const cors = require("cors")
const bodyParser = require("body-parser");

// Add Custom Modules
const mongoConnect = require("./utils/mongoConnect");
const routeConfig = require("./routes/routeConfig");

// Create an express app
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
const PORT = process.env.PORT;

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
