
import { useAuth } from '@/contexts/AuthContext';

// Function to calculate distance between two coordinates using the Haversine formula
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Convert latitude and longitude from degrees to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Maximum distance for a station to be considered "nearby" (in kilometers)
export const MAX_NEARBY_DISTANCE = 30;

// Function to filter stations based on user's location
export const filterNearbyStations = <T extends { latitude: number; longitude: number }>(
  stations: T[],
  userLat: number,
  userLng: number,
  maxDistance: number = MAX_NEARBY_DISTANCE
): T[] => {
  if (!stations || stations.length === 0) return [];
  
  return stations.filter(station => {
    const distance = calculateDistance(
      userLat, 
      userLng, 
      station.latitude, 
      station.longitude
    );
    
    return distance <= maxDistance;
  });
};

// Sort stations by distance from user's location
export const sortStationsByDistance = <T extends { latitude: number; longitude: number }>(
  stations: T[],
  userLat: number,
  userLng: number
): T[] => {
  return [...stations].sort((a, b) => {
    const distanceA = calculateDistance(userLat, userLng, a.latitude, a.longitude);
    const distanceB = calculateDistance(userLat, userLng, b.latitude, b.longitude);
    return distanceA - distanceB;
  });
};

// Custom hook to get nearby stations
export const useNearbyStations = <T extends { latitude: number; longitude: number }>(
  stations: T[]
): T[] => {
  const { userLocation } = useAuth();
  
  if (!userLocation || !userLocation.coordinates) {
    return stations;
  }
  
  const { lat, lng } = userLocation.coordinates;
  const nearbyStations = filterNearbyStations(stations, lat, lng);
  return sortStationsByDistance(nearbyStations, lat, lng);
};
