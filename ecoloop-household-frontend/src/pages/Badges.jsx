import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from '../api/axios';
import { Award, Lock, TrendingUp, CheckCircle } from 'lucide-react';

const Badges = () => {
  const [badges, setBadges] = useState({
    earned: [],
    inProgress: [],
    locked: []
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📬 Fetching user badges...');
      const response = await axios.get('/badges/my');
      console.log('✅ Badges response:', response.data);
      setBadges(response.data.data);
      setStats(response.data.data.stats);
      console.log('✅ Badges loaded successfully');
    } catch (error) {
      console.error('❌ Failed to fetch badges:', error);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      setError(error.message);
      alert(`Failed to load badges: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'BRONZE': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SILVER': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PLATINUM': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DIAMOND': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressPercentage = (badge) => {
    if (!badge.progress) return 0;
    return Math.min(100, Math.round((badge.progress.current / badge.progress.target) * 100));
  };

  const filterBadges = (badgeList) => {
    if (filter === 'ALL') return badgeList;
    return badgeList.filter(b => b.category === filter);
  };

  if (loading) {
    return (
     
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
     
    );
  }

  if (error) {
    return (
      <div className="fade-in max-w-7xl mx-auto">
        <div className="card bg-red-50 border-2 border-red-200 p-6 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Badges</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchBadges}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalBadges = badges.earned.length + badges.inProgress.length + badges.locked.length;

  return (
    
      <div className="fade-in max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">🏆 Badges & Achievements</h1>
          <p className="text-gray-600">Earn badges by completing eco-friendly activities</p>
        </div>

        {/* Empty State */}
        {totalBadges === 0 ? (
          <div className="card text-center py-12">
            <Award size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Badges Yet</h2>
            <p className="text-gray-600">Start earning badges by creating recycle requests and donations!</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm mb-1">Badges Earned</p>
                      <p className="text-4xl font-bold">{stats.totalEarned}</p>
                    </div>
                    <Award size={48} className="text-green-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">In Progress</p>
                      <p className="text-4xl font-bold">{badges.inProgress.length}</p>
                    </div>
                    <TrendingUp size={48} className="text-blue-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm mb-1">Completion Rate</p>
                      <p className="text-4xl font-bold">{stats.completionRate}%</p>
                    </div>
                    <CheckCircle size={48} className="text-purple-200" />
                  </div>
                </div>
              </div>
            )}

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'DONATION', 'RECYCLE', 'STREAK', 'MILESTONE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === cat
                    ? 'bg-eco-main text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Earned Badges */}
        {filterBadges(badges.earned).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-eco-dark mb-4">✨ Earned Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBadges(badges.earned).map((badge) => (
                <div key={badge._id} className="card hover:shadow-xl transition-shadow border-2 border-green-200 bg-green-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{badge.icon}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getTierColor(badge.tier)}`}>
                      {badge.tier}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-600">
                      +{badge.points} points
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Badges */}
        {filterBadges(badges.inProgress).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-eco-dark mb-4">⏳ In Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBadges(badges.inProgress).map((badge) => (
                <div key={badge._id} className="card hover:shadow-xl transition-shadow border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl opacity-60">{badge.icon}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getTierColor(badge.tier)}`}>
                      {badge.tier}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{badge.progress?.current || 0} / {badge.progress?.target || 0}</span>
                      <span>{getProgressPercentage(badge)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(badge)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm font-semibold text-blue-600">
                    +{badge.points} points
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {filterBadges(badges.locked).length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-eco-dark mb-4">🔒 Locked Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBadges(badges.locked).map((badge) => (
                <div key={badge._id} className="card hover:shadow-xl transition-shadow opacity-60 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl grayscale">{badge.icon}</div>
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                  <div className="text-sm font-semibold text-gray-500">
                    +{badge.points} points
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </div>
   
  );
};

export default Badges;