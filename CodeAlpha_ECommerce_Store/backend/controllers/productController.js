import Product from '../models/Product.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

/**
 * Get all products (public)
 * GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get single product by ID (public)
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get seller's own products
 * GET /api/products/seller/my-products
 */
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create new product (seller only)
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    // Validation
    if (!name || !price || !description) {
      return res.status(400).json({ message: 'Please provide all product fields' });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(req.file.buffer);

    // Create product
    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      imageUrl: uploadResult.secure_url,
      sellerId: req.user._id,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update product (seller can only update own products)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update fields
    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (description) product.description = description;

    // Handle image update if provided
    if (req.file) {
      // Delete old image from Cloudinary (optional - you might want to keep old images)
      // Extract public_id from old imageUrl if needed
      
      // Upload new image
      const uploadResult = await uploadImage(req.file.buffer);
      product.imageUrl = uploadResult.secure_url;
    }

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete product (seller can only delete own products)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete image from Cloudinary (optional)
    // You can extract public_id from imageUrl and delete it

    // Delete product
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
