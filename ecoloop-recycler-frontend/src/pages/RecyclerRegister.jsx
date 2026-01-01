import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useRecyclerAuth } from '../context/RecyclerAuthContext';
import { UserPlus } from 'lucide-react';

const RecyclerRegister = () => {
  const navigate = useNavigate();
  const { login } = useRecyclerAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    locality: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        locality: formData.locality,
      });

      const { user, token } = response.data.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-main to-eco-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-eco-dark mb-2">EcoLoop</h1>
            <p className="text-gray-600">Recycler Registration</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="Your address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Locality
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                className="input-field"
                placeholder="Your locality/city"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-eco-main font-semibold hover:text-eco-dark">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclerRegister;
