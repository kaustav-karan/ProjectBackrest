const express = require("express");
const PublishTrack = require("../../controller/PublishTrackController");
const router = express.Router();

router.get("/", (_, res) => {
  res.send("Super Peer is up and running 🚀");
});

// router.post("/publishTrack", PublishTrack);
router.post("/publishTrack", PublishTrack);

module.exports = router;
