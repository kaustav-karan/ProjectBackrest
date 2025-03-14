// Description: This file is the entry point of the application. It is responsible for starting the server and connecting to the database.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser")
const publishTrackRoutes = require("./routes/publishTrackRoute");
const seedTrackRoutes = require("./routes/seedTrackRoute");

const app = express();
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/upload', publishTrackRoutes);

app.use("/seed", seedTrackRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});