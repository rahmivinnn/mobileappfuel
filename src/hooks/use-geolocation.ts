
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/config/mapbox';
import { toast } from '@/hooks/use-toast';

interface Location {
  country: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Default coordinates for countries
const countryCoordinates: Record<string, {city: string, coordinates: {lat: number, lng: number}}> = {
  'ID': { // Indonesia
    city: 'Jakarta',
    coordinates: { lat: -6.2088, lng: 106.8456 }
  },
  'MY': { // Malaysia
    city: 'Kuala Lumpur',
    coordinates: { lat: 3.1390, lng: 101.6869 }
  },
  'SG': { // Singapore
    city: 'Singapore',
    coordinates: { lat: 1.3521, lng: 103.8198 }
  },
  'TH': { // Thailand
    city: 'Bangkok',
    coordinates: { lat: 13.7563, lng: 100.5018 }
  },
  'PH': { // Philippines
    city: 'Manila',
    coordinates: { lat: 14.5995, lng: 120.9842 }
  },
  'VN': { // Vietnam
    city: 'Hanoi',
    coordinates: { lat: 21.0278, lng: 105.8342 }
  },
  'US': { // United States
    city: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  'GB': { // United Kingdom
    city: 'London',
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  'AU': { // Australia
    city: 'Sydney',
    coordinates: { lat: -33.8688, lng: 151.2093 }
  },
  'JP': { // Japan
    city: 'Tokyo',
    coordinates: { lat: 35.6762, lng: 139.6503 }
  }
};

export const useGeolocation = () => {
  // Get user's country from localStorage if available
  const storedCountry = localStorage.getItem('userCountry') || 'ID';
  const storedCountryName = localStorage.getItem('userCountryName') || 'Indonesia';
  
  // Initialize with the stored country or default to Indonesia
  const defaultLocation = countryCoordinates[storedCountry] || countryCoordinates['ID'];
  
  const [location, setLocation] = useState<Location | null>({
    country: storedCountryName,
    city: defaultLocation.city,
    coordinates: defaultLocation.coordinates
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        console.log("Attempting to get user location...");
        
        // If there's a selected country, prioritize that over browser geolocation
        const userCountry = localStorage.getItem('userCountry');
        
        if (userCountry && countryCoordinates[userCountry]) {
          const countryData = countryCoordinates[userCountry];
          const countryName = localStorage.getItem('userCountryName') || userCountry;
          
          console.log(`Using selected country: ${countryName}`);
          
          setLocation({
            country: countryName,
            city: countryData.city,
            coordinates: countryData.coordinates
          });
          
          toast({
            title: "Location set",
            description: `${countryData.city}, ${countryName}`,
          });
          
          setLoading(false);
          return;
        }
        
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser");
        }
        
        // Request location with high accuracy and longer timeout (15 seconds)
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            (err) => {
              // Handle permission denied specifically
              if (err.code === 1) { // 1 = PERMISSION_DENIED
                console.warn("Geolocation permission denied");
                setPermissionDenied(true);
              }
              reject(err);
            }, 
            { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 0 
            }
          );
        });

        const { latitude, longitude } = position.coords;
        console.log("Location obtained successfully:", latitude, longitude);

        // Use Mapbox Geocoding API to get location details
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
          );

          if (!response.ok) {
            throw new Error(`Geocoding API Error: ${response.status}`);
          }

          const data = await response.json();
          
          if (!data.features || data.features.length === 0) {
            throw new Error("No location data found");
          }
          
          const features = data.features;
          
          // Find country in context
          const countryFeature = features.find((f: any) => f.place_type.includes('country')) || 
                                features[0].context?.find((ctx: any) => ctx.id.startsWith('country'));
          const cityFeature = features.find((f: any) => f.place_type.includes('place')) ||
                              features[0].context?.find((ctx: any) => ctx.id.startsWith('place'));

          const country = countryFeature?.text || countryFeature?.short_code?.toUpperCase() || 'Malaysia';
          const city = cityFeature?.text || 'Unknown';

          console.log("Location details:", { country, city });

          setLocation({
            country,
            city,
            coordinates: {
              lat: latitude,
              lng: longitude
            }
          });
          
          toast({
            title: "Location detected",
            description: `${city}, ${country}`,
          });
        } catch (geocodeError) {
          console.error("Geocoding error:", geocodeError);
          // Still set coordinates even if geocoding fails
          setLocation({
            country: 'Unknown',
            city: 'Unknown',
            coordinates: {
              lat: latitude,
              lng: longitude
            }
          });
        }
      } catch (err: any) {
        console.error("Geolocation error:", err);
        setError(err.message || "Failed to get location");
        
        // Show specific message for permission denied
        if (permissionDenied) {
          toast({
            title: "Location Permission Denied",
            description: "Using your selected country location.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Location Error",
            description: "Using your selected country location.",
            variant: "destructive"
          });
        }
        
        // Use the user's selected country or default to Indonesia
        const userCountry = localStorage.getItem('userCountry') || 'ID';
        const countryName = localStorage.getItem('userCountryName') || 'Indonesia';
        const defaultData = countryCoordinates[userCountry] || countryCoordinates['ID'];
        
        setLocation({
          country: countryName,
          city: defaultData.city,
          coordinates: defaultData.coordinates
        });
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, [permissionDenied]);

  // Function to manually retry getting location
  const refreshLocation = () => {
    setLoading(true);
    setError(null);
    
    // Clear stored country to attempt fresh geolocation
    getUserLocation();
  };

  // Function to manually set country
  const setCountry = (countryCode: string, countryName: string) => {
    if (countryCoordinates[countryCode]) {
      const countryData = countryCoordinates[countryCode];
      
      localStorage.setItem('userCountry', countryCode);
      localStorage.setItem('userCountryName', countryName);
      
      setLocation({
        country: countryName,
        city: countryData.city,
        coordinates: countryData.coordinates
      });
      
      toast({
        title: "Location updated",
        description: `${countryData.city}, ${countryName}`,
      });
      
      return true;
    }
    return false;
  };

  return { 
    location, 
    error, 
    loading, 
    permissionDenied, 
    refreshLocation,
    setCountry
  };
};
