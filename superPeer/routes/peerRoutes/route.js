const express = require("express");
const FetchTrackUri = require("../../controller/FetchTrackUriController");
const router = express.Router();

router.get("/", (_, res) => {
    res.send("Super Peer is up and running 🚀");
});
    
router.post("/fetchTrackUri", FetchTrackUri);

module.exports = router;