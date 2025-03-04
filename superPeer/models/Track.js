const mongoose = require("mongoose");

const TrackLogSchema = new mongoose.Schema({
  trackId: { type: String, required: true }, // Unique ID of the track
  trackSize: { type: Number, required: true }, // Size of the track
  sentBy: { type: String, required: true }, // Who sent the track (e.g., "server" or "peer1")
  sentTo: { type: String, required: true }, // Who received the track (e.g., "peer1" or "peer2")
  timestamp: { type: Date, default: Date.now }, // When the track was sent
});

module.exports = mongoose.model("TrackLog", TrackLogSchema);
