const mongoose = require("mongoose");

// Peer Model Schema
const peerModel = new mongoose.Schema({
  trackUri: {
    type: String,
    required: true,
  },
});

// Track Log Schema
const TrackLogSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true,
  },
  trackMetadata: {
    publisherName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    peerAvailable: {
      type: Boolean,
      required: true,
    },
    peerList: [peerModel],
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TrackLog", TrackLogSchema);
