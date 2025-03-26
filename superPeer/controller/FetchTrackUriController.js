const TrackLogSchema = require("../model/Track");
require("dotenv").config()

async function FetchTrackUri(req, res) {
  const { trackId } = req.body;

  try {
    // Fetch the track metadata from the database
    const trackInfo = await TrackLogSchema.findOne({ trackId });
    console.log(trackInfo)
    console.log("Request Received")
    if (!trackInfo) {
      console.log(`Track with ID ${trackId} not found`);
      return res.status(404).json({ message: "Track not found" });
    } else if (trackInfo.trackMetadata.peerAvailable) {
      return res
        .status(200)
        .json({ trackUri: trackInfo.trackMetadata.peerList[0].trackUri });
    } else {
      console.log("trackmetadata found in db", typeof process.env.SERVER_IP)
      res.status(200).json({ trackUri: "172.19.150.79" });     
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = FetchTrackUri;
