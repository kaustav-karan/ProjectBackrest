const Track = require("../models/track.model.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const availNotifySuperPeer = require("../outboundReq/availNotifySuperPeer.js");

function getIPv4(ip) {
  if (ip.includes("::ffff:")) {
    return ip.split("::ffff:")[1]; // Extracts the IPv4 part
  }
  return ip; // Returns as is if it's already IPv4
}

async function seedTrack(req, res) {
  console.log("request recieved!")
  const { trackId } = req.body;
  const clientIpv6 = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
  const clientIp = getIPv4(clientIpv6);

  console.log(clientIp)
  const fileRecord = await Track.findOne({ where: { trackId } });
  const localTrackPath = path.join(__dirname, `../${fileRecord.trackPath}`); // Ensure path is correct

  try{
    // Set headers for file download
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${path.basename(localTrackPath)}"`
  );
  res.setHeader("Content-Type", "application/octet-stream");
  // Send metadata in headers
  res.setHeader("X-Track-Id", fileRecord.trackId);
  res.setHeader("X-Track-Name", fileRecord.fileName);
  res.setHeader("X-Publisher-Name", fileRecord.publisherName);
  res.setHeader("X-Track-Size", fileRecord.trackSize);        

  console.log("fine till here")
  }catch(error) {
    throw new Error(error)
  }

  try {
    console.log("started")
    // Check if the file exists
    fs.access(localTrackPath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({ error: "File not found" });
      }
      console.log("mil gyi ab bhej rha hu")

      if (res.destroyed) return;  

      // Send the file
      res.sendFile(localTrackPath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send({ error: "Error sending file" });
        }
        console.log(`Sent file and metadata to ${clientIp} backend: ${fileRecord.trackId}`);
      });
    });

    // // Send json response
    // res.status(200).json({ trackId: fileRecord.trackId, trackName: fileRecord.fileName, publisherName: fileRecord.publisherName, trackSize: fileRecord.trackSize });

    //notify super-peer of the availability of the file
    availNotifySuperPeer(fileRecord.trackId, clientIp);

  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = seedTrack;