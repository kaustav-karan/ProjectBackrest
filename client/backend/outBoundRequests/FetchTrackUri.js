const axios = require("axios");
require("dotenv").config();

async function GetTrackUri(trackId) {
  try {
    await axios
      .post(`http://${SUPER_PEER_IP}:${SUPER_PEER_PORT}/peer/fetchTrackUri`, {
        trackId: trackId,
      })
      .then((response) => {
        return response.data.trackUri;
      });
  } catch (error) {
    throw error;
  }
}

module.exports = GetTrackUri;
