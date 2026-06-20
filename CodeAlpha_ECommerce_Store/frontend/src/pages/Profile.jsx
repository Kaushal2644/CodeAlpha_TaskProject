import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout, becomeSeller } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBecomeSeller = async () => {
    setLoading(true);
    setMessage('');
    const result = await becomeSeller();
    if (result.success) {
      setMessage('Successfully became a seller!');
    } else {
      setMessage(result.message || 'Failed to become seller');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Page</h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h2>

        <div className="space-y-4 mb-6">
          <div>
            <span className="text-sm font-medium text-gray-500">Name:</span>
            <p className="text-lg text-gray-900">{user?.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <p className="text-lg text-gray-900">{user?.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Role:</span>
            <p className="text-lg text-gray-900 capitalize">{user?.role}</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes('Successfully')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          {user?.role === 'user' && (
            <button
              onClick={handleBecomeSeller}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Become a Seller'}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
