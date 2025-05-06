
// Mapbox configuration
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnVlbGZyaWVuZGx5MjAyNSIsImEiOiJjbTlzZGZsOHowMW00Mm1xNGEzcHhzYnQ4In0.5K8rY561eFLN2hy0U7QPdw';

// Available map styles - simplified to core styles
export const MAP_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',       // Default street view
  SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite with streets
  DARK: 'mapbox://styles/mapbox/dark-v11',             // Dark theme
  LIGHT: 'mapbox://styles/mapbox/light-v11',           // Light theme
  NAVIGATION_DAY: 'mapbox://styles/mapbox/navigation-day-v1' // Navigation style for backward compatibility
};

// Default map style
export const MAPBOX_STYLE = MAP_STYLES.STREETS;

// Default map center (Los Angeles, United States)
export const DEFAULT_CENTER = {
  lat: 34.0522,
  lng: -118.2437
};

// Default zoom level
export const DEFAULT_ZOOM = 13;
