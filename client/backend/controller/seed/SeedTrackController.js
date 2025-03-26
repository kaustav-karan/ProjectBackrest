const fs = require("fs");
const path = require("path");
const Track = require("../../model/TrackMetadata"); // Adjust the path to your schema
const availNotifySuperPeer = require("../../outBoundRequests/availNotifySuperPeer");

function getIPv4(ip) {
  if (ip.includes("::ffff:")) {
    return ip.split("::ffff:")[1]; // Extracts the IPv4 part
  }
  return ip; // Returns as is if it's already IPv4
}

async function SeedTrack(req, res) {
  console.log("request recieved!");
  const { trackId } = req.body;
  const clientIpv6 =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip;
  const clientIp = getIPv4(clientIpv6);
  const fileRecord = await Track.findOne({ trackId });
  // const localTrackPath = path.join(__dirname, `../${fileRecord.trackPath}`);
  const localTrackPath = trackPath

  try {
    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(localTrackPath)}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    // Send metadata in headers
    res.setHeader("X-Track-Id", fileRecord.trackId);
    res.setHeader("X-Track-Name", fileRecord.trackName);
    res.setHeader("X-Publisher-Name", fileRecord.publisherName);
    res.setHeader("X-Track-Size", fileRecord.trackSize);

    console.log("fine till here");
  } catch (error) {
    throw new Error(error);
  }

  try {
    console.log("started");

    fs.access(localTrackPath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({ error: "File not found" });
      }
      console.log("mil gyi ab bhej rha hu");

      if (res.destroyed) return;

      // Send the file
      res.sendFile(localTrackPath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send({ error: "Error sending file" });
        }
        console.log(
          `Sent file and metadata to ${clientIp} backend: ${fileRecord.trackId}`
        );
      });
      // Notify the super Peer of the availability of the file
      availNotifySuperPeer(trackId, clientIp);
    });
  } catch (error) {
    console.error("Error in SeedTrack:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = SeedTrack;
