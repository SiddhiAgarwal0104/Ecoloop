
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPin, Search, Loader, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      
      // Reverse geocode to get address
      reverseGeocode(e.latlng.lat, e.latlng.lng, onLocationSelect);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
}

// Reverse geocoding using Nominatim (OpenStreetMap)
const reverseGeocode = async (lat, lng, onLocationSelect) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data.display_name) {
      onLocationSelect({
        address: data.display_name,
        latitude: lat,
        longitude: lng,
      });
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
  }
};

// Forward geocoding (search address)
const searchLocation = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

const LocationPicker = ({ onLocationSelect, defaultAddress = '' }) => {
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default: Delhi
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);
  const searchTimeout = useRef(null);

  // Handle search input
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchLocation(query);
      setSearchResults(results);
      setSearching(false);
    }, 500);
  };

  // Handle selecting a search result
  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setPosition([lat, lng]);
    setMarkerPosition([lat, lng]);
    setSelectedAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
    
    onLocationSelect({
      address: result.display_name,
      latitude: lat,
      longitude: lng,
    });
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setPosition([lat, lng]);
          setMarkerPosition([lat, lng]);
          
          // Get address for current location
          reverseGeocode(lat, lng, (location) => {
            setSelectedAddress(location.address);
            onLocationSelect(location);
          });
        },
        (error) => {
          alert('Unable to get your location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Location *
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search for a location..."
          />
          {searching && (
            <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-eco-main" size={20} />
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-eco-light transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="text-eco-main flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{result.display_name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <button
        type="button"
        onClick={getCurrentLocation}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <Navigation size={20} />
        Use Current Location
      </button>

      {/* Map */}
      <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          key={position.join(',')} // Force re-render when position changes
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={markerPosition} 
            setPosition={setMarkerPosition}
            onLocationSelect={(location) => {
              setSelectedAddress(location.address);
              onLocationSelect(location);
            }}
          />
        </MapContainer>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Click on the map to pin your exact location, or search above
        </p>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-1">Selected Location:</p>
          <p className="text-sm text-green-700">{selectedAddress}</p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;