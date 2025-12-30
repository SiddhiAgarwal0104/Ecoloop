import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Package, CheckCircle, Clock, TrendingUp, MapPin } from 'lucide-react';

const NGODashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    available: 0,
    accepted: 0,
    pickedUp: 0,
    completed: 0,
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch available donations count
      const availableRes = await axios.get('/ngo/donations/available?radius=50');
      
      // Fetch accepted donations
      const acceptedRes = await axios.get('/ngo/donations/accepted');
      const acceptedDonations = acceptedRes.data.data || [];

      setStats({
        available: availableRes.data.count || 0,
        accepted: acceptedDonations.filter(d => d.status === 'ACCEPTED').length,
        pickedUp: acceptedDonations.filter(d => d.status === 'PICKED_UP').length,
        completed: acceptedDonations.filter(d => d.status === 'COMPLETED').length,
      });

      // Get 3 most recent accepted donations
      setRecentDonations(acceptedDonations.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's your donation management overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/ngo/donations/available')}
        >
          <div className="flex items-center justify-between mb-4">
            <Package size={32} />
            <span className="text-4xl font-bold">{stats.available}</span>
          </div>
          <h3 className="text-lg font-semibold">Available</h3>
          <p className="text-blue-100 text-sm">Ready to accept</p>
        </div>

        <div 
          className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/ngo/donations/accepted')}
        >
          <div className="flex items-center justify-between mb-4">
            <Clock size={32} />
            <span className="text-4xl font-bold">{stats.accepted}</span>
          </div>
          <h3 className="text-lg font-semibold">Pending Pickup</h3>
          <p className="text-orange-100 text-sm">Need to collect</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} />
            <span className="text-4xl font-bold">{stats.pickedUp}</span>
          </div>
          <h3 className="text-lg font-semibold">Picked Up</h3>
          <p className="text-purple-100 text-sm">In processing</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={32} />
            <span className="text-4xl font-bold">{stats.completed}</span>
          </div>
          <h3 className="text-lg font-semibold">Completed</h3>
          <p className="text-green-100 text-sm">Total processed</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/ngo/donations/available')}
            className="btn-primary flex items-center justify-center gap-2 py-4"
          >
            <Package size={20} />
            Browse Available Donations
          </button>
          <button
            onClick={() => navigate('/ngo/donations/accepted')}
            className="btn-secondary flex items-center justify-center gap-2 py-4"
          >
            <Clock size={20} />
            Manage Accepted Donations
          </button>
        </div>
      </div>

      {/* Recent Accepted Donations */}
      {recentDonations.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Accepted Donations</h2>
            <button
              onClick={() => navigate('/ngo/donations/accepted')}
              className="text-green-600 hover:text-green-700 font-semibold text-sm"
            >
              View All →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentDonations.map((donation) => (
              <div 
                key={donation._id} 
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('/ngo/donations/accepted')}
              >
                {donation.images?.[0] ? (
                  <img
                    src={donation.images[0]}
                    alt={donation.itemCategory}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="text-gray-400" size={24} />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800">{donation.itemCategory}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="truncate">{donation.pickupLocation.address}</span>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  donation.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                  donation.status === 'PICKED_UP' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {donation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Completion Warning */}
      {(!user?.location || !user?.location?.latitude) && (
        <div className="card bg-yellow-50 border-2 border-yellow-200 mt-8">
          <div className="flex items-start gap-4">
            <MapPin className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Complete Your Profile</h3>
              <p className="text-yellow-800 mb-4">
                Please set your NGO location to start browsing nearby donations
              </p>
              <button
                onClick={() => navigate('/profile/complete')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Set Location Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;