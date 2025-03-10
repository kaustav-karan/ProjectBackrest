const express = require("express");
const bodyParser = require("body-parser");
const mongoConnect = require("./utils/mongoConnect");
const routeConfig = require("./routes/routeConfig");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Function
mongoConnect();

app.use("", routeConfig);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
