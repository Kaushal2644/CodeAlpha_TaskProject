import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image is required'],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productSchema.index({ sellerId: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
