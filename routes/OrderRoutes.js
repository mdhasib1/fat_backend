const express = require('express');
const router = express.Router();
const OrderControllers = require('../controllers/PaymentControllers');



router.get('/orders', OrderControllers.getAllOrders);
router.get('/users/:userId/orders', OrderControllers.getUserOrders);




module.exports = router;
