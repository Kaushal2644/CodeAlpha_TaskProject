import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/seller/my-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  // Simple derived metrics for the summary cards
  const { totalProducts, avgPrice, highestPrice } = useMemo(() => {
    if (!products.length) {
      return { totalProducts: 0, avgPrice: 0, highestPrice: 0 };
    }

    const totalProducts = products.length;
    const prices = products.map((p) => p.price || 0);
    const sum = prices.reduce((acc, val) => acc + val, 0);
    const avgPrice = sum / totalProducts;
    const highestPrice = Math.max(...prices);

    return { totalProducts, avgPrice, highestPrice };
  }, [products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-2xl px-8 py-10 text-white shadow-lg mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Seller Dashboard &amp; Shopping Flow
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-blue-100">
            Monitor your catalog, understand pricing, and manage your storefront from a
            clean, focused control panel designed for artisans.
          </p>
        </div>
        <Link
          to="/seller/product/add"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-blue-700 font-semibold shadow-md hover:bg-blue-50 transition"
        >
          + Add New Product
        </Link>
      </div>

      {/* Summary cards inspired by the image */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {/* Seller Control Panel */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Seller Control Panel</h2>
          <p className="text-sm text-gray-600 mb-4">
            Overview of your live products, pricing, and catalog health in one glance.
          </p>
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Active Listings</span>
            <span className="text-2xl font-bold text-blue-600">{totalProducts}</span>
          </div>
        </div>

        {/* Shopping Cart / Pricing insight */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Shopping Cart Insight</h2>
          <p className="text-sm text-gray-600 mb-4">
            Keep prices consistent and attractive with quick visibility into your catalog
            pricing.
          </p>
          <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Average Price</span>
              <span className="font-semibold text-gray-900">
                ₹{avgPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Highest Priced Item</span>
              <span className="font-semibold text-gray-900">
                ₹{highestPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Management (conceptual, since orders are buyer-side) */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Management</h2>
          <p className="text-sm text-gray-600 mb-4">
            Pair this dashboard with the orders view to track how your creations move
            from cart to doorstep.
          </p>
          <div className="mt-auto pt-4 border-t border-gray-100 text-sm text-gray-500">
            Tip: use the <span className="font-semibold text-gray-800">My Orders</span>{' '}
            page (as a buyer) to simulate full shopping flow during demos.
          </div>
        </div>
      </div>

      {/* Products table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center border border-dashed border-gray-300">
          <p className="text-gray-600 text-lg mb-4">
            You haven&apos;t published any products yet.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Start by adding a handcrafted item to see it appear in this dashboard and on
            the storefront.
          </p>
          <Link
            to="/seller/product/add"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-800">{products.length}</span>{' '}
              items
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md mr-4 ring-1 ring-gray-200"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <Link
                        to={`/seller/product/edit/${product._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
