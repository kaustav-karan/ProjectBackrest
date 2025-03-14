const Track = require("../models/track.model.js");
const notifySuperPeer = require("../outboundReq/notifySuperPeer.js");

async function storeMetadata (
  trackId,
  publisherName,
  size,
  trackPath,
  fileName
) {
  try {
    const newFile = {
      "trackId": trackId,
      "publisherName": publisherName,
      "trackSize": size,
      "trackPath": trackPath,
      "fileName": fileName,
    };
    console.log("DEBUG: trackPath =", trackPath);
    console.log("DEBUG: type of trackPath =", typeof trackPath);

    await Track.create(newFile);

    await notifySuperPeer(trackId, publisherName, size)
      .then(() => {
        console.log("Notified super peer");
      })
      .catch((error) => {
        throw new Error(error);
      });
    console.log({ message: "Metadata stored successfully", newFile });
  } catch (error) {
    console.error(error);
  }
};

module.exports = storeMetadata;
