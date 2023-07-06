const multer = require("multer");
const { join } = require("path");

const UPLOAD_DIRECTORY = join(process.cwd(), "tmp");
const STORE_AVATARS_DIRECTORY = join(process.cwd(), "public", "avatars");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIRECTORY);
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now().toString()}_${file.originalname}`);
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({
  storage: storage,
});

module.exports = {
  UPLOAD_DIRECTORY,
  STORE_AVATARS_DIRECTORY,
  upload,
};
