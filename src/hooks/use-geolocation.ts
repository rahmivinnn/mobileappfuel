
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/config/mapbox';

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
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        // Use Mapbox Geocoding API to get location details
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
        );

        const data = await response.json();
        const features = data.features[0];
        
        const country = features.context.find((ctx: any) => 
          ctx.id.startsWith('country')
        )?.text || 'Malaysia';
        
        const city = features.context.find((ctx: any) => 
          ctx.id.startsWith('place')
        )?.text || 'Kuala Lumpur';

        setLocation({
          country,
          city,
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        });
      } catch (err) {
        console.error('Geolocation error:', err);
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
