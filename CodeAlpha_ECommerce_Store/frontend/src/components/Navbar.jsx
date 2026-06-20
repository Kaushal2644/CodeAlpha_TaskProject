import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Artisan's Corner
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Products
            </Link>

            {user ? (
              <>
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-blue-600 transition-colors relative"
                >
                  Cart
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Profile
                </Link>
                {user.role === 'seller' && (
                  <Link
                    to="/seller/dashboard"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
