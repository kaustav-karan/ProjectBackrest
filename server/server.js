const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const randID = require("./controllers/randomIDGenerator.js");
const multer = require("multer");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config(); // Load environment variables

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL connection using Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// Define File model (stores metadata only)
const File = sequelize.define("File", {
  trackId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  fileName: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false },
  size: { type: DataTypes.INTEGER, allowNull: false },
  publisherName: { type: DataTypes.STRING, allowNull: false },
});

// Notify super-peer when a new file is added
File.afterCreate(async (file) => {
  try {
    await axios.post(
      `http://${process.env.SUPER_PEER_Ip}:${process.env.SUPER_PEER_PORT}/publishFile`,
      {
        trackId: file.trackId,
        // filePath: file.filePath,
        size: file.size,
        publisherName: file.publisherName,
      }
    );
    console.log("Super-peer notified successfully.");
  } catch (error) {
    console.error("Error notifying super-peer:", error.message);
  }
});

// Sync database
sequelize.sync().then(() => console.log("Database connected and synced"));

// Multer configuration (stores only the file)
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload API (stores only metadata in PostgreSQL)
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { publisher_name } = req.body;

    // generate a random trackId using the randID function
    const trackId = randID();

    // Store metadata in PostgreSQL
    const newFile = await File.create({
      trackId: trackId,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      size: req.file.size, // Correctly storing size
      publisherName: publisher_name,
    });

    res
      .status(200)
      .json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading file", error: error.message });
  }
});

app.post("/fetch-file", async (req, res) => {
  const { trackId } = req.body;

  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!trackId) {
    return res.status(400).json({ error: "trackId is required" });
  }

  try {
    // Fetch metadata from PostgreSQL using trackId
    const fileRecord = await File.findOne({ where: { trackId } });

    if (!fileRecord) {
      return res.status(404).json({ error: "File metadata not found" });
    }

    const filePath = path.join(FILES_DIR, fileRecord.filePath); // Ensure path is correct

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Read the entire file into memory
    const fileBuffer = fs.readFileSync(filePath);

    // Prepare payload for client backend
    const track = {
      trackId: fileRecord.trackId,
      file: fileRecord.fileName,
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
});

app.listen(PORT, () => {
  console.log(`📂 File Server running at http://localhost:${PORT}`);
});
