const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const TrackLog = require("./models/Track");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/superPeer")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Helper function to get the client's IP address
const getClientIp = (req) => {
  // If the server is behind a proxy, use the 'X-Forwarded-For' header
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    return forwardedFor.split(",")[0]; // The first IP in the list is the client's IP
  }
  // Otherwise, use the direct connection's remote address
  return req.connection.remoteAddress;
};

// Route 1: Log a track sent by the main server to a peer
app.post("/log/server-to-peer", async (req, res) => {
  const { trackId, trackSize, sentTo } = req.body;
  const sentBy = getClientIp(req); // Use the client's IP address

  try {
    const log = new TrackLog({ trackId, trackSize, sentBy, sentTo });
    await log.save();
    res.status(201).json({ message: "Track log saved successfully", log });
  } catch (err) {
    res.status(500).json({ error: "Failed to save track log", details: err });
  }
});

// Route 2: Log a track sent by a peer to another peer
app.post("/log/peer-to-peer", async (req, res) => {
  const { trackId, trackSize, sentTo } = req.body;
  const sentBy = getClientIp(req); // Use the client's IP address

  try {
    const log = new TrackLog({ trackId, trackSize, sentBy, sentTo });
    await log.save();
    res.status(201).json({ message: "Track log saved successfully", log });
  } catch (err) {
    res.status(500).json({ error: "Failed to save track log", details: err });
  }
});

// Route 3: Query which devices have a particular track
app.get("/query/track/:trackId", async (req, res) => {
  const { trackId } = req.params;

  try {
    const logs = await TrackLog.find({ trackId });
    if (logs.length > 0) {
      // Extract unique devices that have the track
      const devices = new Set();
      logs.forEach((log) => {
        devices.add(log.sentBy); // Add sender
        devices.add(log.sentTo); // Add receiver
      });
      res.status(200).json({
        message: "Devices with the track",
        devices: Array.from(devices),
      });
    } else {
      res.status(404).json({ message: "No logs found for the given trackId" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to query track logs", details: err });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Logging server is running on port ${PORT}`);
});
