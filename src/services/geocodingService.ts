
import { MAPBOX_TOKEN } from "@/config/mapbox";

// Default coordinates (Jakarta, Indonesia)
export const DEFAULT_COORDINATES = {
  lat: -6.2088,
  lng: 106.8456
};

// Geocoding function to convert city, country to coordinates
export async function geocodeLocation(city: string, country: string): Promise<{lat: number, lng: number}> {
  try {
    const location = `${city}, ${country}`;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have results
    if (data.features && data.features.length > 0) {
      // Mapbox returns coordinates as [lng, lat]
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    throw new Error('No location found');
  } catch (error) {
    console.error("Error geocoding location:", error);
    // Return default coordinates if geocoding fails
    return DEFAULT_COORDINATES;
  }
}

// Calculate distance between two coordinates in km using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Filter stations by distance
export function filterStationsByDistance(
  stations: any[],
  userCoords: {lat: number, lng: number},
  maxDistance: number = 30 // Default radius of 30km
): any[] {
  return stations
    .map(station => {
      const distance = calculateDistance(
        userCoords.lat, 
        userCoords.lng, 
        station.position.lat, 
        station.position.lng
      ).toFixed(1);
      
      return {
        ...station,
        distance
      };
    })
    .filter(station => parseFloat(station.distance) <= maxDistance)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}
