import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Search, Loader, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper
const extractLocality = (address = '') =>
  address.split(',')[0]?.trim() || '';

// Reverse geocode
const reverseGeocode = async (lat, lng, cb) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  if (data?.display_name) {
    cb({
      address: data.display_name,
      locality: extractLocality(data.display_name),
      latitude: lat,
      longitude: lng,
    });
  }
};

// Search
const searchLocation = async (query) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  );
  return await res.json();
};

// Component to handle map centering
function MapCenter({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2) {
      console.log('Updating map center to:', center);
      map.flyTo(center, zoom || 15, {
        duration: 1.5
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

function LocationMarker({ setMarker, onSelect }) {
  useMapEvents({
    click(e) {
      reverseGeocode(e.latlng.lat, e.latlng.lng, onSelect);
      setMarker([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const LocationPicker = ({ onLocationSelect }) => {
  const [center, setCenter] = useState([28.6139, 77.2090]);
  const [marker, setMarker] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const timer = useRef(null);

  const handleSearch = (q) => {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const searchResults = await searchLocation(q);
        console.log('Search results:', searchResults);
        setResults(searchResults);
        
        // Auto-center map on first search result
        if (searchResults && searchResults.length > 0) {
          const firstResult = searchResults[0];
          const lat = parseFloat(firstResult.lat);
          const lng = parseFloat(firstResult.lon);
          console.log('Centering map to:', lat, lng);
          setCenter([lat, lng]);
          setMarker([lat, lng]);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const selectResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setCenter([lat, lng]);
    setMarker([lat, lng]);
    setSelectedResult(r);
    setQuery(r.display_name);
    onLocationSelect({
      address: r.display_name,
      locality: extractLocality(r.display_name),
      latitude: lat,
      longitude: lng,
    });
    setResults([]);
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCenter([latitude, longitude]);
      setMarker([latitude, longitude]);
      reverseGeocode(latitude, longitude, (location) => {
        setQuery(location.address);
        setSelectedResult({ lat: latitude, lon: longitude });
        onLocationSelect(location);
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search location or enter locality name"
          className="input-field w-full"
          autoComplete="off"
        />

        {loading && (
          <div className="absolute right-3 top-3">
            <Loader className="animate-spin text-eco-main" size={20} />
          </div>
        )}

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto mt-1">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left text-sm p-3 hover:bg-green-50 border-b last:border-b-0 transition-colors flex items-start gap-2"
              >
                <MapPin className="text-eco-main mt-0.5 flex-shrink-0" size={16} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate">{r.display_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={useCurrentLocation} className="btn-secondary w-full flex items-center justify-center gap-2">
        <Navigation size={18} /> Use Current Location
      </button>

      <MapContainer center={center} zoom={13} style={{ height: 350, borderRadius: '0.75rem' }} key="location-map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <MapCenter center={center} zoom={15} />
        <LocationMarker setMarker={setMarker} onSelect={onLocationSelect} />
        {marker && (
          <Marker position={marker}>
            <Popup>
              {selectedResult ? selectedResult.display_name : 'Selected Location'}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
