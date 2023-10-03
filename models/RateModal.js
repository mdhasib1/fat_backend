const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Review {
  constructor(reviewData) {
    this.id = uuidv4();
    this.userId = reviewData.userId;
    this.productId = reviewData.productId;
    this.rating = reviewData.rating;
    this.comment = reviewData.comment || '';
  }

  static create(newReview, result) {
    db.query(
      'INSERT INTO reviews SET ?',
      newReview,
      (err, res) => {
        if (err) {
          console.error('Error creating review:', err);
          result(err, null);
        } else {
          console.log('Created review:', newReview);
          result(null, newReview);
        }
      }
    );
  }

  static findById(reviewId, result) {
    db.query(
      'SELECT * FROM reviews WHERE id = ?',
      [reviewId],
      (err, res) => {
        if (err) {
          console.error('Error finding review by ID:', err);
          result(err, null);
        } else {
          if (res.length) {
            const review = res[0];
            result(null, review);
          } else {
            // If no review with the specified ID is found
            result({ message: 'Review not found' }, null);
          }
        }
      }
    );
  }

  static getAll(result) {
    db.query(
      'SELECT * FROM reviews',
      (err, res) => {
        if (err) {
          console.error('Error getting all reviews:', err);
          result(err, null);
        } else {
          const reviews = res;
          result(null, reviews);
        }
      }
    );
  }

}

module.exports = Review;
