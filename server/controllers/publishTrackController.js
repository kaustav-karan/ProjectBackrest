const randId = require("../functions/randomIdGenerator.js");
const storeMetadata = require("../functions/storeMetadata.js");
const notifySuperPeer = require("../outboundReq/notifySuperPeer.js");

const publishTrackController = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { publisherName } = req.body;

    // generate a random trackId using the randID function
    const trackId = randId();

    // Store metadata in PostgreSQL
    storeMetadata(
      trackId,
      publisherName,
      // req.file.filename,
      req.file.size,
      `/publishedTracks/${req.file.filename}`
    );

    // Notify super-peer of the availability of the file
    notifySuperPeer(trackId, req.file.size, publisherName);

    res.status(200).json({
      message: "File uploaded and metadata stored successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = publishTrackController;
