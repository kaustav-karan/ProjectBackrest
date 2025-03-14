const express = require("express");
const router = express.Router();

const seedTrack = require("../controllers/seedTrackController");

router.post("/track", seedTrack);

module.exports = router;