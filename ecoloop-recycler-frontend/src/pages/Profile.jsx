// import React, { useState, useEffect } from 'react';
// import { Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
// import axios from '../api/axios';
// import { useAuth } from '../hooks';

// /**
//  * Profile Page Component
//  * View and edit recycler profile
//  */
// const Profile = () => {
//   const { user, updateUser, refreshUser, loading } = useAuth();
//   const [isEditing, setIsEditing] = useState(false);
//   const [stats, setStats] = useState({
//     totalRequests: 0,
//     completedRequests: 0,
//     completionRate: 0
//   });
//   const [formData, setFormData] = useState({
//     name: user?.name || '',
//     email: user?.email || '',
//     phone: user?.phone || '',
//     address: user?.address || '',
//     bio: user?.bio || ''
//   });

//   // Update formData when user data changes
//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || '',
//         email: user.email || '',
//         phone: user.phone || '',
//         address: user.address || '',
//         bio: user.bio || ''
//       });
//     }
//   }, [user]);

//   // Fetch stats and refresh user data on mount
//   useEffect(() => {
//     if (user) {
//       fetchStats();
      
//       // Refresh user data from backend in the background (non-blocking)
//       // Don't await this - just let it happen without blocking the UI
//       refreshUser()
//         .catch(err => {
//           // Silently fail - user data from localStorage is sufficient
//           console.warn('Could not refresh user data:', err.message);
//         });
//     }
//   }, [user]);

//   const fetchStats = async () => {
//     try {
//       const token = localStorage.getItem('recycler_token');
//       const response = await axios.get('/integration/recycle/stats/all', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log('✅ Stats fetched:', response.data?.data);
//       setStats(response.data?.data || {
//         totalRequests: 0,
//         completedRequests: 0,
//         completionRate: 0
//       });
//     } catch (err) {
//       console.error('❌ Error fetching stats:', err);
//     }
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
//   };

//   /**
//    * Handle save
//    */
//   const handleSave = async () => {
//     try {
//       await updateUser(formData);
//       setIsEditing(false);
//     } catch (err) {
//       console.error('❌ Failed to update profile:', err);
//       alert(err.message || 'Failed to update profile');
//     }
//   };

//   /**
//    * Handle cancel
//    */
//   const handleCancel = () => {
//     setFormData({
//       name: user?.name || '',
//       email: user?.email || '',
//       phone: user?.phone || '',
//       address: user?.address || '',
//       bio: user?.bio || ''
//     });
//     setIsEditing(false);
//   };

//   if (!user) {
//     return <div className="text-center py-8">Loading profile...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
//         {!isEditing && (
//           <button
//             onClick={() => setIsEditing(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors"
//           >
//             <Edit2 size={18} />
//             Edit Profile
//           </button>
//         )}
//       </div>

//       {/* Profile Card */}
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {/* Profile Image Section */}
//         <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
//           <img
//             src={user.profileImage || 'https://via.placeholder.com/100'}
//             alt="Profile"
//             className="w-24 h-24 rounded-full object-cover"
//           />
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">
//               {user.name || 'Complete your profile'}
//             </h2>
//             <p className="text-gray-600">{user.email}</p>
//           </div>
//         </div>

//         {/* Form Content */}
//         <div className="space-y-6">
//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
//               />
//             ) : (
//               <p className="text-gray-900 text-lg">{user.name || 'Not provided'}</p>
//             )}
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//               <Mail size={18} />
//               Email Address
//             </label>
//             <p className="text-gray-900 text-lg">{user.email}</p>
//             <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
//           </div>

//           {/* Phone */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//               <Phone size={18} />
//               Phone Number
//             </label>
//             {isEditing ? (
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
//               />
//             ) : (
//               <p className="text-gray-900 text-lg">{user.phone || 'Not provided'}</p>
//             )}
//           </div>

//           {/* Address */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//               <MapPin size={18} />
//               Address
//             </label>
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
//               />
//             ) : (
//               <p className="text-gray-900 text-lg">{user.address || 'Not provided'}</p>
//             )}
//           </div>

//           {/* Bio */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
//             {isEditing ? (
//               <textarea
//                 name="bio"
//                 value={formData.bio}
//                 onChange={handleChange}
//                 rows="4"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
//               />
//             ) : (
//               <p className="text-gray-900 text-lg">{user.bio || 'No bio provided'}</p>
//             )}
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
//             <div className="text-center">
//               <p className="text-2xl font-bold text-eco-main">{stats.totalRequests}</p>
//               <p className="text-sm text-gray-600">Total Requests</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-green-600">{stats.completedRequests}</p>
//               <p className="text-sm text-gray-600">Completed</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-yellow-600">{stats.completionRate}%</p>
//               <p className="text-sm text-gray-600">Completion Rate</p>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         {isEditing && (
//           <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
//             <button
//               onClick={handleSave}
//               disabled={loading}
//               className="flex-1 bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
//             >
//               <Save size={18} />
//               {loading ? 'Saving...' : 'Save Changes'}
//             </button>
//             <button
//               onClick={handleCancel}
//               className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
//             >
//               <X size={18} />
//               Cancel
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;


import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../hooks';

/**
 * Profile Page Component
 * View and edit recycler profile
 */
const Profile = () => {
  const { user, updateUser, refreshUser, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: ''
  });

  /**
   * Sync form data whenever user updates
   */
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  /**
   * Force refresh user once on mount
   */
  useEffect(() => {
    refreshUser().catch(() => {});
  }, []);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Save profile changes
   */
  const handleSave = async () => {
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('phone', formData.phone);
      fd.append('address', formData.address);
      fd.append('bio', formData.bio);

      await updateUser(fd);
      await refreshUser();

      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b">
          <img
            src={user.profilePicture || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold">
              {user.name || 'Complete your profile'}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
              />
            ) : (
              <p>{user.name || 'Not provided'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} />
              Email
            </label>
            <p>{user.email}</p>
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
            ) : (
              <p>{user.phone || 'Not provided'}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} />
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
              />
            ) : (
              <p>{user.address || 'Not provided'}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="input"
              />
            ) : (
              <p>{user.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-eco-main text-white py-2 rounded-lg hover:bg-eco-dark transition flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 border py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
