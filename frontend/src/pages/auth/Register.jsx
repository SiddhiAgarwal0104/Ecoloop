// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { Leaf, User, Mail, Lock, MapPin, Phone, AlertCircle } from 'lucide-react';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     city: '',
//     locality: '',
//     pincode: '',
//     address: '',
//     latitude: '',
//     longitude: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await register(formData);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get current location
//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setFormData({
//             ...formData,
//             latitude: position.coords.latitude.toString(),
//             longitude: position.coords.longitude.toString(),
//           });
//         },
//         (error) => {
//           setError('Unable to get your location');
//         }
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-eco-light to-primary-100 flex items-center justify-center p-4">
//       <div className="card max-w-2xl w-full">
//         <div className="text-center mb-8">
//           <div className="inline-block bg-eco-main p-3 rounded-2xl mb-4">
//             <Leaf className="text-white" size={40} />
//           </div>
//           <h1 className="text-3xl font-bold text-eco-dark mb-2">Join EcoLoop</h1>
//           <p className="text-gray-600">Create your household account</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
//             <AlertCircle className="text-red-600" size={20} />
//             <p className="text-red-600 text-sm">{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Full Name *
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="input-field pl-10"
//                   placeholder="John Doe"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Email Address *
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="input-field pl-10"
//                   placeholder="your@email.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Phone Number
//               </label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="input-field pl-10"
//                   placeholder="+91 1234567890"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Password *
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="input-field pl-10"
//                   placeholder="••••••••"
//                   required
//                   minLength={6}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Locality *
//               </label>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   name="locality"
//                   value={formData.locality}
//                   onChange={handleChange}
//                   className="input-field pl-10"
//                   placeholder="Downtown"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Address *
//               </label>
//               <input
//                 type="text"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 className="input-field"
//                 placeholder="123 Main Street"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Latitude *
//               </label>
//               <input
//                 type="number"
//                 step="any"
//                 name="latitude"
//                 value={formData.latitude}
//                 onChange={handleChange}
//                 className="input-field"
//                 placeholder="28.6139"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Longitude *
//               </label>
//               <input
//                 type="number"
//                 step="any"
//                 name="longitude"
//                 value={formData.longitude}
//                 onChange={handleChange}
//                 className="input-field"
//                 placeholder="77.2090"
//                 required
//               />
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={getCurrentLocation}
//             className="btn-secondary w-full"
//           >
//             <MapPin size={20} className="inline mr-2" />
//             Get Current Location
//           </button>

//           <button
//             type="submit"
//             disabled={loading}
//             className="btn-primary w-full"
//           >
//             {loading ? 'Creating Account...' : 'Create Account'}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             Already have an account?{' '}
//             <Link to="/login" className="text-eco-main font-semibold hover:text-eco-dark">
//               Login here
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Mail, Lock, User, Phone, MapPin, Map } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',        // ✅ ADD
    locality: '',
    pincode: '',     // ✅ ADD
    //address: '',
    latitude: '',
    longitude: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate that latitude and longitude are provided and are valid numbers
    if (!formData.latitude || !formData.longitude || isNaN(formData.latitude) || isNaN(formData.longitude)) {
      setError('Please select your location on the map or enter valid latitude and longitude');
      return;
    }

    setLoading(true);

    try {
      // Convert latitude and longitude to numbers for backend
      const submitData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };
      await register(submitData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map with current location
  useEffect(() => {
    if (showMap && !mapInstance) {
      // Get current location and initialize map
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Initialize map
            const map = L.map('map-container').setView([lat, lng], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Add marker and set coordinates
            const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            
            // Update coordinates when marker is dragged
            marker.on('dragend', async () => {
              const latLng = marker.getLatLng();
              setFormData(prev => ({
                ...prev,
                latitude: latLng.lat.toString(),
                longitude: latLng.lng.toString()
              }));
              
              // Reverse geocode to get locality
              await getReverseGeocode(latLng.lat, latLng.lng);
            });

            // Initial coordinate set
            setFormData(prev => ({
              ...prev,
              latitude: lat.toString(),
              longitude: lng.toString()
            }));

            // Get initial locality
            getReverseGeocode(lat, lng);

            setMapInstance(map);
          },
          (err) => {
            setError('Unable to get your location. Please enable location access.');
          }
        );
      }
    }
  }, [showMap]);

  // Reverse geocode coordinates to get locality, city, pincode
  const getReverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.address) {
        const { city, town, village, county, postcode, suburb } = data.address;
        const locality = suburb || town || village || county || 'Unknown';
        const cityName = city || town || village || 'Unknown';
        
        setFormData(prev => ({
          ...prev,
          locality: locality.toLowerCase(),
          city: cityName.toLowerCase(),
          pincode: postcode || ''
        }));
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  // Handle map click to place marker
  useEffect(() => {
    if (mapInstance) {
      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
        getReverseGeocode(lat, lng);
      });
    }
  }, [mapInstance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-eco-main p-3 rounded-2xl mb-4">
            <Leaf className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Join EcoLoop</h1>
          <p className="text-gray-600">Create your household account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Email - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="khushi"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="khushi@gmail.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Phone & Password - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="6006882131"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* City & Pincode - Row 3 - ✅ NEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Delhi"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pincode *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="110001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Locality & Address - Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Locality *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="prayagraj"
                  required
                />
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="teliarganj"
                required
              />
            </div> */}
          </div>

          {/* Latitude & Longitude - Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="input-field"
                placeholder="28.7041"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="input-field"
                placeholder="77.1025"
                required
              />
            </div>
          </div>

          {/* Location Picker Button */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <MapPin size={20} />
            {showMap ? 'Hide Map' : 'Pick Location on Map'}
          </button>

          {/* Map Container */}
          {showMap && (
            <div className="border rounded-lg overflow-hidden">
              <div
                id="map-container"
                style={{
                  height: '400px',
                  width: '100%'
                }}
              />
              <div className="bg-blue-50 p-3 text-sm text-gray-700">
                <p className="font-semibold mb-1">📍 Location Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click on the map to set your location</li>
                  <li>Drag the marker to adjust your position</li>
                  <li>Locality will auto-fill via reverse geocoding</li>
                </ul>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-eco-main font-semibold hover:text-eco-dark">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;