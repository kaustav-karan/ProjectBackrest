const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");

require("dotenv").config(); // Load environment variables from .env file

const app = express();

// Define constants
const MONGODB_URL = process.env.MONGODB_URL; // Add this line
const PORT = process.env.PORT || 3001; // Add this line
const FILES_DIR = path.join(__dirname, "files");

// Ensure the files directory exists
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow the frontend client running on port:3000 to talk to the backend client
    methods: ["GET", "POST"], // Allow only GET and POST methods
  },
});

app.use(cors()); // Middleware to allow cross-origin requests
app.use(express.json());

// Define MongoDB schemas and models
const trackSchema = new mongoose.Schema({
  trackId: { type: String, required: true },
  fileName: { type: String, required: true }, // Unique name of the file
  filePath: { type: String, required: true }, // Store path to cached file
  size: { type: Number, required: true },
  publisherName: { type: String, required: true },
});

const trackLogSchema = new mongoose.Schema({
  trackId: { type: String, required: true },
  trackMetadata: {
    fileName: { type: String, required: true },
    trackSize: { type: Number, required: true },
    peerAvailable: { type: Boolean, required: true },
  },
});

const Track = mongoose.model("Track", trackSchema);
const TrackLog = mongoose.model("TrackLog", trackLogSchema);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// WebSocket connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("file-fetched", (data) => {
    console.log(`File fetched: ${data.trackId}`);
    io.emit("message", `File "${data.trackId}" was fetched!`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Endpoint to receive and store the file
app.post("/load-file", async (req, res) => {
  try {
    const { trackId, size, publisherName, file, fileName } = req.body;

    if (!trackId || !size || !publisherName || !file || !fileName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save file to cache directory using its original name
    const filePath = path.join(FILES_DIR, fileName);
    fs.writeFileSync(filePath, Buffer.from(file, "base64"));

    console.log(`File cached at: ${filePath}`);

    // Save metadata and file path to MongoDB
    await Track.create({ trackId, fileName, size, publisherName, filePath });

    res.status(200).json({ message: "File received and stored", filePath });
  } catch (error) {
    console.error("Error handling file:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API to fetch file based on trackId
app.post("/get-file", async (req, res) => {
  try {
    // Extract trackId from request body
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ error: "trackId is required" });
    }

    // Find the track in MongoDB
    const track = await Track.findOne({ trackId });

    // Check for file metadata on super-peer
    if (!track) {
      console.log(
        `trackId ${trackId} not found. Forwarding request to super-peer...`
      );

      // Forward request to the super-peer
      try {
        const source = await axios.post(
          `${process.env.SUPER_PEER_URL}/get-file`,
          { trackId }
        );
        console.log("Response from super-peer:", source.data);
        if (source.data && source.data.peerIp) {
          const { peerIp } = source.data; // Extracting peer Ip from response
          console.log(`File found at: ${peerIp}`);

          // Now make another request to fetch the file from the identified source (peer/server)
          const fileResponse = await axios.post(`http://${peerIp}:3001/fetch-file`, {
            trackId,
          });
          return res.status(200).json({ file: fileResponse.data.file });
        } else {
          return res.status(404).json({ error: "File not found on any peer" });
        }
      } catch (error) {
        console.error("Error contacting super-peer:", error.message);
        return res.status(500).json({ error: "Super-peer request failed" });
      }
    }

    // Check if file exists
    if (!fs.existsSync(track.filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Read file and encode to Base64
    const fileData = fs.readFileSync(track.filePath);
    const encodedFile = fileData.toString("base64");

    res.status(200).json({ file: encodedFile, filePath: track.filePath });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API to fetch file from the peer/server
app.post("/fetch-file", async (req, res) => {
  const { trackId } = req.body;

  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!trackId) {
    return res.status(400).json({ error: "trackId is required" });
  }

  try {
    // Fetch metadata from MongoDB using trackId
    const fileRecord = await TrackLog.findOne({ trackId: trackId });

    if (!fileRecord) {
      return res.status(404).json({ error: "File metadata not found" });
    }

    const filePath = path.join(
      FILES_DIR,
      `${fileRecord.trackMetadata.fileName}`
    ); // Ensure the correct file path

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Read the entire file into memory
    const fileBuffer = fs.readFileSync(filePath);

    // Prepare payload for client backend
    const track = {
      trackId: fileRecord.trackId,
      fileName: fileRecord.trackMetadata.fileName,
      size: fileRecord.trackMetadata.trackSize,
      publisherName: fileRecord.trackMetadata.publisherName,
      peerAvailable: fileRecord.trackMetadata.peerAvailable,
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

    // Notify super-peer of the availability of the file
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
});

// Start the server
server.listen(3001, () => {
  console.log(`Server running on port 3001`);
});
