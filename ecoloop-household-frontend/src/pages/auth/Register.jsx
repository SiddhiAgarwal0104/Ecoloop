import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, Phone, Eye, EyeOff, Heart, Home, Recycle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Register Page Component
 * Supports all three roles: HOUSEHOLD, NGO, RECYCLER
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'HOUSEHOLD', // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, googleSignIn } = useAuth();
  const navigate = useNavigate();

  /**
   * Calculate password strength
   */
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 [Register] Submitting registration:', { 
        role: formData.role,
        name: formData.name,
        email: formData.email 
      });

      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        phone: formData.phone,
        role: formData.role,
      });
      
      console.log('✅ [Register] Registration successful:', response);
      
      // All users go to profile completion
      navigate('/profile/complete');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      console.error('❌ [Register] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      console.log('🔐 [Google Register] Processing Google sign-in with role:', formData.role);

      const response = await googleSignIn({
        credential: credentialResponse.credential,
        role: formData.role
      });
      
      console.log('✅ [Google Register] Response:', response);

      // Check if NGO pending verification
      if (!response.success && response.data?.isNGOPendingVerification) {
        alert('✅ Your NGO profile has been submitted! An admin will review it soon. You can login once approved.');
        navigate('/login');
        return;
      }
      
      // If profile completion needed
      if (response.needsProfileCompletion || response.data?.needsProfileCompletion) {
        console.log('🔄 [Google Register] Redirecting to profile completion');
        navigate('/profile/complete');
        return;
      }
      
      const user = response?.data?.user;

      // Check if NGO and not verified
      if (user?.role === 'NGO' && !user?.isVerified) {
        alert('✅ Your NGO profile has been submitted! An admin will review it soon. You can login once approved.');
        navigate('/login');
        return;
      }
      
      // Redirect based on role
      if (user?.role === 'NGO') {
        navigate('/ngo/dashboard');
      } else if (user?.role === 'RECYCLER') {
        navigate('/recycler/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Google sign-in failed';
      console.error('❌ [Google Register] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-dark to-eco-main flex items-center justify-center p-4">
      {/* Back Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back Home</span>
      </button>
      
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-eco-main rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">♻️</span>
          </div>
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Join EcoLoop</h1>
          <p className="text-gray-600">Create your account and start making a difference</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            I am a *
          </label>
          <div className="grid grid-cols-3 gap-4">
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
              <div className="text-xs text-gray-600 mt-1">Donate & Recycle</div>
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
              <div className="text-xs text-gray-600 mt-1">Collect Donations</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'RECYCLER' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.role === 'RECYCLER'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Recycle className={`mx-auto mb-2 ${formData.role === 'RECYCLER' ? 'text-green-600' : 'text-gray-400'}`} size={32} />
              <div className="font-semibold text-gray-800">Recycler</div>
              <div className="text-xs text-gray-600 mt-1">Pickup & Process</div>
            </button>
          </div>
        </div>

        {/* NGO Verification Info */}
        {formData.role === 'NGO' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">ℹ️ NGO Verification:</span> After registration, an admin will review your NGO details. You'll receive an email once approved.
            </p>
          </div>
        )}

        {/* Google Sign-In */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed')}
            theme="outline"
            size="large"
            text="signup_with"
          />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.role === 'NGO' ? 'NGO Name' : 'Full Name'} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.role === 'NGO' ? 'NGO Name' : 'Your Name'}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getStrengthText()} password</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && formData.confirmPassword && (
                <p className={`text-xs mt-1 ${
                  formData.password === formData.confirmPassword
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formData.password === formData.confirmPassword
                    ? '✅ Passwords match'
                    : '❌ Passwords do not match'}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-eco-main hover:text-eco-dark font-bold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;