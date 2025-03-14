const axios = require("axios");
require("dotenv").config();

async function availNotifySuperPeer(trackId, clientIp) {
  await axios
    .post(`${process.env.SUPER_PEER_URL}/notifyNewPeer`, {
      trackId,
      peerAvailable: true,
      clientIp,
    })
    .then(() => {
      console.log("Notified super peer of the availability of the file");
    })
    .catch((error) => {
      throw new Error(error);
    });
}

module.exports = availNotifySuperPeer;
