// Mapbox configuration
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnVlbGZyaWVuZGx5MjAyNSIsImEiOiJjbTlzZGZsOHowMW00Mm1xNGEzcHhzYnQ4In0.5K8rY561eFLN2hy0U7QPdw';

// Available map styles - colorful options
export const MAP_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',       // Colorful street view
  OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',     // Nature-focused view
  SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite with streets
  NAVIGATION_DAY: 'mapbox://styles/mapbox/navigation-day-v1', // Bright navigation view
  NAVIGATION_NIGHT: 'mapbox://styles/mapbox/navigation-night-v1', // Dark navigation view
  DARK: 'mapbox://styles/mapbox/dark-v11',             // Dark theme
  LIGHT: 'mapbox://styles/mapbox/light-v11'            // Light theme
};

// Default map style - using a colorful style
export const MAPBOX_STYLE = MAP_STYLES.STREETS;

// Default map center (Memphis coordinates)
export const DEFAULT_CENTER = {
  lat: 35.1495,
  lng: -90.0490
};

// Default zoom level
export const DEFAULT_ZOOM = 13;
