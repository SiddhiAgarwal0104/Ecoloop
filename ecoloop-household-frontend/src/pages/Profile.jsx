// import { useState, useEffect } from 'react';
// import Layout from '../components/Layout';
// import axios from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

// const Profile = () => {
//   const { user, logout } = useAuth();
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     locality: '',
//     address: '',
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || '',
//         email: user.email || '',
//         phone: user.phone || '',
//         locality: user.locality || '',
//         address: user.address || '',
//       });
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       await axios.patch('/auth/me', formData);
//       setSuccess('Profile updated successfully');
//       setIsEditing(false);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to update profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       name: user?.name || '',
//       email: user?.email || '',
//       phone: user?.phone || '',
//       locality: user?.locality || '',
//       address: user?.address || '',
//     });
//     setIsEditing(false);
//     setError('');
//   };

//   return (
//       <div className="fade-in max-w-2xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-eco-dark mb-2">My Profile</h1>
//           <p className="text-gray-600">Manage your account information</p>
//         </div>

//         <div className="card">
//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm">
//               {error}
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-600 text-sm">
//               {success}
//             </div>
//           )}

//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-2xl font-bold text-eco-dark">Personal Information</h2>
//             {!isEditing && (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="btn-secondary flex items-center gap-2"
//               >
//                 <Edit2 size={20} />
//                 <span>Edit Profile</span>
//               </button>
//             )}
//           </div>

//           {isEditing ? (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="input-field pl-10"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="input-field pl-10"
//                     disabled
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className="input-field pl-10"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Locality
//                 </label>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     name="locality"
//                     value={formData.locality}
//                     onChange={handleChange}
//                     className="input-field pl-10"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Address
//                 </label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   className="input-field"
//                 />
//               </div>

//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="btn-secondary flex-1 flex items-center justify-center gap-2"
//                 >
//                   <X size={20} />
//                   <span>Cancel</span>
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="btn-primary flex-1 flex items-center justify-center gap-2"
//                 >
//                   <Save size={20} />
//                   <span>{loading ? 'Saving...' : 'Save Changes'}</span>
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="space-y-6">
//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <p className="text-sm text-gray-600 mb-1">Full Name</p>
//                 <p className="text-lg font-semibold text-gray-800">{user?.name}</p>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <p className="text-sm text-gray-600 mb-1">Email Address</p>
//                 <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <p className="text-sm text-gray-600 mb-1">Phone Number</p>
//                 <p className="text-lg font-semibold text-gray-800">{user?.phone || 'Not provided'}</p>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <p className="text-sm text-gray-600 mb-1">Locality</p>
//                 <p className="text-lg font-semibold text-gray-800">{user?.locality || 'Not provided'}</p>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <p className="text-sm text-gray-600 mb-1">Address</p>
//                 <p className="text-lg font-semibold text-gray-800">{user?.address || 'Not provided'}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//   );
// };

// export default Profile;
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth(); // ✅ refreshUser added
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    locality: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        locality: user.locality || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.patch('/auth/me', formData);
      await refreshUser(); // ✅ IMPORTANT AFTER MERGE
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      locality: user?.locality || '',
      address: user?.address || '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-600 text-sm">
            {success}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-eco-dark">
            Personal Information
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit2 size={20} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="input-field pl-10"
                  disabled
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* LOCALITY */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Locality
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* ADDRESS */}
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
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {[
              ['Full Name', user?.name],
              ['Email Address', user?.email],
              ['Phone Number', user?.phone || 'Not provided'],
              ['Locality', user?.locality || 'Not provided'],
              ['Address', user?.address || 'Not provided'],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">{label}</p>
                <p className="text-lg font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
