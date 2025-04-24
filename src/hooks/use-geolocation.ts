
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
  const [location, setLocation] = useState<Location | null>(null);
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
        )?.text || 'Unknown Country';
        
        const city = features.context.find((ctx: any) => 
          ctx.id.startsWith('place')
        )?.text || 'Unknown City';

        setLocation({
          country,
          city,
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        });
      } catch (err) {
        setError('Unable to get your location');
        console.error('Geolocation error:', err);
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  return { location, error, loading };
};
