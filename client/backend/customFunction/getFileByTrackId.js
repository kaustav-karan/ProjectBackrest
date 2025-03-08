async function getFileByTrackId(trackId, clientIp) {
  try {
    const response = await axios.post(`http://${clientIp}:3001/fetch-file`, {
      trackId,
    });
    if (response.data && response.data.file) {
      const { file } = response.data;
      console.log("File found:", file);
      return { file };
    } else {
      return { error: "File not found" };
    }
  } catch (error) {
    console.error("Error contacting server:", error.message);
    return { error: "File request failed" };
  }
}
module.exports = getFileByTrackId;