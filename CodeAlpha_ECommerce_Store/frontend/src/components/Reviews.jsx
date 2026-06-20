import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Reviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}/average`);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const isOwnReview = (review) => {
    if (!user) return false;
    const reviewerId = review.userId?._id || review.userId;
    return reviewerId === user._id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        productId,
        rating,
        comment,
      });
      setComment('');
      setRating(5);
      setShowForm(false);
      fetchReviews();
      fetchAverageRating();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditRating(5);
    setEditComment('');
  };

  const handleEditSubmit = async (e, reviewId) => {
    e.preventDefault();
    try {
      await api.put(`/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment,
      });
      setEditingId(null);
      setEditRating(5);
      setEditComment('');
      fetchReviews();
      fetchAverageRating();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      setEditingId(null);
      fetchReviews();
      fetchAverageRating();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const hasUserReviewed = reviews.some((review) => isOwnReview(review));

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="mt-8">Loading reviews...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reviews</h2>
          {totalReviews > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-gray-600">
                {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {user && !hasUserReviewed && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setComment('');
                  setRating(5);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const own = isOwnReview(review);
            const isEditing = editingId === review._id;

            return (
              <div key={review._id} className="bg-white p-6 rounded-lg shadow-md">
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleEditSubmit(e, review._id)}
                    className="space-y-4"
                  >
                    <h4 className="font-semibold text-gray-900">Edit your review</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`text-2xl ${
                              star <= editRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Share your experience..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.userId?.name || 'User'}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {user && own && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(review)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review._id)}
                            disabled={deletingId === review._id}
                            className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === review._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
