const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Favorite {
  constructor(favoriteData) {
    this.id = uuidv4();
    this.userId = favoriteData.userId || '';
    this.productId = favoriteData.productId || '';
    this.createdAt = new Date().toISOString();
  }

  static create(newFavorite, result) {
    // Extract and format the createdAt value
    const { createdAt, userId, ...favoriteData } = newFavorite;
    const formattedCreatedAt = new Date(createdAt).toISOString().slice(0, 19).replace('T', ' ');
  
    // Combine the formatted createdAt with the other data
    const favoriteWithFormattedDate = { ...favoriteData, createdAt: formattedCreatedAt, userId };
  
    db.query('INSERT INTO favorites SET ?', favoriteWithFormattedDate, (err, res) => {
      if (err) {
        console.error('Error creating favorite:', err);
        result(err, null);
      } else {
        console.log('Created favorite:', favoriteWithFormattedDate);
        result(null, favoriteWithFormattedDate);
      }
    });
  }
  
  static deleteById(favoriteId, result) {
    const deleteQuery = 'DELETE FROM favorites WHERE productId = ?';

    db.query(deleteQuery, favoriteId, (err, res) => {
      if (err) {
        console.error('Error deleting favorite by ID:', err);
        if (err.message.includes("ER_ROW_NOT_FOUND")) {
          result({ message: 'Favorite not found' }, null);
        } else {
          result(err, null);
        }
      } else {
        if (res.affectedRows === 0) {
          console.log('Favorite not found with ID:', favoriteId);
          result({ message: 'Favorite not found' }, null);
        } else {
          console.log('Favorite deleted successfully');
          result(null, res);
        }
      }
    });
  }


  

  static findByUserId(userId, result) {
    db.query('SELECT * FROM favorites WHERE userId = ?', userId, (err, res) => {
      if (err) {
        console.error('Error finding favorites by user ID:', err);
        result(err, null);
      } else {
        result(null, res);
      }
    });
  }
}

module.exports = Favorite;
