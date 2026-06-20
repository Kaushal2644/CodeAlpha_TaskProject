import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * Create new order
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    // Validation
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Please provide products for the order' });
    }

    let totalAmount = 0;
    const orderProducts = [];

    // Validate and calculate total
    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity for product' });
      }

      totalAmount += product.price * item.quantity;
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    // Create order - start in \"Processing\" state for the UI timeline
    const order = await Order.create({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      status: 'Processing',
    });

    // Populate product details for response
    await order.populate('products.productId');

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's orders
 * GET /api/orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get single order by ID (user can only view own orders)
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Cancel an order for the current user
 * PUT /api/orders/:id/cancel
 */
export const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure the order belongs to the current user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancelling if still in early stages
    if (!['Placed', 'Processing'].includes(order.status)) {
      return res
        .status(400)
        .json({ message: 'Only orders that are Processing can be cancelled' });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all orders that include products for the current seller
 * GET /api/orders/seller
 */
export const getSellerOrders = async (req, res) => {
  try {
    // Fetch all orders and populate product + seller
    const orders = await Order.find()
      .populate({
        path: 'products.productId',
        populate: { path: 'sellerId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // Filter down to only orders that contain at least one product for this seller
    const sellerOrders = orders.filter((order) =>
      order.products.some(
        (item) =>
          item.productId &&
          item.productId.sellerId &&
          item.productId.sellerId._id.toString() === req.user._id.toString()
      )
    );

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update order status (seller/admin style endpoint)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id).populate('products.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure the order contains at least one product from this seller
    const isSellerOrder = order.products.some(
      (item) =>
        item.productId &&
        item.productId.sellerId &&
        item.productId.sellerId.toString() === req.user._id.toString()
    );

    if (!isSellerOrder) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
