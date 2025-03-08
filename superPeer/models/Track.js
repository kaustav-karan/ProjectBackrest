const mongoose = require("mongoose");

// const TrackLogSchema = new mongoose.Schema({
//   filename: { type: String, required: true }, // Unique ID of the track
//   trackSize: { type: Number, required: true }, // Size of the track
//   sentBy: { type: String, required: true }, // Who sent the track (e.g., "server" or "peer1")
//   sentTo: { type: String, required: true }, // Who received the track (e.g., "peer1" or "peer2")
//   timestamp: { type: Date, default: Date.now }, // When the track was sent
// });

const peerModel = {
  // peerId: { type: String, required: true },
  peerURI: { type: String, required: true }, //peer Ip address
  // peerStatus: { type: Boolean, default: false }, //peer up or down??
};

const TrackLogSchema = new mongoose.Schema({
  trackId: { type: String, required: true }, // Unique ID of the track
  trackMetadata: {
    // stale: {type: Boolean, default: false},
    publisherName: { type: String, required: true },
    trackSize: { type: Number, required: true }, // Size of the track

    // When Peer is available, this will be set to true
    peerAvailable: { type: Boolean, default: false },

    // List of peers that have the track
    peerList: [peerModel],
  }, // Unique ID of the track
  timestamp: { type: Date, default: Date.now }, // When the track was sent
});

module.exports = mongoose.model("TrackLog", TrackLogSchema);
