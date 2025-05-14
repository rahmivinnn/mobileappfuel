import { MAPBOX_TOKEN } from "@/config/mapbox";

// Default coordinates (center of the world)
export const DEFAULT_COORDINATES = {
  lat: 0,
  lng: 0
};

// Default US coordinates (Los Angeles)
export const US_COORDINATES = {
  lat: 34.0522,
  lng: -118.2437
};

// Geocoding function to convert city, country to coordinates
export async function geocodeLocation(city: string, country: string): Promise<{lat: number, lng: number}> {
  try {
    // Handle special cases for well-known cities
    if (city.toLowerCase() === "los angeles") {
      return US_COORDINATES;
    }
    
    const location = `${city}, ${country}`;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}&types=place`
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
    
    // Try to get a stored country coordinate from localStorage as a last resort
    const storedCountryCode = localStorage.getItem('userCountry');
    if (storedCountryCode) {
      try {
        // Import the countryCoordinates dynamically
        import('@/hooks/use-geolocation').then(module => {
          const countryCoordinates = module.countryCoordinates;
          if (countryCoordinates && countryCoordinates[storedCountryCode]) {
            return countryCoordinates[storedCountryCode].coordinates;
          }
          return DEFAULT_COORDINATES;
        });
      } catch (err) {
        console.error("Error importing countryCoordinates:", err);
      }
    }
    
    // Return default coordinates if geocoding fails
    return DEFAULT_COORDINATES;
  }
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
    
    // Handle special case for Los Angeles coordinates
    if (Math.abs(coords.lat - US_COORDINATES.lat) < 0.1 && Math.abs(coords.lng - US_COORDINATES.lng) < 0.1) {
      return { city: "Los Angeles", country: "United States" };
    }
    
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
    
    // Handle special case for Los Angeles coordinates
    if (Math.abs(coords.lat - US_COORDINATES.lat) < 0.1 && Math.abs(coords.lng - US_COORDINATES.lng) < 0.1) {
      return { city: "Los Angeles", country: "United States" };
    }
    
    return { city: "Unknown", country: "Unknown" };
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
  maxDistance: number = 100 // Increased default radius to 100km to get more stations
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

// Fetch nearby gas stations - enhanced to handle global locations
export async function fetchNearbyStations(
  coords: {lat: number, lng: number},
  radius: number = 5000, // radius in meters
  count: number = 50 // Number of stations to return
): Promise<any[]> {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if coordinates are close to Los Angeles
  const isLosAngeles = Math.abs(coords.lat - US_COORDINATES.lat) < 0.5 && 
                      Math.abs(coords.lng - US_COORDINATES.lng) < 0.5;
                      
  // Generate more realistic stations for Los Angeles
  if (isLosAngeles) {
    return generateLosAngelesStations(coords, count);
  }
  
  // For other locations, return the filtered dummy data with local branding
  return generateLocalStations(coords, count);
}

// Helper function to generate random gas stations around a location with local flavor
function generateLocalStations(
  center: {lat: number, lng: number},
  count: number = 50
): any[] {
  const stations = [];
  
  // Determine region and load appropriate brands
  let brandNames: string[] = [];
  let currencySymbol = "$"; // Default
  
  // Use coordinates to roughly determine region and set appropriate brands
  if (center.lat > 20 && center.lat < 70 && center.lng > -130 && center.lng < -50) {
    // North America
    brandNames = ["Shell", "BP", "Exxon", "Mobil", "Chevron", "Texaco", "ARCO", "76"];
    currencySymbol = "$";
  } else if (center.lat > 35 && center.lat < 70 && center.lng > -10 && center.lng < 40) {
    // Europe
    brandNames = ["Shell", "BP", "Total", "Esso", "Aral", "OMV", "Repsol", "Cepsa"];
    currencySymbol = "€";
  } else if (center.lat > -50 && center.lat < 15 && center.lng > -80 && center.lng < -30) {
    // South America
    brandNames = ["Petrobras", "YPF", "COPEC", "Terpel", "Shell", "Texaco", "Axion"];
    currencySymbol = "$";
  } else if (center.lat > -45 && center.lat < 30 && center.lng > 10 && center.lng < 60) {
    // Africa
    brandNames = ["Total", "Shell", "Engen", "Caltex", "OiLibya", "Puma", "GNPC"];
    currencySymbol = "$";
  } else if (center.lat > -10 && center.lat < 60 && center.lng > 60 && center.lng < 150) {
    // Asia
    brandNames = ["Pertamina", "Petronas", "Sinopec", "CNPC", "IndianOil", "PTT", "SK"];
    currencySymbol = "¥";
  } else if (center.lat > -50 && center.lat < -10 && center.lng > 110 && center.lng < 180) {
    // Australia/Oceania
    brandNames = ["BP", "Shell", "Caltex", "Mobil", "United", "Liberty", "Z Energy"];
    currencySymbol = "$";
  } else {
    // Default/Global
    brandNames = ["Shell", "BP", "Total", "FuelFriendly", "Petronas", "ExxonMobil"];
    currencySymbol = "$";
  }
  
  for (let i = 0; i < count; i++) {
    // Generate a random position within approximately 5km
    const randomLat = center.lat + (Math.random() - 0.5) * 0.09;
    const randomLng = center.lng + (Math.random() - 0.5) * 0.09;
    
    // Calculate actual distance
    const distance = calculateDistance(center.lat, center.lng, randomLat, randomLng).toFixed(1);
    
    // Random price based on region (adjust based on local currencies)
    let price = (3 + Math.random() * 1.5).toFixed(2);
    
    // Random brand
    const brand = brandNames[Math.floor(Math.random() * brandNames.length)];
    
    // Random opening hours
    const openHour = 6 + Math.floor(Math.random() * 4); // Between 6am and 9am
    const closeHour = 20 + Math.floor(Math.random() * 4); // Between 8pm and 11pm
    const is24Hours = Math.random() > 0.7;
    
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
        open: is24Hours ? 0 : openHour,
        close: is24Hours ? 24 : closeHour,
        is24Hours
      },
      imageUrl: "/lovable-uploads/e7264ee5-ed98-4679-91b4-8f12d183784b.png"
    });
  }
  
  return stations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

// Generate realistic Los Angeles gas stations
function generateLosAngelesStations(
  center: {lat: number, lng: number},
  count: number = 50
): any[] {
  const stations = [];
  const laStreets = [
    "Wilshire Blvd", "Santa Monica Blvd", "Sunset Blvd", "Hollywood Blvd", 
    "Venice Blvd", "Pico Blvd", "Olympic Blvd", "Figueroa St", "La Cienega Blvd",
    "Melrose Ave", "Beverly Blvd", "Western Ave", "Fairfax Ave", "La Brea Ave"
  ];
  
  const laBrands = ["Chevron", "Shell", "ARCO", "Mobil", "76", "Valero", "Texaco", "Exxon"];
  
  for (let i = 0; i < count; i++) {
    // Generate a random position within approximately 5km of LA center
    const randomLat = center.lat + (Math.random() - 0.5) * 0.09;
    const randomLng = center.lng + (Math.random() - 0.5) * 0.09;
    
    // Calculate actual distance
    const distance = calculateDistance(center.lat, center.lng, randomLat, randomLng).toFixed(1);
    
    // LA gas prices typically higher - between $4.50 and $6.00
    const price = (4.5 + Math.random() * 1.5).toFixed(2);
    
    // Random LA brand
    const brand = laBrands[Math.floor(Math.random() * laBrands.length)];
    
    // Random LA street
    const street = laStreets[Math.floor(Math.random() * laStreets.length)];
    
    // Random opening hours - many LA gas stations open 24/7
    const is24Hours = Math.random() > 0.3;
    const openHour = is24Hours ? 0 : (6 + Math.floor(Math.random() * 2)); 
    const closeHour = is24Hours ? 24 : (22 + Math.floor(Math.random() * 2));
    
    stations.push({
      id: `la-station-${i}`,
      name: `${brand} - ${street}`,
      address: `${Math.floor(1000 + Math.random() * 8000)} ${street}, Los Angeles, CA`,
      position: {
        lat: randomLat,
        lng: randomLng
      },
      distance,
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      fuels: [
        { type: "Regular", price: price },
        { type: "Premium", price: (parseFloat(price) + 0.40).toFixed(2) },
        { type: "Super", price: (parseFloat(price) + 0.60).toFixed(2) },
        { type: "Diesel", price: (parseFloat(price) + 0.20).toFixed(2) }
      ],
      hours: {
        open: openHour,
        close: closeHour,
        is24Hours: is24Hours
      },
      imageUrl: "/lovable-uploads/e7264ee5-ed98-4679-91b4-8f12d183784b.png"
    });
  }
  
  return stations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}
