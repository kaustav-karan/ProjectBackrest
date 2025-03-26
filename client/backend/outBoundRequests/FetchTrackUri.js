const axios = require("axios");
require("dotenv").config();

async function GetTrackUri(trackId) {
  console.log(process.env.SUPER_PEER_IP)
  try {
    // await axios
    //   .post(`http://${process.env.SUPER_PEER_IP}:${process.env.SUPER_PEER_PORT}/peer/fetchTrackUri`, {
    //     trackId
    //   })
    //   .then((response) => {
    //     // console.log(response.data.trackUri)
    //     return response.data.trackUri;
    //   });

      const response = await axios.post(`http://${process.env.SUPER_PEER_IP}:${process.env.SUPER_PEER_PORT}/peer/fetchTrackUri`, {
        trackId
      })

      return response.data.trackUri

      // if (!response) {
      //   throw new error
      //   console.log("no response")
      // }
  } catch (error) {
    throw error;
  }
}

module.exports = GetTrackUri;
