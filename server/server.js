const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;
const FILES_DIR = path.join(__dirname, "files");
const SUPER_PEER_PORT = 5001;
const SUPER_PEER_IP = "localhost";
const SUPER_PEER_URL = `http://${SUPER_PEER_IP}:${SUPER_PEER_PORT}`;

app.use(cors());
app.use(express.json());

// Endpoint to list available files
app.get("/files", (req, res) => {
  fs.readdir(FILES_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: "Could not list files" });
    res.json(files);
  });
});

// Endpoint to send a requested file
app.post("/get-file", (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    res.status(400).json({ error: "Filename is required" });
  }

  const filePath = path.join(FILES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, filename, async (err) => {
    if (err) res.status(500).json({ error: "Error sending file" });

    //sending super peer the json onject (details of the file and the peer)
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const requestData = { filename, clientIP };

    try {
      await axios.post(SUPER_PEER_URL, requestData);
      console.log(`Notified super-peer: ${JSON.stringify(requestData)}`);
    } catch (error) {
      console.error("Failed to notify super-peer:", error.message);
    }
  });
});

app.listen(PORT, () => {
  console.log(`📂 File Server running at http://localhost:${PORT}`);
});
