// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import { useAuth } from '../../hooks';
// import { VALIDATION_RULES } from '../../config/constants';

// /**
//  * Register Page Component
//  * New recycler signup with email and password only
//  */
// const Register = () => {
//   const navigate = useNavigate();
//   const { register } = useAuth();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [passwordStrength, setPasswordStrength] = useState(0);

//   /**
//    * Calculate password strength
//    */
//   const calculatePasswordStrength = (pwd) => {
//     let strength = 0;
//     if (pwd.length >= 6) strength++;
//     if (pwd.length >= 8) strength++;
//     if (/[A-Z]/.test(pwd)) strength++;
//     if (/[0-9]/.test(pwd)) strength++;
//     if (/[^A-Za-z0-9]/.test(pwd)) strength++;
//     return strength;
//   };

//   /**
//    * Handle input change
//    */
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     if (name === 'password') {
//       setPasswordStrength(calculatePasswordStrength(value));
//     }
    
//     // Clear error when user starts typing
//     setError('');
    
//     // If updating password fields, check if they match now
//     if ((name === 'password' || name === 'confirmPassword') && 
//         formData.password.trim() === formData.confirmPassword.trim() && 
//         formData.password.length > 0) {
//       // Passwords match, clear any mismatch error
//       if (error === 'Passwords do not match' || error === 'Please confirm your password') {
//         setError('');
//       }
//     }
//   };

//   /**
//    * Validate form inputs
//    */
//   const validateForm = () => {
//     if (!formData.email.trim()) {
//       setError('Email is required');
//       return false;
//     }
//     if (!VALIDATION_RULES.email.pattern.test(formData.email)) {
//       setError('Please enter a valid email address');
//       return false;
//     }
//     if (!formData.password) {
//       setError('Password is required');
//       return false;
//     }
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return false;
//     }
//     if (!formData.confirmPassword) {
//       setError('Please confirm your password');
//       return false;
//     }
//     if (formData.password.trim() !== formData.confirmPassword.trim()) {
//       setError('Passwords do not match');
//       return false;
//     }
//     return true;
//   };

//   /**
//    * Handle form submission
//    */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       await register({
//         email: formData.email,
//         password: formData.password
//       });
//       navigate('/complete-profile');
//     } catch (err) {
//       setError(err.message || 'Registration failed. Please try again.');
//       console.error('❌ Registration error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Get password strength color
//    */
//   const getStrengthColor = () => {
//     if (passwordStrength <= 2) return 'bg-red-500';
//     if (passwordStrength <= 3) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-eco-dark to-eco-main flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="w-12 h-12 bg-eco-main rounded-lg flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">♻️</span>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">EcoLoop</h1>
//           <p className="text-gray-600">Join as Recycler</p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-600 text-sm font-medium">❌ {error}</p>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Email Input */}
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
//               <input
//                 id="email"
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="your@email.com"
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
//               />
//             </div>
//           </div>

//           {/* Password Input */}
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
//               <input
//                 id="password"
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//             {/* Password Strength Indicator */}
//             {formData.password && (
//               <div className="mt-2">
//                 <div className="flex gap-1">
//                   {[...Array(5)].map((_, i) => (
//                     <div
//                       key={i}
//                       className={`h-1 flex-1 rounded-full ${
//                         i < passwordStrength ? getStrengthColor() : 'bg-gray-200'
//                       }`}
//                     />
//                   ))}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Good' : 'Strong'} password
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Confirm Password Input */}
//           <div>
//             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//               Confirm Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
//               <input
//                 id="confirmPassword"
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//               >
//                 {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//             {/* Password Match Indicator */}
//             {formData.password && formData.confirmPassword && (
//               <div className="mt-2">
//                 {formData.password.trim() === formData.confirmPassword.trim() ? (
//                   <p className="text-xs text-green-600">✅ Passwords match</p>
//                 ) : (
//                   <p className="text-xs text-red-600">❌ Passwords do not match</p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-6"
//           >
//             {loading ? 'Creating Account...' : 'Sign Up'}
//           </button>
//         </form>

//         {/* Footer Link */}
//         <p className="text-center text-gray-600 mt-6">
//           Already have an account?{' '}
//           <Link to="/login" className="text-eco-main hover:text-eco-dark font-bold">
//             Login here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks';
import { VALIDATION_RULES } from '../../config/constants';

/**
 * Register Page Component
 * New recycler signup with email and password only
 */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error while typing
    setError('');
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!VALIDATION_RULES.email.pattern.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return false;
    }

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 🔥 IMPORTANT FIX: send passwordConfirm to backend
      await register({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword
      });

      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('❌ Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get password strength color
   */
  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-dark to-eco-main flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-eco-main rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">♻️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EcoLoop</h1>
          <p className="text-gray-600">Join as Recycler</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">❌ {error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-eco-main outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-eco-main outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
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
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-eco-main outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-main hover:bg-eco-dark text-white font-bold py-2 rounded-lg"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-eco-main font-bold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


