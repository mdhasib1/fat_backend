const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const {protect,admin} = require("../Middleware/authMiddleware");

// Create a new favorite
router.post('/favorites',protect, favoriteController.createFavorite);

// Delete a favorite by ID
router.delete('/favorites/:id', favoriteController.deleteFavoriteById);

// Find favorites by user ID
router.get('/favorites/:userId', favoriteController.findFavoritesByUserId);

module.exports = router;
