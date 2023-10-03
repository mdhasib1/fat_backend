const express = require('express');
const router = express.Router();
const productController = require('../controllers/Product');


router.post('/create', productController.createProduct);
router.get('/:id', productController.getProductById);
router.get('/', productController.getAllProducts);
router.delete('/:id', productController.deleteProductById);
router.put('/:id', productController.updateProduct);
router.put('/:id/variants/:variantId', productController.updateProductVariantStockById);
router.post('/update-display', productController.updateDisplay);





module.exports = router;
