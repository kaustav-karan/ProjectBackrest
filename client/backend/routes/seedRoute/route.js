const express = require("express");
const router = express.Router();
const SeedTrack = require("../../controller/seed/SeedTrackController");

// REST
router.get("/", (_, res) => {
  res.send("Server is up and running... 🟢");
});

router.post("/", (_, res) => {
  res.send("Hello World");
});

router.post("/track", SeedTrack);

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
