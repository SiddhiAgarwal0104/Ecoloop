import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Leaf, User, Mail, Lock, Phone, AlertCircle, Heart, Home } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'HOUSEHOLD',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register({
        ...formData,
        locality: 'Not Set',
        address: 'Not Set',
      });
      
      // If NGO registration, show pending verification message
      if (formData.role === 'NGO') {
        setError('');
        alert('✅ Registration successful! Your NGO is pending admin verification. You will receive an email once approved. You can login once verified.');
        navigate('/login');
      } else {
        navigate('/profile/complete');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const response = await googleLogin(credentialResponse.credential, formData.role);
      
      // Check if NGO pending verification
      if (!response.success && response.data?.isNGOPendingVerification) {
        alert('✅ Registration successful! Your NGO is pending admin verification. You will receive an email once approved. You can login once verified.');
        navigate('/login');
        return;
      }
      
      // ✅ Explicit navigation based on response
      if (response.needsProfileCompletion) {
        navigate('/profile/complete');
      } else if (response.user.role === 'NGO') {
        navigate('/ngo/dashboard');
      } else if (response.user.role === 'RECYCLER') {
        navigate('/recycler/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-eco-main p-3 rounded-2xl mb-4">
            <Leaf className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Join EcoLoop</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            I am a *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'HOUSEHOLD' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.role === 'HOUSEHOLD'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Home className={`mx-auto mb-2 ${formData.role === 'HOUSEHOLD' ? 'text-green-600' : 'text-gray-400'}`} size={32} />
              <div className="font-semibold text-gray-800">Household</div>
              <div className="text-xs text-gray-600 mt-1">Donate items</div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'NGO' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.role === 'NGO'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Heart className={`mx-auto mb-2 ${formData.role === 'NGO' ? 'text-green-600' : 'text-gray-400'}`} size={32} />
              <div className="font-semibold text-gray-800">NGO</div>
              <div className="text-xs text-gray-600 mt-1">Collect donations</div>
            </button>
          </div>
        </div>

        {/* Google Sign-In */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signup_with"
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>

        {/* NGO Verification Info */}
        {formData.role === 'NGO' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">ℹ️ NGO Verification:</span> After registration, an admin will review your NGO details. You will receive an email once approved. Login will be enabled after verification.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder={formData.role === 'NGO' ? 'NGO Name' : 'Your Name'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-eco-main font-semibold hover:text-eco-dark">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;