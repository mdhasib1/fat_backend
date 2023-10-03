const express = require('express');
const router = express.Router();
const upsController = require('../controllers/upsController')


router.post('/rate', upsController.getUserShippingRate);






module.exports = router;
