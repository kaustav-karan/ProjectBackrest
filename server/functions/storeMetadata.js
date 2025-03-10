const Track = require("../models/track.model.js");
const notifySuperPeer = require("../outboundReq/notifySuperPeer.js");

const storeMetadata = async (
  trackId,
  publisherName,
  fileName,
  size,
  trackPath
) => {
  try {
    const newFile = {
      trackId: trackId,
      publisherName: publisherName,
      // fileName: fileName,
      trackSize: size,
      trackPath: trackPath,
    };
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
