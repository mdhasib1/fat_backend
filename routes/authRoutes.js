const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {protect,admin} = require("../Middleware/authMiddleware");

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user/:id', protect, authController.getUser);
router.get('/admin/users',  authController.getAllUsers);
router.get('/loginStatus', authController.loginStatus);
router.post('/logout', authController.logoutUser);






module.exports = router;
