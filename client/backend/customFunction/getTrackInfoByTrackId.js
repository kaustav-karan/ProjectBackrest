async function getTrackInfoByTrackId(trackId) {
  try {
    const source = await axios.post(`${process.env.SUPER_PEER_URL}/get-file`, {
      trackId,
    });
    if (source.data && source.data.peerIp) {
      const { peerIp } = source.data; // Extracting peer IP from response
      console.log(`File found at: ${peerIp}`);
      return { peerIp };
    } else {
      return { error: "File not found" };
    }
  } catch (error) {
    console.error("Error contacting super-peer:", error.message);
    return { error: "Super-peer request failed" };
  }
}
module.exports = getTrackInfoByTrackId;
