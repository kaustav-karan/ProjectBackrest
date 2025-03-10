const axios = require("axios");
require("dotenv").config();

async function availNotifySuperPeer(trackId, clientIp) {
  await axios
    .post(`http://${clientIp}:3001/notifyNewPeer`, {
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
