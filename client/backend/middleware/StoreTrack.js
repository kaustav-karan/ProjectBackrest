const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            await fs.mkdir("../publishedTracks", { recursive: true });
            cb(null, "../publishedTracks");
        } catch (err) {
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + "-" + path.extname(file.originalname);
        req.body.filePath = path.join("../publishedTracks", filename);
        cb(null, filename);
    },
});
const upload = multer({ storage: storage });

module.exports = upload;
