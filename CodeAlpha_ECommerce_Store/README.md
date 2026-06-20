# Artisan's Corner

A complete, beginner-friendly, production-style MERN (MongoDB, Express, React, Node.js) e-commerce platform for multi-vendor marketplace.

Live Project on: https://artisan-s-ax9b.vercel.app/

## 🚀 Features

- **User Authentication**: Register, login with JWT tokens
- **Role-Based Access**: Users can become sellers
- **Product Management**: Sellers can add, edit, and delete products
- **Shopping Cart**: Add products to cart, update quantities, place orders
- **Payment Integration**: Not implemented (see note below)
- **Order Management**: View order history with status tracking
- **Review System**: Users can rate and review products
- **Image Upload**: Cloudinary integration for product images
- **Responsive UI**: Modern, clean design with Tailwind CSS

## 📝 Note about Payments (Stripe / Razorpay)

Payment functionality is **not developed** in this project because **Stripe account cannot be created** (facing an error while creating the account) and the **same issue happens with Razorpay**.  
So the app currently places an order directly from the cart without online payment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account (for image uploads)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd artisans-corner
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/artisans-corner
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important**: Replace the placeholder values with your actual credentials:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- Cloudinary credentials: Get these from your Cloudinary dashboard

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

No payment-specific frontend environment variables are required.

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
artisans-corner/
├── backend/
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── productController.js # Product CRUD operations
│   │   └── orderController.js   # Order management
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authentication & role checking
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Product.js          # Product schema
│   │   └── Order.js            # Order schema
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── productRoutes.js    # Product endpoints
│   │   └── orderRoutes.js      # Order endpoints
│   ├── utils/
│   │   └── generateToken.js    # JWT token generation
│   ├── server.js               # Express server setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Authentication state
│   │   │   └── CartContext.jsx  # Shopping cart state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   └── AddEditProduct.jsx
│   │   ├── utils/
│   │   │   └── api.js           # Axios configuration
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/become-seller` - Become a seller (protected)

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `GET /api/products/seller/my-products` - Get seller's products (seller only)
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get single order (protected)

### Reviews
- `GET /api/reviews/product/:productId` - Get reviews for a product (public)
- `GET /api/reviews/product/:productId/average` - Get average rating (public)
- `POST /api/reviews` - Create review (protected)
- `PUT /api/reviews/:id` - Update review (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)

## 🎯 User Roles

### User (Buyer)
- Browse products
- Add products to cart
- Place orders
- View order history
- Become a seller

### Seller
- All user capabilities
- Add products
- Edit own products
- Delete own products
- View seller dashboard

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes (frontend & backend)
- Role-based access control
- Input validation

## 🎨 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- bcryptjs for password hashing

### Frontend
- React (Vite)
- React Router
- Tailwind CSS
- Context API (State Management)
- Axios (HTTP client)

## 📝 Notes

- This is a beginner-friendly project focused on MERN fundamentals
- No payment gateway integration
- No admin panel
- Simplified for learning and interview preparation

## 🤝 Contributing

This is a learning project. Feel free to fork and modify for your own use!

## 📄 License

This project is open source and available for educational purposes.

---
