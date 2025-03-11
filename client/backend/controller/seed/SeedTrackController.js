const fs = require("fs");
const path = require("path");
const TrackMetadataSchema = require("./models/TrackMetadataSchema"); // Adjust the path to your schema
const notifySuperPeer = require("../../outBoundRequests/availNotifySuperPeer");

async function SeedTrack(req, res) {
  try {
    const { trackId } = req.body;
    const clientIp = req.headers["x-forwarded-for"];

    // Validate trackId
    if (!trackId) {
      return res.status(400).send({ error: "trackId is required" });
    }

    // Check if trackId is present in MongoDB
    const track = await TrackMetadataSchema.findOne({ trackId: trackId });
    const { trackName, publisherName, size } = track;
    if (!track) {
      return res.status(404).send({ error: "Track not found" });
    }

    // Resolve the file path
    const trackPath = path.resolve(track.trackPath);

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

        // Notify the super Peer of the availability of the file
        notifySuperPeer(trackId, clientIp);
      });
    });
  } catch (error) {
    console.error("Error in SeedTrack:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = SeedTrack;
