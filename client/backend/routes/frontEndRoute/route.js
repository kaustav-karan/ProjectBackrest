const express = require("express");
const router = express.Router();

// Middleware
const StoreTrack = require("../../middleware/StoreTrack");

// Add Custom Modules
const TrackRequest = require("../../controller/frontEnd/TrackRequestController");

// REST
router.get("/", (_, res) => {
  res.send("Server is up and running... 🟢");
});

router.post("/", (_, res) => {
  res.send("Hello World");
});

router.post("/trackRequest", StoreTrack.upload, TrackRequest);

router.put("/", (_, res) => {
  res.send("Hello World");
});

router.patch("/", (_, res) => {
  res.send("Hello World");
});

router.delete("/", (_, res) => {
  res.send("Hello World");
});

module.exports = router;
