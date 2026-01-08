import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Trophy, Medal, Crown, TrendingUp, MapPin, Award } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('global'); // 'global' or 'locality'
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('totalPoints');

  useEffect(() => {
    fetchLeaderboard();
  }, [view, sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const endpoint = view === 'global' 
        ? `/leaderboard/global?sortBy=${sortBy}` 
        : '/leaderboard/locality';
      
      const response = await axios.get(endpoint);
      console.log('📊 Leaderboard Response:', {
        endpoint,
        leaderboard: response.data.data.leaderboard,
        currentUser: response.data.data.currentUser,
        locality: response.data.data.locality,
        totalUsers: response.data.data.totalUsersInLocality
      });
      setLeaderboard(response.data.data.leaderboard);
      setCurrentUser(response.data.data.currentUser);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
    return 'bg-white';
  };

  if (loading) {
    return (
     
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
     
    );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600">See how you rank among eco-warriors</p>
        </div>

        {/* View Toggle */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setView('global')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  view === 'global'
                    ? 'bg-eco-main text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌍 Global
              </button>
              <button
                onClick={() => setView('locality')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  view === 'locality'
                    ? 'bg-eco-main text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📍 My Locality
              </button>
            </div>

            {view === 'global' && (
              <div className="ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold"
                >
                  <option value="totalPoints">Total Points</option>
                  <option value="impactScore">Impact Score</option>
                  <option value="level">Level</option>
                  <option value="badgesEarned">Badges</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Current User Position */}
        {currentUser && (
          <div className="card mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Position</p>
                <p className="text-3xl font-bold text-eco-dark">
                  Rank #{currentUser.rank}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentUser.stats?.totalPoints || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium - Only show if 4 or more users (so we can hide top 3 in Full Rankings) */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="pt-8">
              <div className="card text-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Medal className="mx-auto text-gray-400 mb-2" size={32} />
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h3 className="font-bold text-lg mb-1">{leaderboard[1].name}</h3>
                <p className="text-sm text-gray-600 mb-2">{leaderboard[1].locality}</p>
                <p className="text-2xl font-bold text-gray-700">{leaderboard[1].totalPoints}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>

            {/* 1st Place */}
            <div>
              <div className="card text-center bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400">
                <Crown className="mx-auto text-yellow-600 mb-2" size={40} />
                <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-white">
                  1
                </div>
                <h3 className="font-bold text-xl mb-1">{leaderboard[0].name}</h3>
                <p className="text-sm text-gray-700 mb-2">{leaderboard[0].locality}</p>
                <p className="text-3xl font-bold text-yellow-700">{leaderboard[0].totalPoints}</p>
                <p className="text-xs text-gray-600">points</p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="pt-8">
              <div className="card text-center bg-gradient-to-br from-amber-100 to-amber-200">
                <Medal className="mx-auto text-amber-600 mb-2" size={32} />
                <div className="w-20 h-20 bg-amber-400 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="font-bold text-lg mb-1">{leaderboard[2].name}</h3>
                <p className="text-sm text-gray-600 mb-2">{leaderboard[2].locality}</p>
                <p className="text-2xl font-bold text-amber-700">{leaderboard[2].totalPoints}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="card">
          <h2 className="text-xl font-bold text-eco-dark mb-4">Full Rankings</h2>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No rankings available yet.</p>
              <p className="text-gray-400 text-sm mt-1">Start creating donations and recycling to appear on the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.length > 3 ? (
                // Show users from rank 4+ (hide top 3 in podium)
                leaderboard.slice(3).map((user) => (
                <div
                  key={user.userId}
                  className={`p-4 rounded-xl transition-all ${
                    user.isCurrentUser
                      ? 'bg-green-50 border-2 border-green-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      user.rank === 1 ? 'bg-yellow-500' :
                      user.rank === 2 ? 'bg-gray-400' :
                      user.rank === 3 ? 'bg-amber-600' :
                      'bg-gray-400'
                    }`}>
                      #{user.rank}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {user.name}
                        {user.rank === 1 && <span className="text-xl">👑</span>}
                        {user.rank === 2 && <span className="text-xl">🥈</span>}
                        {user.rank === 3 && <span className="text-xl">🥉</span>}
                        {user.isCurrentUser && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {user.locality}
                        </span>
                        <span>Level {user.level}</span>
                        <span>🏆 {user.badgesEarned} badges</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {user.totalPoints}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                // Show all users if 3 or fewer
                leaderboard.map((user) => (
                <div
                  key={user.userId}
                  className={`p-4 rounded-xl transition-all ${
                    user.isCurrentUser
                      ? 'bg-green-50 border-2 border-green-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      user.rank === 1 ? 'bg-yellow-500' :
                      user.rank === 2 ? 'bg-gray-400' :
                      user.rank === 3 ? 'bg-amber-600' :
                      'bg-gray-400'
                    }`}>
                      #{user.rank}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {user.name}
                        {user.rank === 1 && <span className="text-xl">👑</span>}
                        {user.rank === 2 && <span className="text-xl">🥈</span>}
                        {user.rank === 3 && <span className="text-xl">🥉</span>}
                        {user.isCurrentUser && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {user.locality}
                        </span>
                        <span>Level {user.level}</span>
                        <span>🏆 {user.badgesEarned} badges</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {user.totalPoints}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          )}
        </div>
      </div>
  );
};

export default Leaderboard;