const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./postimage")
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now()
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// eksekusi
const postimages = multer({ storage });

module.exports = postimages