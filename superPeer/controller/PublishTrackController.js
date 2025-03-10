const TrackLogSchema = require("../model/Track");

async function PublishTrack(req, res) {
  const { trackId } = req.body;

  try {
    // Fetch the track metadata from the database
    const trackInfo = await TrackLogSchema.findOne({ trackId });
    if (!trackInfo) {
      // Create a new track log

      const newTrackLog = new TrackLogSchema({
        trackId,
        trackMetadata: {
          publisherName: req.body.publisherName,
          size: req.body.size,
          peerAvailable: false,
        },
      });
      await newTrackLog.save();
      console.log(`Track: ${trackId} Published Successfully
      `);
      return res
        .status(200)
        .json({ message: `Track: ${trackId} Published Successfully` });
    } else {
      console.log(`Track with ID ${trackId} already exists`);
      return res.status(301).json({ message: "Track already exists" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = PublishTrack;
