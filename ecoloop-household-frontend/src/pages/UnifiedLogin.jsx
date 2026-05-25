import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Login Page Component
 * Modes: 'login' | 'forgot' | 'reset'
 */
const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'

  // Login state
  const [formData, setFormData] = useState({ email: '', password: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleSignIn, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const clearMessages = () => { setError(''); setInfo(''); };

  // ── Login Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const response = await login(formData);
      const user = response?.data?.user || response?.user;

      if (response?.needsProfileCompletion || response?.data?.needsProfileCompletion) {
        navigate('/profile/complete');
        return;
      }

      if (user?.role === 'NGO') navigate('/ngo/dashboard');
      else if (user?.role === 'RECYCLER') navigate('/recycler/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    clearMessages();
    setLoading(true);
    try {
      const response = await googleSignIn({ credential: credentialResponse.credential });
      const user = response?.data?.user;

      if (response.needsProfileCompletion || response?.data?.needsProfileCompletion) {
        navigate('/profile/complete');
        return;
      }
      if (response?.data?.isNGOPendingVerification) {
        setError('Your NGO is pending admin verification. You will receive an email once approved.');
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

  // ── Forgot Password: Send OTP ────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!forgotEmail) return setError('Please enter your email address');

    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setInfo(`OTP sent to ${forgotEmail}. Check your inbox.`);
      setMode('reset');
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password: Verify OTP + Set New Password ────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!resetOtp || resetOtp.length !== 6) return setError('Enter the 6-digit OTP');
    if (!newPassword || newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      await resetPassword({ email: forgotEmail, otp: resetOtp, newPassword, confirmPassword });
      setInfo('✅ Password reset successfully! You can now login.');
      // Return to login after 2s
      setTimeout(() => {
        setMode('login');
        setFormData(prev => ({ ...prev, email: forgotEmail }));
        clearMessages();
        setForgotEmail('');
        setResetOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
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
    clearMessages();
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setInfo('New OTP sent to your email.');
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
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
          {mode === 'login' && (
            <>
              <h1 className="text-3xl font-bold text-eco-dark mb-2">Welcome Back!</h1>
              <p className="text-gray-600">Login to your EcoLoop account</p>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <h1 className="text-3xl font-bold text-eco-dark mb-2">Forgot Password?</h1>
              <p className="text-gray-600">Enter your email to receive a reset OTP</p>
            </>
          )}
          {mode === 'reset' && (
            <>
              <h1 className="text-3xl font-bold text-eco-dark mb-2">Reset Password</h1>
              <p className="text-gray-600">Enter OTP and set a new password</p>
            </>
          )}
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

        {/* ── LOGIN MODE ── */}
        {mode === 'login' && (
          <>
            <div className="mb-6">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in failed')} theme="outline" size="large" />
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500">Or continue with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); clearMessages(); }}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(formData.email); setMode('forgot'); clearMessages(); }}
                    className="text-sm text-eco-main hover:text-eco-dark font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={e => { setFormData(p => ({ ...p, password: e.target.value })); clearMessages(); }}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-eco-main hover:text-eco-dark font-bold">Register here</Link>
            </p>
          </>
        )}

        {/* ── FORGOT PASSWORD: Enter Email ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => { setForgotEmail(e.target.value); clearMessages(); }}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>

            <button type="button" onClick={() => { setMode('login'); clearMessages(); }} className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}

        {/* ── RESET PASSWORD: OTP + New Password ── */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 text-center">
              OTP sent to <span className="font-semibold">{forgotEmail}</span>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={resetOtp}
                onChange={e => { setResetOtp(e.target.value.replace(/\D/g, '')); clearMessages(); }}
                placeholder="• • • • • •"
                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-eco-main focus:border-eco-main outline-none transition"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); clearMessages(); }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); clearMessages(); }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
              </div>
              {newPassword && confirmPassword && (
                <p className={`text-xs mt-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading || resetOtp.length !== 6} className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-2 text-sm text-eco-main hover:text-eco-dark disabled:text-gray-400 font-medium transition-colors"
              >
                <RefreshCw size={16} />
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </button>
              <button type="button" onClick={() => { setMode('login'); clearMessages(); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={16} /> Back to Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;