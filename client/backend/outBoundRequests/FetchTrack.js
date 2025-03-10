async function FetchTrack(trackId, trackUri) {
  try {
    const response = await axios.post(`http://${trackUri}:3001/seed/track`, {
      trackId: trackId,
    });
    return response.data; // Ensure the response contains trackPath, size, and publisherName
  } catch (error) {
    console.error("Error fetching track:", error);
    throw new Error("Error to fetch track data");
  }
}

module.exports = FetchTrack;
