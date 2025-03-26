const axios = require("axios");
require("dotenv").config();

async function availNotifySuperPeer(trackId, clientIp) {
  await axios
    .post(`http://${process.env.SUPER_PEER_IP}:${process.env.SUPER_PEER_PORT}/notifyNewPeer`, {
      trackId,
      peerAvailable: true,
      trackUri: clientIp,
    })
    .then(() => {
      console.log("Notified super peer of the availability of the file");
    })
    .catch((error) => {
      throw new Error(error);
    });
}

module.exports = availNotifySuperPeer;
