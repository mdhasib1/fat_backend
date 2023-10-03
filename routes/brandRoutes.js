const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Define brand routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);
router.post('/', brandController.createBrand);
router.put('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);
router.post('/import',brandController.uploadFile, brandController.uploadbrands);
router.post('/brand/update-display', brandController.updateDisplay);


module.exports = router;
