const Review = require('../models/RateModal');


exports.createReview = (req, res) => {
  const newReview = new Review({
    userId: req.body.userId,
    productId: req.body.productId,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  Review.create(newReview, (err, review) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create review' });
    }
    res.status(201).json({ message: 'Review created successfully', review });
  });
};


exports.getReviewById = (req, res) => {
  const reviewId = req.params.id;

  Review.findById(reviewId, (err, review) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get review' });
    }
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(200).json({ review });
  });
};


exports.getAllReviews = (req, res) => {
  Review.getAll((err, reviews) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get reviews' });
    }
    res.status(200).json({ reviews });
  });
};


exports.updateReview = (req, res) => {
  const reviewId = req.params.id;
  const updatedReviewData = {
    userId: req.body.userId, 
    productId: req.body.productId,
    rating: req.body.rating,
    comment: req.body.comment,
  };

  Review.updateById(reviewId, updatedReviewData, (err, review) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update review' });
    }
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(200).json({ message: 'Review updated successfully', review });
  });
};


exports.deleteReview = (req, res) => {
  const reviewId = req.params.id;

  Review.deleteById(reviewId, (err, review) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete review' });
    }
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted successfully', review });
  });
};


