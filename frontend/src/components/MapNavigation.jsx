import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { MapPin, Navigation } from 'lucide-react';

/**
 * Map Navigation Component
 * Displays OpenStreetMap with routing capabilities for households
 */
const MapNavigation = ({ 
  startLocation = null, 
  endLocation = null,
  onRouteSelected = null,
  height = 'h-96'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView([28.7041, 77.1025], 13); // Default: New Delhi

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Set loading to false - map loads immediately
    setLoading(false);

    // Get user's current location (non-blocking)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          map.setView([latitude, longitude], 15);

          // Add user location marker
          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#2e7d32',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          })
            .addTo(map)
            .bindPopup('Your Location');
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message);
          // Continue without user location
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    }

    return () => {
      map.remove();
    };
  }, []);

  // Add routing when locations are provided
  useEffect(() => {
    if (!mapInstanceRef.current || !startLocation || !endLocation) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }

    try {
      // Create routing control
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(startLocation.lat, startLocation.lng),
          L.latLng(endLocation.lat, endLocation.lng)
        ],
        routeWhileDragging: true,
        show: true,
        lineOptions: {
          styles: [
            { color: '#2e7d32', opacity: 0.7, weight: 5 }
          ]
        },
        createMarker: (i, wp, nWps) => {
          if (i === 0) {
            return L.marker(wp.latLng, {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              }),
              title: 'Start'
            });
          } else if (i === nWps - 1) {
            return L.marker(wp.latLng, {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              }),
              title: 'End'
            });
          }
        }
      }).addTo(mapInstanceRef.current);

      routingControlRef.current = routingControl;

      // Handle route selection
      routingControl.on('routeselected', (e) => {
        if (onRouteSelected) {
          const route = e.route;
          onRouteSelected({
            distance: route.summary.totalDistance,
            time: route.summary.totalTime,
            coordinates: route.coordinates
          });
        }
      });
    } catch (error) {
      console.error('Routing error:', error);
    }
  }, [startLocation, endLocation, onRouteSelected]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 text-eco-dark">
          <MapPin size={20} className="text-eco-main" />
          <h3 className="font-semibold">Navigation Map</h3>
        </div>
        {userLocation && (
          <span className="text-sm text-gray-500">
            📍 Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        )}
      </div>

      {loading && (
        <div className={`flex items-center justify-center ${height} bg-gray-100 rounded-lg`}>
          <div className="text-center">
            <Navigation className="animate-spin text-eco-main mx-auto mb-2" size={24} />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className={`rounded-lg border border-[#c8e6c9] ${height} w-full`}
        style={{ display: loading ? 'none' : 'block' }}
      />

      {startLocation && endLocation && (
        <div className="mt-4 p-4 bg-eco-light rounded-lg border border-[#c8e6c9]">
          <h4 className="font-semibold text-eco-dark mb-2">Route Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Start: {startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-gray-600">End: {endLocation.lat.toFixed(4)}, {endLocation.lng.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapNavigation;
