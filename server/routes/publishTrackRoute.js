const express = require("express");
const router = express.Router();
const publishTrack = require("../controllers/publishTrackController");
const upload = require("../middlewares/storeTrackController");

router.post("/publishTrack", upload.single("track"), publishTrack);

module.exports = router;
