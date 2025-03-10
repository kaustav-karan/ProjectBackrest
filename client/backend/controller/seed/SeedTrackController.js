const fs = require("fs");
const path = require("path");
const TrackMetadataSchema = require("./models/TrackMetadataSchema"); // Adjust the path to your schema

async function SeedTrack(req, res) {
  try {
    const { trackId } = req.body;

    // Validate trackId
    if (!trackId) {
      return res.status(400).send({ error: "trackId is required" });
    }

    // Check if trackId is present in MongoDB
    const track = await TrackMetadataSchema.findOne({ trackId: trackId });
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
      });
    });
  } catch (error) {
    console.error("Error in SeedTrack:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = SeedTrack;