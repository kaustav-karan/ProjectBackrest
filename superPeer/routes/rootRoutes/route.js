const express = require("express");
const router = express.Router();

const NotifyNewPeer = require("../../controller/NotifyNewPeerController");

router.get("/", (_, res) => {
  res.send("Super Peer is up and running 🚀");
});

router.post("/notifyNewPeer", NotifyNewPeer);

module.exports = router;
