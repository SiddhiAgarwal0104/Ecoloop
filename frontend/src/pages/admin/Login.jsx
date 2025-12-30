import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import api from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAdmin();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading_form, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setGeneralError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setLoading(true);
        setGeneralError('');
        
        // Send token to backend for verification
        const response = await api.post('/auth/google', {
          token: codeResponse.access_token
        });

        if (response.data.success) {
          // Store token and admin data
          localStorage.setItem('adminToken', response.data.token);
          localStorage.setItem('adminData', JSON.stringify(response.data.admin));
          
          // Check if profile is incomplete (assignedCity is 'Not Set' or phone is missing)
          if (response.data.admin.assignedCity === 'Not Set' || !response.data.admin.phone) {
            // Redirect to profile completion
            navigate('/admin/complete-profile');
          } else {
            // Redirect to dashboard
            navigate('/admin/dashboard');
          }
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Google login failed';
        setGeneralError(errorMsg);
        console.error('Google login error:', error);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      setGeneralError('Google login failed. Please try again.');
      console.error('Google login error:', error);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-eco-light to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-eco-main p-3 rounded-xl">
              <Leaf className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-eco-dark">EcoLoop</h1>
          <p className="text-gray-600 mt-2">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="card shadow-lg">
          <h2 className="text-2xl font-bold text-eco-dark mb-6 text-center">Admin Login</h2>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{generalError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-eco-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@ecoloop.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-eco-main'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-eco-dark mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-eco-main'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-eco-main rounded focus:ring-eco-main"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading_form}
              className="w-full bg-eco-main hover:bg-eco-dark text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading_form ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={() => googleLogin()}
            disabled={loading_form}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <image href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" width="20" height="20" />
            </svg>
            <span className="font-semibold text-gray-700">Sign in with Google</span>
          </button>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/admin/register" className="text-eco-main hover:text-eco-dark font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials (for development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-600">Email: admin@ecoloop.com</p>
            <p className="text-xs text-blue-600">Password: Admin@123456</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
