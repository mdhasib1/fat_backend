const Favorite = require('../models/Favorite');

// Create a new favorite
exports.createFavorite = (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'Invalid userId or productId' });
    }

    const newFavorite = new Favorite({ userId, productId });

    Favorite.create(newFavorite, (err, favorite) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating favorite' });
      }
      return res.status(201).json(favorite);
    });
  } catch (error) {
    console.error('Error creating favorite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteFavoriteById = (req, res) => {
  try {
    const favoriteId = req.params.id;

    Favorite.deleteById(favoriteId, (err, result) => {
      if (err) {
        console.log(err); // Log the error for debugging

        // Check if it's a specific "Favorite not found" error
        if (err.message === 'Favorite not found') {
          return res.status(404).json({ error: 'Favorite not found' });
        }

        return res.status(500).json({ error: 'Error deleting favorite by ID' });
      }

      return res.status(200).end();
    });
  } catch (error) {
    console.error('Error deleting favorite by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



// Find favorites by user ID
exports.findFavoritesByUserId = (req, res) => {
  try {
    const userId = req.params.userId;

    Favorite.findByUserId(userId, (err, favorites) => {
      if (err) {
        return res.status(500).json({ error: 'Error finding favorites by user ID' });
      }
      return res.status(200).json(favorites);
    });
  } catch (error) {
    console.error('Error finding favorites by user ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
