const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageControllers');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/', upload.single('file'), imageController.uploadImage);

module.exports = router;
