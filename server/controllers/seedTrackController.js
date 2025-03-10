const Track = require("../models/track.model.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sequelize = require("../utils/psqlConnection.js");

async function seedTrack(req, res) {
  const { trackId } = req.body;
  const clientIp = req.headers["x-forwarded-for"];

  try {
    // Fetch metadata from PostgreSQL using trackId
    const fileRecord = await File.findOne({ where: { trackId } });

    const trackPath = path.join(FILES_DIR, fileRecord.trackPath); // Ensure path is correct

    // Read the entire file into memory
    const fileBuffer = fs.readFileSync(trackPath);

    // Prepare payload for client backend
    const track = {
      trackId: fileRecord.trackId,
      size: fileRecord.size,
      publisherName: fileRecord.publisherName,
      file: fileBuffer.toString("base64"), // Convert binary to base64
    };

    const availability = {
      trackId: fileRecord.trackId,
      peerAvailable: true,
      clientIp: clientIp,
    };

    // Send file + metadata to client backend at /load-file
    await axios.post(`http://${clientIp}:3001/load-file`, track, {
      headers: { "Content-Type": "application/json" },
    });

    //notify super-peer of the availability of the file
    await axios.post(
      `${process.env.SUPER_PEER_URL}/update-peer-list`,
      availability
    );

    console.log(`Sent file to client backend: ${fileRecord.trackId}`);

    res
      .status(200)
      .json({ message: "File successfully sent to client backend" });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
