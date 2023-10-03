// taxRoutes.js

const express = require('express');
const router = express.Router();
const taxController = require('../controllers/TaxCalculateControllers');

// Define a route for tax calculation
router.post('/calculate', taxController.calculateTaxes);

module.exports = router;
