import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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
  const timer = useRef(null);

  const handleSearch = (q) => {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      if (q.length < 3) return;
      setLoading(true);
      setResults(await searchLocation(q));
      setLoading(false);
    }, 400);
  };

  const selectResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setCenter([lat, lng]);
    setMarker([lat, lng]);
    onLocationSelect({
      address: r.display_name,
      locality: extractLocality(r.display_name),
      latitude: lat,
      longitude: lng,
    });
    setResults([]);
    setQuery('');
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCenter([latitude, longitude]);
      setMarker([latitude, longitude]);
      reverseGeocode(latitude, longitude, onLocationSelect);
    });
  };

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search location"
        className="input-field"
      />

      {loading && <Loader className="animate-spin" />}

      {results.map((r, i) => (
        <button
          key={i}
          type="button"
          onClick={() => selectResult(r)}
          className="block w-full text-left text-sm p-2 hover:bg-gray-100"
        >
          <MapPin className="inline mr-1" size={14} />
          {r.display_name}
        </button>
      ))}

      <button type="button" onClick={useCurrentLocation} className="btn-secondary w-full">
        <Navigation size={18} /> Use Current Location
      </button>

      <MapContainer center={center} zoom={13} style={{ height: 350 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker setMarker={setMarker} onSelect={onLocationSelect} />
        {marker && (
          <Marker position={marker}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
