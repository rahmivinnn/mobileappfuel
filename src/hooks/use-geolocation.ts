
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

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        console.log("Attempting to get user location...");
        
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser");
        }
        
        // Request location with high accuracy and short timeout
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject, 
            { 
              enableHighAccuracy: true, 
              timeout: 5000, 
              maximumAge: 0 
            }
          );
        });

        const { latitude, longitude } = position.coords;
        console.log("Location obtained:", latitude, longitude);

        // Use Mapbox Geocoding API to get location details
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
          );

          const data = await response.json();
          
          if (!data.features || data.features.length === 0) {
            throw new Error("No location data found");
          }
          
          const features = data.features[0];
          
          const country = features.context?.find((ctx: any) => 
            ctx.id.startsWith('country')
          )?.text || 'Malaysia';
          
          const city = features.context?.find((ctx: any) => 
            ctx.id.startsWith('place')
          )?.text || 'Kuala Lumpur';

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
        
        // Show toast with error
        toast({
          title: "Location Error",
          description: "Could not detect your location. Using default location.",
          variant: "destructive"
        });
        
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
  }, []);

  return { location, error, loading };
};
