import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Shield, 
  Zap,
  ChevronRight,
  Heart,
  Recycle,
  TrendingUp,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Leaf className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">EcoLoop</span>
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              User Login
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Admin Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Sustainable Living,
                  <span className="text-green-600"> Made Simple</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join EcoLoop to donate items, reduce waste, earn rewards, and build a sustainable community together. Every action counts.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus className="mr-2 w-5 h-5" />
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 rounded-xl font-semibold border-2 border-green-200 hover:border-green-600 hover:shadow-lg transition-all duration-300"
                >
                  <LogIn className="mr-2 w-5 h-5" />
                  Sign In
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {[
                  { icon: Users, label: '50K+ Users' },
                  { icon: Heart, label: 'Community First' },
                  { icon: Recycle, label: 'Eco-Friendly' },
                  { icon: TrendingUp, label: 'Growing Impact' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <feature.icon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-3xl opacity-20"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-600">
                      <div className="flex items-center gap-3">
                        <Leaf className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Donate Items</p>
                          <p className="text-xs text-gray-600">Give unwanted items new life</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-600">
                      <div className="flex items-center gap-3">
                        <Recycle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Recycle Smart</p>
                          <p className="text-xs text-gray-600">Track your recycling impact</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-600">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Earn Rewards</p>
                          <p className="text-xs text-gray-600">Get badges and leaderboard points</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Options Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Path</h2>
            <p className="text-xl text-gray-600">Whether you're here to donate, collect, or manage – we have a perfect fit for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* User & NGO Auth Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-green-100">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>
              <div className="p-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Member</h3>
                <p className="text-gray-600 mb-8">
                  Join as a household to donate items, participate in recycling programs, earn badges, and connect with your community.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Donate & recycle items</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Earn rewards & badges</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Climb the leaderboard</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group/btn"
                  >
                    <LogIn className="mr-2 w-5 h-5" />
                    Sign In
                    <ChevronRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-50 text-green-600 rounded-xl font-semibold border border-green-200 hover:bg-green-100 transition-all duration-300"
                  >
                    <UserPlus className="mr-2 w-5 h-5" />
                    Create Account
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center mt-4">
                  Already have an account? <a href="/login" className="text-green-600 font-semibold hover:text-green-700">Sign in here</a>
                </p>
              </div>
            </div>

            {/* Admin Auth Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <div className="p-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h3>
                <p className="text-gray-600 mb-8">
                  Access powerful admin tools to verify NGOs, manage donations, monitor recyclers, and generate detailed reports.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Verify & manage NGOs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">View platform analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Download Excel reports</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group/btn"
                  >
                    <LogIn className="mr-2 w-5 h-5" />
                    Admin Login
                    <ChevronRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/admin/register')}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold border border-blue-200 hover:bg-blue-100 transition-all duration-300"
                  >
                    <UserPlus className="mr-2 w-5 h-5" />
                    Create Admin Account
                  </button>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 text-center">
                      <span className="font-semibold text-gray-900">Demo Credentials:</span>
                      <br />
                      admin@ecoloop.com / admin123
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center mt-4">
                  For authorized administrators only
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EcoLoop?</h2>
            <p className="text-xl text-gray-600">Making sustainability accessible, rewarding, and fun</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: 'Reduce Waste',
                description: 'Give items a second life instead of throwing them away. Every donation helps reduce landfill waste.'
              },
              {
                icon: Heart,
                title: 'Help Communities',
                description: 'Partner with NGOs to ensure your donations reach those who need them most.'
              },
              {
                icon: TrendingUp,
                title: 'Earn Rewards',
                description: 'Get rewarded for your sustainability efforts with badges, points, and leaderboard recognition.'
              },
              {
                icon: Users,
                title: 'Join Community',
                description: 'Connect with thousands of eco-conscious individuals in your area and globally.'
              },
              {
                icon: Recycle,
                title: 'Track Impact',
                description: 'See your personal and community impact on the environment in real-time.'
              },
              {
                icon: Zap,
                title: 'Easy Platform',
                description: 'Simple, intuitive interface makes donating and recycling just a few clicks away.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg mb-8 text-green-50">Join the EcoLoop community today and start your sustainability journey</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-green-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <UserPlus className="mr-2 w-5 h-5" />
                Join as User
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center px-8 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all duration-300"
              >
                <LogIn className="mr-2 w-5 h-5" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-green-500" />
                <span className="font-bold text-white">EcoLoop</span>
              </div>
              <p className="text-sm">Making sustainability accessible for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-500 transition">Donate</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Recycle</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Leaderboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Admin</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-500 transition">Dashboard</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Reports</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-500 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Terms</a></li>
                <li><a href="#" className="hover:text-green-500 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 EcoLoop. All rights reserved. Building a sustainable future, together.</p>
          </div>
        </div>
      </footer>

      {/* Blob animation styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
