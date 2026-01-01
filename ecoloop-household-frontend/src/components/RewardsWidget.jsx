import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { Trophy, TrendingUp, Award, Flame } from 'lucide-react';

const RewardsWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/leaderboard/my-stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!stats) return null;

  const { stats: userStats, rankings, levelProgress } = stats;

  return (
    <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          Your Rewards
        </h2>
        <Link 
          to="/badges" 
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
        >
          View All →
        </Link>
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Level {levelProgress.currentLevel}
          </span>
          <span className="text-sm text-gray-600">
            {levelProgress.pointsToNextLevel} pts to next level
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${levelProgress.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Award className="text-green-600" size={16} />
            <span className="text-xs text-gray-600">Total Points</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {userStats.totalPoints}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="text-blue-600" size={16} />
            <span className="text-xs text-gray-600">Badges</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {userStats.badgesEarned}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-purple-600" size={16} />
            <span className="text-xs text-gray-600">Global Rank</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            #{rankings.global}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="text-orange-600" size={16} />
            <span className="text-xs text-gray-600">Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {userStats.streak.current} 🔥
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/badges"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-center font-semibold text-sm"
        >
          View Badges
        </Link>
        <Link
          to="/leaderboard"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-center font-semibold text-sm"
        >
          Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default RewardsWidget;