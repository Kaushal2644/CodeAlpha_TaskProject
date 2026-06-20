import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

const statusStyles = {
  Processing: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Shipped: 'bg-blue-100 text-blue-800 border border-blue-200',
  Delivered: 'bg-green-100 text-green-800 border border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border border-red-200',
  Placed: 'bg-blue-100 text-blue-800 border border-blue-200',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      // Update local state with new status
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? response.data.order : order))
      );
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by status tab
      if (activeFilter !== 'All') {
        if (activeFilter === 'Processing') {
          if (!['Placed', 'Processing'].includes(order.status)) return false;
        } else if (order.status !== activeFilter) {
          return false;
        }
      }

      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      const primaryProductName =
        order.products?.[0]?.productId?.name?.toLowerCase() || '';
      const orderIdShort = order._id?.slice(-6).toLowerCase();

      return (
        primaryProductName.includes(term) ||
        order._id.toLowerCase().includes(term) ||
        orderIdShort.includes(term)
      );
    });
  }, [orders, activeFilter, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStatusBadge = (status) => {
    const labelMap = {
      Placed: 'Processing',
      Processing: 'Processing',
      Shipped: 'Shipped',
      Delivered: 'Delivered',
      Cancelled: 'Cancelled',
    };
    const label = labelMap[status] || status || 'Processing';
    const classes = statusStyles[status] || statusStyles.Processing;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>
        {label}
      </span>
    );
  };

  const renderStatusTimeline = (status) => {
    const steps = ['Processing', 'Shipped', 'Delivered'];
    const cancelled = status === 'Cancelled';

    return (
      <div className="flex items-center space-x-3 mt-2">
        {steps.map((step, index) => {
          const isCompleted = !cancelled && steps.indexOf(status) >= index;
          const isCurrent = !cancelled && step === status;

          return (
            <div key={step} className="flex items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  cancelled
                    ? 'bg-red-300'
                    : isCompleted
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              />
              {index < steps.length - 1 && (
                <div
                  className={`w-14 h-1 mx-1 rounded-full ${
                    cancelled
                      ? 'bg-red-200'
                      : isCompleted
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-gray-600 text-lg">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your purchases, check delivery status, and manage your orders.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by product or order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {['All', 'Processing', 'Delivered', 'Cancelled'].map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-600 text-lg mb-2">No orders found.</p>
          <p className="text-sm text-gray-500">
            Try changing the filter or search term, or place a new order from the home page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const primaryItem = order.products?.[0];
            const product = primaryItem?.productId;
            const canCancel = ['Placed', 'Processing'].includes(order.status);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row md:items-stretch gap-4"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No Image</span>
                    )}
                  </div>
                </div>

                {/* Middle content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {product?.name || 'Order Items'}
                        </h3>
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Order ID:{' '}
                        <span className="font-mono">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Ordered on <span className="font-medium">{formatDate(order.createdAt)}</span>
                      </p>
                      <div className="mt-3">
                        {renderStatusBadge(order.status)}
                        {renderStatusTimeline(order.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between items-stretch md:items-end gap-2 md:w-52">
                  <div className="flex md:flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => alert('Tracking flow not implemented in this demo.')}
                      className="flex-1 md:w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Track Order
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Order details page not implemented in this demo.')}
                      className="flex-1 md:w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => handleCancel(order._id)}
                      disabled={cancellingId === order._id}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-red-200 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    >
                      {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
