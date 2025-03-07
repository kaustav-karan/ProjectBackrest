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

//creating a http server and upgrading it to a websocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow the frontend client running on port:3000 to talk to the backend client
    methods: ["GET", "POST"], // Allow only GET and POST methods
  },
});
const FILES_DIR = path.join(__dirname, "files");


app.use(cors()); // middleware to allow cross-origin requests
app.use(express.json());

app.get("/", (req, res) => {
  res.send("WebSocket Server is running");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("file-fetched", (data) => {
    console.log(`File fetched: ${data.trackID}`);
    io.emit("message", `File "${data.trackID}" was fetched!`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const trackSchema = new mongoose.Schema({
  trackID: { type: String, required: true },
  file: { type: String, required: true }, //unique name of the file
  filePath: { type: String, required: true }, // Store path to cached file
  size: { type: Number, required: true },
  publisherName: { type: String, required: true },
});

const Track = mongoose.model("Track", trackSchema);

// Endpoint to receive and store the file
app.post("/load-file", async (req, res) => {
  try {
    const { trackID, size, publisherName, file, filename } = req.body;

    if (!trackID || !size || !publisherName || !file || !filename) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save file to cache directory using its original name
    const filePath = path.join(FILES_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(file, "base64"));

    console.log(`File cached at: ${filePath}`);

    // Save metadata and file path to MongoDB
    await Track.create({ trackID, size, publisherName, filePath });

    res.status(200).json({ message: "File received and stored", filePath });

  } catch (error) {
    console.error("Error handling file:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API to fetch file based on trackID
app.post("/get-file", async (req, res) => {
  try {
    const { trackID } = req.body;
    if (!trackID) {
      return res.status(400).json({ error: "TrackID is required" });
    }

    // Find the track in MongoDB
    const track = await Track.findOne({ trackID });
    if (!track) {
      console.log(`TrackID ${trackID} not found. Forwarding request to super-peer...`);
      
      // Forward request to the super-peer
      try {
        const source = await axios.post(`${process.env.SUPER_PEER_URL}/get-file`, { trackID });
        console.log("Response from super-peer:", source.data);
        if (response.data && response.data.peerIP) {
          const { peerIP } = response.data;  // Extracting peer IP from response
          console.log(`File found at: ${peerIP}`);

          // Now make another request to fetch the file from the identified source (peer/server)
          const fileResponse = await axios.post(`http://${peerIP}/fetch-file`, { trackID });
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
    const fileData = fs.readFileSync(track.filePath, "utf8");
    const encodedFile = Buffer.from(fileData, "utf8").toString("base64");

    res.status(200).json({ file: encodedFile, filePath: track.filePath });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API to fetch file from the peer/server
app.post("/fetch-file", async (req, res) => {
  const { trackID } = req.body;
  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!trackID) {
    return res.status(400).json({ error: "trackID is required" });
  }

  try {
    // Fetch metadata from MongoDB using trackID
    const fileRecord = await TrackLog.findOne({ trackId: trackID });

    if (!fileRecord) {
      return res.status(404).json({ error: "File metadata not found" });
    }

    const filePath = path.join(FILES_DIR, `${trackID}.mp3`); // Ensure the correct file path

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Read the entire file into memory
    const fileBuffer = fs.readFileSync(filePath);

    // Prepare payload for client backend
    const track = {
      trackID: fileRecord.trackId,
      fileName: fileRecord.trackMetadata.fileName,
      size: fileRecord.trackMetadata.trackSize,
      peerAvailable: fileRecord.trackMetadata.peerAvailable,
      file: fileBuffer.toString("base64"), // Convert binary to base64
    };

    const availability = {
      trackID: fileRecord.trackId,
      peerAvailable: true,
      clientIP: clientIP,
    };

    // Send file + metadata to client backend at /load-file
    await axios.post(`http://${clientIP}:3001/load-file`, track, {
      headers: { "Content-Type": "application/json" },
    });

    // Notify super-peer of the availability of the file
    await axios.post(`${SUPER_PEER_URL}/update-peer-list`, availability);

    console.log(`Sent file to client backend: ${fileRecord.trackId}`);

    res.status(200).json({ message: "File successfully sent to client backend" });

  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log("Server running on port 3001");
});
