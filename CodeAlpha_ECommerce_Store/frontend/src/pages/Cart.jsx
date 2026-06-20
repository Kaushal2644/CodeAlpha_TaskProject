import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        products: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await api.post('/orders', orderData);
      clearCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart Page</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart Page</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.productId} className="p-6 flex items-center space-x-6">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  ₹{item.product.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.productId, parseInt(e.target.value) || 1)
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{getTotal().toFixed(2)}
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
