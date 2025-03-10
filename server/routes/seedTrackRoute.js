const express = require("express");
const router = express.Router();

const seedTrack = require("../controllers/seedTrackController");

router.post("/seedTrack", seedTrack);