import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, User, Home } from 'lucide-react';
import axios from 'axios';

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('${import.meta.env.VITE_API_URL}/api/admin/register', {
        name,
        email,
        password
      });

      if (response.data.success) {
        // Store token and redirect to profile completion
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', response.data.user.name);
        
        navigate('/admin/profile/complete');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-white flex items-center justify-center p-4 relative">
      {/* Back to Landing Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-eco-main hover:text-eco-dark font-medium"
      >
        <Home size={20} />
        <span>Back Home</span>
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-eco-main p-3 rounded-lg">
              <Leaf className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-eco-dark">ECOLOOP</h1>
              <p className="text-xs text-gray-600">Admin Registration</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-eco-light">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-main focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecoloop.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-main focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-main focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-eco-main to-eco-dark text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">ℹ️ Note:</span> You'll complete your profile on the next step. Google Auth coming soon!
            </p>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an admin account?{' '}
              <Link to="/admin/login" className="text-eco-main font-semibold hover:text-eco-dark transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>For authorized administrators only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
