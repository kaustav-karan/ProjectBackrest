// Description: This file is the entry point of the application. It is responsible for starting the server and connecting to the database.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const publishTrackRoutes = require("./routes/publishTrackRoute");

const app = express();
app.use(express.json());
app.use(cors());

app.use('/', publishTrackRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});