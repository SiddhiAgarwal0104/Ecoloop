import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Login Page Component
 * Supports all three roles: HOUSEHOLD, NGO, RECYCLER
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '' // Optional, will auto-detect if not provided
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 [Login] Attempting login:', { email: formData.email, role: formData.role || 'auto-detect' });

      const response = await login(formData);
      
      console.log('✅ [Login] Login successful:', {
        role: response?.data?.user?.role || response?.user?.role,
        profileCompleted: response?.data?.user?.profileCompleted,
        needsProfileCompletion: response?.needsProfileCompletion
      });

      const user = response?.data?.user || response?.user;

      // Check if profile needs completion
      if (response?.needsProfileCompletion || response?.data?.needsProfileCompletion) {
        console.log('🔄 [Login] Redirecting to profile completion');
        navigate('/profile/complete');
        return;
      }

      // Route based on role
      if (user?.role === 'NGO') {
        console.log('✅ [Login] NGO user - navigating to NGO dashboard');
        navigate('/ngo/dashboard');
      } else if (user?.role === 'RECYCLER') {
        console.log('✅ [Login] Recycler user - navigating to recycler dashboard');
        navigate('/recycler/dashboard');
      } else {
        console.log('✅ [Login] Household user - navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed';
      console.error('❌ [Login] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      console.log('🔐 [Google Login] Processing Google sign-in');

      const response = await googleSignIn({
        credential: credentialResponse.credential
      });
      
      console.log('✅ [Google Login] Response:', response);

      const user = response?.data?.user;

      // Check if profile completion needed
      if (response.needsProfileCompletion || response?.data?.needsProfileCompletion) {
        console.log('🔄 [Google Login] Redirecting to profile completion');
        navigate('/profile/complete');
        return;
      }

      // Check if NGO pending verification
      if (response?.data?.isNGOPendingVerification) {
        setError('Your NGO is pending admin verification. You will receive an email once approved.');
        return;
      }

      // Route based on role
      if (user?.role === 'NGO') {
        navigate('/ngo/dashboard');
      } else if (user?.role === 'RECYCLER') {
        navigate('/recycler/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Google sign-in failed';
      console.error('❌ [Google Login] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-dark to-eco-main flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-eco-main rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">♻️</span>
          </div>
          <h1 className="text-3xl font-bold text-eco-dark mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Login to your EcoLoop account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Google Sign-In */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed')}
            theme="outline"
            size="large"
          />
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-eco-main hover:text-eco-dark font-bold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;