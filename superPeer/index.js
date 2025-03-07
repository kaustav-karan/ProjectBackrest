const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const TrackLog = require("./models/Track");
require("dotenv").config(); // Load environment variables

const app = express();

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

app.post("/publishFile", async (req, res) => {
  try {
    const { trackID, size, publisherName} = req.body;
    const peerIP = getClientIp(req);

    let checkExistingTrack = await TrackLog.findOne({ trackId: trackID });

    if (!checkExistingTrack) {
      const newTrack = new TrackLog({
        trackId: trackID,
        trackMetadata: {
          trackSize: size,
          publisherName: publisherName,
        },
      });
      await newTrack.save();
      console.log(`Stored new track metadata: ${trackID}`);
      res.status(200).json({ message: "File metadata stored successfully" });
    }
    else {
      return res.status(400).json({ error: "Track already exists" });
  }
  } catch (error) {
    console.error("Error storing file metadata:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/update-peer-list", async(req, res) => {
  const { clientIP, peerAvailable, trackID } = req.body;

  const trackInfo = await TrackLog.findOne({ trackID });
  trackInfo.trackMetadata.peerAvailable = peerAvailable;

  // Check if the peer already exists in the peerList
  const peerExists = trackInfo.trackMetadata.peerList.some(
    (peer) => peer.peerURI === peerURI
  );

  if (!peerExists) {
    trackInfo.trackMetadata.peerList.push({ peerURI: clientIP });
  }

  // Save the updated document back to MongoDB
  await trackInfo.save();
});

app.post("/get-file", async (req, res) => {
  const { trackID } = req.body;

  // Find the track in MongoDB
  const trackInfo = await TrackLog.findOne({ trackID });

  if (!trackInfo) {
    return res.status(404).json({ error: "Track metadata not found" });
  }else{
    if (trackInfo.trackMetadata.peerAvailable && trackInfo.trackMetadata.peerList.length > 0) {
      return res.status(200).json({ peerIP: trackInfo.trackMetadata.peerList[0].peerURI });
    }else{
      return res.status(200).json({ peerIP: process.env.SERVER_IP });
    }
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Logging server is running on port ${process.env.PORT}`);
});
