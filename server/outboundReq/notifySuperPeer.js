const axios = require("axios");
require("dotenv").config();

async function notifySuperPeer(trackId, size, publisherName) {
  await axios
    .post(`${process.env.SUPER_PEER_URL}/server/publishTrack`, {
      trackId,
      publisherName,
      size,
    })
    .then(() => {
      console.log("Notified super peer");
    })
    .catch((error) => {
      throw new Error(error);
    });
}

module.exports = notifySuperPeer;
