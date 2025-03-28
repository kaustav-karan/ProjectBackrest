const mongoose = require("mongoose");

const TrackMetadataSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true,
    unique: true,
  },
  trackPath: {
    type: String,
    required: true
  },
  trackSize: {
    type: Number,
    required: true,
  },
  publisherName: {
    type: String,
    required: true,
  },
  trackName: {
    type:String,
    required: true
  }
});

module.exports = mongoose.model("TrackMetadata", TrackMetadataSchema);