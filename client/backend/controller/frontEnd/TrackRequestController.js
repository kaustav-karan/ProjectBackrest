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
    const trackUri = await GetTrackUri(trackId);

    // Fetch track data
    const {trackStream} = await FetchTrack(trackId, trackUri, res);
    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain"); // Adjust if another format
    res.setHeader("Content-Disposition", `inline; filename="${trackId}"`);
    trackStream.pipe(res);

  } catch (error) {
    console.error("Error in TrackRequest:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = TrackRequest;