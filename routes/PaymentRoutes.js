const express = require('express');
const router = express.Router();
const PaymentControllers = require('../controllers/PaymentControllers');


router.post('/payment', PaymentControllers.payment);
router.post('/payment/confirm/:paymentIntentId', PaymentControllers.adminCapturePayment);
router.post('/payment/cancel/:paymentIntentId', PaymentControllers.cancelPayment);




module.exports = router;
