import express from 'express';
import multer from 'multer';
import {
  getAllProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes - Seller only
router.get('/seller/my-products', protect, isSeller, getMyProducts);
router.post('/', protect, isSeller, upload.single('image'), createProduct);
router.put('/:id', protect, isSeller, upload.single('image'), updateProduct);
router.delete('/:id', protect, isSeller, deleteProduct);

export default router;
