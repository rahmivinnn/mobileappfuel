
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

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>({
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    coordinates: {
      lat: 3.1390,
      lng: 101.6869
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        console.log("Attempting to get user location...");
        
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
            description: "Please enable location services to find nearby stations.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Location Error",
            description: "Could not detect your location. Using default location.",
            variant: "destructive"
          });
        }
        
        // Default to Kuala Lumpur if geolocation fails
        setLocation({
          country: 'Malaysia',
          city: 'Kuala Lumpur',
          coordinates: {
            lat: 3.1390,
            lng: 101.6869
          }
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
    getUserLocation();
  };

  return { location, error, loading, permissionDenied, refreshLocation };
};

function getUserLocation() {
  throw new Error('Function not implemented.');
}
