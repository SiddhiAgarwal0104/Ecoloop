/**
 * Distance Calculation Utilities
 * Provides geospatial calculations for location-based features
 */

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * More accurate than simple Euclidean distance
 * @param {number} lat1 - Latitude of first point (degrees)
 * @param {number} lon1 - Longitude of first point (degrees)
 * @param {number} lat2 - Latitude of second point (degrees)
 * @param {number} lon2 - Longitude of second point (degrees)
 * @returns {number} Distance in kilometers (rounded to 2 decimals)
 * @example
 * const distance = calculateDistance(28.6139, 77.2090, 28.7041, 77.1025);
 * console.log(distance); // Output: 10.12 km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers

  // Convert degrees to radians
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Return distance rounded to 2 decimal places
  return parseFloat(distance.toFixed(2));
};

/**
 * Find nearby requests within a specific radius
 * @param {array} requests - Array of request objects with pickupLocation
 * @param {number} lat - Recycler latitude
 * @param {number} lon - Recycler longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 10)
 * @returns {array} Requests sorted by distance, filtered by radius
 * @example
 * const nearby = findNearbyRequests(requests, 28.6139, 77.2090, 15);
 */
const findNearbyRequests = (requests, lat, lon, radiusKm = 10) => {
  if (!requests || !Array.isArray(requests)) {
    console.warn('⚠️ Invalid requests array provided');
    return [];
  }

  // Filter requests within radius and calculate distance
  const nearby = requests
    .map((request) => {
      if (!request.pickupLocation) {
        return null;
      }

      const distance = calculateDistance(
        lat,
        lon,
        request.pickupLocation.latitude,
        request.pickupLocation.longitude
      );

      return {
        ...request,
        distance
      };
    })
    .filter((request) => request && request.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return nearby;
};

/**
 * Get distance category for UI display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Category label
 * @example
 * const category = getDistanceCategory(2.5); // "Very Close (< 5 km)"
 */
const getDistanceCategory = (distance) => {
  if (distance < 1) return 'Very Close (< 1 km)';
  if (distance < 5) return 'Close (1-5 km)';
  if (distance < 10) return 'Nearby (5-10 km)';
  if (distance < 25) return 'Moderate (10-25 km)';
  return 'Far (> 25 km)';
};

module.exports = {
  calculateDistance,
  findNearbyRequests,
  getDistanceCategory
};
