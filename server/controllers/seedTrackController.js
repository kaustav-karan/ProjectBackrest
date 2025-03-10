const Track = require("../models/track.model.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const notifySuperPeer = require("../outboundReq/availNotifySuperPeer.js");

async function seedTrack(req, res) {
  const { trackId } = req.body;
  const clientIp = req.headers["x-forwarded-for"];

  try {
    // Fetch metadata from PostgreSQL using trackId
    const fileRecord = await File.findOne({ where: { trackId } });

    const trackPath = path.join(FILES_DIR, fileRecord.trackPath); // Ensure path is correct

    // Check if the file exists
    fs.access(trackPath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({ error: "File not found" });
      }

      // Set headers for file download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(trackPath)}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      // Send the file
      res.sendFile(trackPath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send({ error: "Error sending file" });
        }

        // Send json response
        res.status(200).send({ trackId, trackName, publisherName, size });
        console.log(`Sent file and metadata to ${clientIp} backend: ${fileRecord.trackId}`);
      });
    });

    //notify super-peer of the availability of the file
    notifySuperPeer(fileRecord.trackId, clientIp);

  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
