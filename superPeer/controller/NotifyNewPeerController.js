const TrackLogSchema = require("../model/Track");

async function NotifyNewPeer(req, res) {
  const { trackId, clientIp, peerAvailable } = req.body;

  // Validate required fields
  if (!trackId || !clientIp) {
    return res.status(400).send({ error: "trackId and clientIp are required" });
  }

  try {
    // Find the track by trackId
    const track = await TrackLogSchema.findOne({ trackId: trackId });
    if (!track) {
      return res.status(404).send({ error: "Track not found" });
    }

    // Update peerAvailable in trackMetadata
    track.trackMetadata.peerAvailable =
      peerAvailable !== undefined ? peerAvailable : false;

    // Create a new peer object
    const peer = {
      clientIp: clientIp,
      peerAvailable: peerAvailable !== undefined ? peerAvailable : false,
    };

    // Initialize peerList if it doesn't exist
    if (!track.trackMetadata.peerList) {
      track.trackMetadata.peerList = [];
    }

    // Add the new peer to the peerList
    track.trackMetadata.peerList.push(peer);

    // Save the updated track
    await track.save();

    // Send success response
    res.status(200).send({ message: "Peer added successfully" });
  } catch (error) {
    console.error("Error in NotifyNewPeer:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = NotifyNewPeer;