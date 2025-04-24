
// Mapbox configuration
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnVlbGZyaWVuZGx5MjAyNSIsImEiOiJjbTlzZGZsOHowMW00Mm1xNGEzcHhzYnQ4In0.5K8rY561eFLN2hy0U7QPdw';

// Available map styles - simplified to core styles
export const MAP_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',       // Default street view
  SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite with streets
  DARK: 'mapbox://styles/mapbox/dark-v11',             // Dark theme
};

// Default map style
export const MAPBOX_STYLE = MAP_STYLES.STREETS;

// Default map center (Kuala Lumpur coordinates)
export const DEFAULT_CENTER = {
  lat: 3.1390,
  lng: 101.6869
};

// Default zoom level
export const DEFAULT_ZOOM = 13;
