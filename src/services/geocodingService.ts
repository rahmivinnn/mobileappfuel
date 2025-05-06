
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

// Get reverse geocoding information (coordinates to address)
export async function reverseGeocode(
  coords: {lat: number, lng: number}
): Promise<{city: string, country: string}> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=${MAPBOX_TOKEN}&types=place,country`
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract city and country from the returned features
    let city = "Unknown";
    let country = "Unknown";
    
    // Parse the features to extract place (city) and country
    if (data.features && data.features.length > 0) {
      // Find the place feature (city)
      const placeFeature = data.features.find((feature: any) => 
        feature.place_type.includes('place')
      );
      
      // Find the country feature
      const countryFeature = data.features.find((feature: any) => 
        feature.place_type.includes('country')
      );
      
      if (placeFeature) {
        city = placeFeature.text;
      }
      
      if (countryFeature) {
        country = countryFeature.text;
      }
    }
    
    return { city, country };
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return { city: "Unknown", country: "Unknown" };
  }
}

// Fetch nearby gas stations - this would be replaced with a real API in production
export async function fetchNearbyStations(
  coords: {lat: number, lng: number},
  radius: number = 5000 // radius in meters
): Promise<any[]> {
  // This is a placeholder for a real API call
  // In a real app, you would use Mapbox/Foursquare/Google Places API
  
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For now, return the filtered dummy data
  const randomStations = generateRandomStations(coords, 15);
  return randomStations;
}

// Helper function to generate random gas stations around a location
// This is just for demonstration - in a real app you'd use a proper API
function generateRandomStations(
  center: {lat: number, lng: number},
  count: number = 10
): any[] {
  const stations = [];
  const brandNames = ["Pertamina", "Shell", "BP", "Total", "Petronas", "ExxonMobil", "FuelFriendly"];
  
  for (let i = 0; i < count; i++) {
    // Generate a random position within approximately 5km
    const randomLat = center.lat + (Math.random() - 0.5) * 0.09;
    const randomLng = center.lng + (Math.random() - 0.5) * 0.09;
    
    // Calculate actual distance
    const distance = calculateDistance(center.lat, center.lng, randomLat, randomLng).toFixed(1);
    
    // Random price between $3.00 and $4.50
    const price = (3 + Math.random() * 1.5).toFixed(2);
    
    // Random brand
    const brand = brandNames[Math.floor(Math.random() * brandNames.length)];
    
    // Random opening hours
    const openHour = 6 + Math.floor(Math.random() * 4); // Between 6am and 9am
    const closeHour = 20 + Math.floor(Math.random() * 4); // Between 8pm and 11pm
    
    stations.push({
      id: `station-${i}`,
      name: `${brand} Gas Station #${1000 + i}`,
      address: `${Math.floor(1000 + Math.random() * 9000)} Main St.`,
      position: {
        lat: randomLat,
        lng: randomLng
      },
      distance,
      rating: (3 + Math.random() * 2).toFixed(1),
      fuels: [
        { type: "Regular", price: price },
        { type: "Premium", price: (parseFloat(price) + 0.30).toFixed(2) },
        { type: "Diesel", price: (parseFloat(price) + 0.15).toFixed(2) }
      ],
      hours: {
        open: openHour,
        close: closeHour
      },
      imageUrl: "/lovable-uploads/e7264ee5-ed98-4679-91b4-8f12d183784b.png"
    });
  }
  
  return stations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}
