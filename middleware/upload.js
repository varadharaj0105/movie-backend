// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set up file storage destination and naming convention
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // This is where the file will be saved (local folder)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
