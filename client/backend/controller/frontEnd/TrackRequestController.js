const FetchTrack = require("../../outBoundRequests/FetchTrack");
const GetTrackUri = require("../../outBoundRequests/FetchTrackUri");
const TrackMetadataSchema = require("../../model/TrackMetadata");

async function TrackRequest(req, res) {
  try {
    const { trackId } = req.body;

    // Validate trackId
    if (!trackId) {
      return res.status(400).send({ error: "trackId is required" });
    }

    // Get track URI
    const trackUri = GetTrackUri(trackId);

    // Fetch track data
    const track = await FetchTrack(trackId, trackUri);

    // Save track metadata to MongoDB
    const newTrack = new TrackMetadataSchema({
      trackId: trackId,
      trackPath: track.trackPath, // Assuming trackPath is returned by FetchTrack
      size: track.size, // Assuming size is returned by FetchTrack
      publisherName: track.publisherName, // Assuming publisherName is returned by FetchTrack
    });

    await newTrack.save();

    // Send the track data as response
    res.send(track);
  } catch (error) {
    console.error("Error in TrackRequest:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = TrackRequest;
