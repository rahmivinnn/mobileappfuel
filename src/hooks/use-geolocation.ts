
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

// Default location for Indonesia (Jakarta)
const DEFAULT_LOCATION: Location = {
  country: 'Indonesia',
  city: 'Jakarta',
  coordinates: {
    lat: -6.2088,
    lng: 106.8456
  }
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Set a timeout to ensure we don't wait too long
        const timeoutPromise = new Promise<GeolocationPosition>((_, reject) => {
          setTimeout(() => reject(new Error('Geolocation timeout')), 5000);
        });
        
        const locationPromise = new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Race between location detection and timeout
        const position = await Promise.race([locationPromise, timeoutPromise]);
        
        const { latitude, longitude } = position.coords;

        // Use Mapbox Geocoding API to get location details
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
          );

          const data = await response.json();
          
          if (!data.features || data.features.length === 0) {
            throw new Error('No location data found');
          }
          
          const features = data.features[0];
          
          const country = features.context?.find((ctx: any) => 
            ctx.id.startsWith('country')
          )?.text || 'Unknown Country';
          
          const city = features.context?.find((ctx: any) => 
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
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          // Use raw coordinates if geocoding fails
          setLocation({
            country: 'Unknown Country',
            city: 'Unknown City',
            coordinates: {
              lat: latitude,
              lng: longitude
            }
          });
        }
      } catch (err) {
        console.error('Geolocation error:', err);
        // Fall back to default Indonesia location
        setLocation(DEFAULT_LOCATION);
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  return { location: location || DEFAULT_LOCATION, error, loading };
};
