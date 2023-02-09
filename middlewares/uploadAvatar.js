const multer = require("multer");
const path = require("path");

const DIR = path.resolve(__dirname, "../tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    cb(null, req.user._id + file.originalname);
  },
});

const uploadMiddleware = multer({ storage });

module.exports = {
  uploadMiddleware,
};
