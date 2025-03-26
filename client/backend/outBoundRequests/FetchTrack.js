const axios = require("axios");
const path = require("path");
const fs = require("fs");
const Track = require("../model/TrackMetadata");

async function FetchTrack(trackId, trackUri) {
  try {
    console.log(`REQUESTING ${trackUri}`);
    const response = await axios.post(
      `http://${trackUri}:3001/seed/track`,
      {
        trackId,
      },
      {
        responseType: "stream",
      }
    );

    console.log(response.data, typeof response.data);

    const localTrackPath = path.join(
      __dirname,
      `../publishedTracks/${response.headers.get("x-track-name")}`
    );
    console.log(localTrackPath);

    console.log("thats it, storing is fs");
    // console.log(trackMetadata)

    // Store track metadata in MongoDB
    const newTrack = new Track({
      trackId: trackId,
      trackPath: localTrackPath, // Store relative path
      trackSize: response.headers.get("x-track-size"),
      publisherName: response.headers.get("x-publisher-name"),
      trackName: response.headers.get("x-track-name"),
    });

    await newTrack.save(); // Save to MongoDB
    console.log("Track metadata stored in MongoDB ✅");

    // fs.writeFileSync(localTrackPath, response.data, "binary"); // Save file

    // Create a write stream to store the file locally
    const fileStream = fs.createWriteStream(localTrackPath);
    response.data.pipe(fileStream); // Writing to local file

    fileStream.on("finish", async () => {
      console.log("File saved locally ✅");
    });

    fileStream.on("error", (err) => {
      console.error("Error writing file:", err);
    });

    // RETURN track stream
    return {
      trackStream: response.data
    };
  } catch (error) {
    console.error("Error fetching track:", error);
    throw new Error("Error to fetch track data");
  }
}
module.exports = FetchTrack;
