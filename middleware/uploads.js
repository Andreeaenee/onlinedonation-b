const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/donations/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
const uploadMiddleware = upload.single("image");

const handleFileSizeLimit = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ message: "File size limit exceeded. Max file size is 10MB." });
  }
  return next();
};

module.exports = {
  handleFileSizeLimit,
  uploadMiddleware,
};
