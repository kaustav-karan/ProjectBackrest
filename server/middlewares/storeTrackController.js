const multer = require("multer");
const path = require("path");

// Multer configuration (stores only the file)
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../publishedTracks"), // Stores in 'publishedTracks' folder
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
