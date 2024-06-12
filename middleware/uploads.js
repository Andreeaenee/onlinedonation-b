const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Function to create the directory if it doesn't exist
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure multer for document storage
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = './uploads/others/';
    if (file.fieldname === 'logo') {
      dir = './uploads/logo/';
    } else if (file.fieldname === 'coverPhoto') {
      dir = './uploads/cover-photo/';
    } else if (file.fieldname === 'document') {
      dir = './uploads/document/';
    } else if (file.fieldname === 'contract') {
      dir = './uploads/contract/';
    }
    createDirectory(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Configure multer for single photo storage
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/donations/';
    createDirectory(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'logo' || file.fieldname === 'coverPhoto') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
  } else if (file.fieldname === 'document' || file.fieldname === 'contract') {
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
  }
  cb(null, true);
};

const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const uploadDocumentsMiddleware = uploadDocuments.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'contract', maxCount: 1 },
]);

const uploadMiddleware = uploadPhoto.single('image');

const handleFileSizeLimit = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ message: 'File size limit exceeded. Max file size is 10MB.' });
  }
  return next(err);
};

module.exports = {
  handleFileSizeLimit,
  uploadMiddleware,
  uploadDocumentsMiddleware,
};
