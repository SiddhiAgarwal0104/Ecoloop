import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, Phone, Eye, EyeOff, Heart, Home, Recycle, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Register Page Component
 * Flow: Fill form → Send OTP → Verify OTP → Create account
 */
const Register = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'done'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'HOUSEHOLD',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, googleSignIn, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') setPasswordStrength(calculatePasswordStrength(value));
    setError('');
  };

  // ── Step 1: Validate form and send OTP ──────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await sendOTP(formData.email, 'verify');
      setOtpSent(true);
      setStep('otp');
      setInfo(`OTP sent to ${formData.email}. Check your inbox.`);
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP and register ─────────────────────────────────────────
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) return setError('Enter the 6-digit OTP');

    setLoading(true);
    try {
      // Verify OTP first
      await verifyOTP(formData.email, otp);

      // Then register with otpVerified flag
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        phone: formData.phone,
        role: formData.role,
        otpVerified: true,
      });

      const user = response?.data?.user || response?.user;

      if (response?.needsProfileCompletion || response?.data?.needsProfileCompletion) {
        navigate('/profile/complete');
        return;
      }

      if (user?.role === 'NGO') navigate('/ngo/dashboard');
      else if (user?.role === 'RECYCLER') navigate('/recycler/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendOTP(formData.email, 'verify');
      setInfo('New OTP sent to your email.');
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const response = await googleSignIn({
        credential: credentialResponse.credential,
        role: formData.role,
      });

      if (!response.success && response.data?.isNGOPendingVerification) {
        alert('✅ Your NGO profile has been submitted! An admin will review it soon.');
        navigate('/login');
        return;
      }

      if (response.needsProfileCompletion || response?.data?.needsProfileCompletion) {
        navigate('/profile/complete');
        return;
      }

      const user = response?.data?.user;
      if (user?.role === 'NGO' && !user?.isVerified) {
        alert('✅ Your NGO profile has been submitted! An admin will review it soon.');
        navigate('/login');
        return;
      }

      if (user?.role === 'NGO') navigate('/ngo/dashboard');
      else if (user?.role === 'RECYCLER') navigate('/recycler/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed');
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
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-eco-main rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">♻️</span>
          </div>
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Join EcoLoop</h1>
          <p className="text-gray-600">Create your account and start making a difference</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {['Details', 'Verify Email', 'Done'].map((label, i) => {
            const stepNum = i + 1;
            const currentStepNum = step === 'form' ? 1 : step === 'otp' ? 2 : 3;
            const isActive = stepNum === currentStepNum;
            const isDone = stepNum < currentStepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isDone ? 'bg-green-500 text-white' : isActive ? 'bg-eco-main text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isDone ? '✓' : stepNum}
                </div>
                <span className={`text-sm hidden sm:block ${isActive ? 'font-semibold text-eco-dark' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < 2 && <div className="w-8 h-0.5 bg-gray-200 hidden sm:block" />}
              </div>
            );
          })}
        </div>

        {/* Error / Info */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
        {info && !error && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700 text-sm font-medium">{info}</p>
          </div>
        )}

        {/* ── STEP 1: Registration Form ── */}
        {step === 'form' && (
          <>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">I am a *</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { role: 'HOUSEHOLD', icon: Home, label: 'Household', sub: 'Donate & Recycle' },
                  { role: 'NGO', icon: Heart, label: 'NGO', sub: 'Collect Donations' },
                  { role: 'RECYCLER', icon: Recycle, label: 'Recycler', sub: 'Pickup & Process' },
                ].map(({ role, icon: Icon, label, sub }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.role === role ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Icon className={`mx-auto mb-2 ${formData.role === role ? 'text-green-600' : 'text-gray-400'}`} size={32} />
                    <div className="font-semibold text-gray-800">{label}</div>
                    <div className="text-xs text-gray-600 mt-1">{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {formData.role === 'NGO' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800"><span className="font-semibold">ℹ️ NGO Verification:</span> After registration, an admin will review your NGO details. You'll receive an email once approved.</p>
              </div>
            )}
            {formData.role === 'RECYCLER' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800"><span className="font-semibold">ℹ️ Recycler Verification:</span> After registration, you'll complete your profile and an admin from your city will review your details.</p>
              </div>
            )}

            {/* Google Sign-In */}
            <div className="mb-6">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in failed')} theme="outline" size="large" text="signup_with" />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Or register with email</span></div>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{formData.role === 'NGO' ? 'NGO Name' : 'Full Name'} *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={formData.role === 'NGO' ? 'NGO Name' : 'Your Name'} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition" />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition" />
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 1234567890" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition" />
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">{[...Array(5)].map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength ? getStrengthColor() : 'bg-gray-200'}`} />)}</div>
                      <p className="text-xs text-gray-500 mt-1">{getStrengthText()} password</p>
                    </div>
                  )}
                </div>
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  {formData.password && formData.confirmPassword && (
                    <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.password === formData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                {loading ? 'Sending OTP...' : 'Continue → Verify Email'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 'otp' && (
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm">
                We sent a 6-digit OTP to <span className="font-semibold text-gray-700">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Enter OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="• • • • • •"
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-eco-main focus:border-eco-main outline-none transition"
                />
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-2 mx-auto text-sm text-eco-main hover:text-eco-dark disabled:text-gray-400 font-medium transition-colors"
                >
                  <RefreshCw size={16} />
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
                <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(''); setInfo(''); }} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Back to registration
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-eco-main hover:text-eco-dark font-bold">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;