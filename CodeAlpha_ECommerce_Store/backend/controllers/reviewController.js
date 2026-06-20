import Review from '../models/Review.js';
import Product from '../models/Product.js';

/**
 * Get reviews for a product
 * GET /api/reviews/product/:productId
 */
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a review
 * POST /api/reviews
 */
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validation
    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create review
    const review = await Review.create({
      productId,
      userId: req.user._id,
      rating,
      comment: comment || '',
    });

    await review.populate('userId', 'name');

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a review
 * PUT /api/reviews/:id
 */
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();
    await review.populate('userId', 'name');

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get average rating for a product
 * GET /api/reviews/product/:productId/average
 */
export const getProductAverageRating = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId });
    
    if (reviews.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    res.json({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
