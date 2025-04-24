import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAP_STYLES } from '@/config/mapbox';
import { Map as MapIcon, Layers, Car } from 'lucide-react';

// Set Mapbox token
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
  }>;
  interactive?: boolean;
  directions?: boolean;
  showRoute?: boolean;
  showTraffic?: boolean;
  mapStyle?: string;
  onStyleChange?: (style: string) => void;
  onTrafficToggle?: (show: boolean) => void;
  showBackButton?: boolean;
  onMarkerClick?: (index: number) => void;
}

const Map = React.forwardRef<HTMLDivElement, MapProps>(
  (
    {
      className,
      center = { lat: 35.149, lng: -90.048 },
      zoom = 13,
      markers = [],
      interactive = true,
      directions = false,
      showRoute = false,
      showTraffic = false,
      mapStyle = MAP_STYLES.STREETS,
      onStyleChange,
      onTrafficToggle,
      showBackButton,
      onMarkerClick,
      ...props
    },
    ref
  ) => {
    // Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    // State
    const [mapLoaded, setMapLoaded] = useState(false);
    const [currentMapStyle, setCurrentMapStyle] = useState(mapStyle);
    const [trafficVisible, setTrafficVisible] = useState(showTraffic);
    const [isMoving, setIsMoving] = useState(false);

    // Initialize map
    useEffect(() => {
      if (!mapContainerRef.current) return;

      // Create map instance
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: currentMapStyle,
        center: [center.lng, center.lat],
        zoom: zoom,
        attributionControl: false,
        interactive: interactive,
      });

      // Store map instance in ref
      mapInstanceRef.current = map;

      // Set map loaded when map is ready
      map.on('load', () => {
        setMapLoaded(true);

        // Add event listeners for map movement
        map.on('movestart', () => {
          setIsMoving(true);
        });

        map.on('moveend', () => {
          setIsMoving(false);
        });
      });

      // Clean up on unmount
      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    }, []);

    // Update map center and zoom when props change
    useEffect(() => {
      if (mapInstanceRef.current && mapInstanceRef.current.loaded()) {
        mapInstanceRef.current.flyTo({
          center: [center.lng, center.lat],
          zoom: zoom,
          essential: true,
          duration: 1000,
        });
      }
    }, [center, zoom]);

    // Update map style when currentMapStyle changes
    useEffect(() => {
      if (mapInstanceRef.current && mapInstanceRef.current.loaded()) {
        try {
          const currentStyle = mapInstanceRef.current.getStyle();
          // Check if style needs to be updated
          if (currentStyle && currentMapStyle && currentStyle.sprite !== currentMapStyle) {
            mapInstanceRef.current.setStyle(currentMapStyle);
            if (onStyleChange) onStyleChange(currentMapStyle);
          }
        } catch (error) {
          console.error('Error updating map style:', error);
        }
      }
    }, [currentMapStyle, onStyleChange]);

    // Add markers to map
    useEffect(() => {
      if (!mapInstanceRef.current || !mapLoaded || isMoving) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      markers.forEach((marker, index) => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.background = marker.icon ? 'transparent' : '#00E676';
        el.style.boxShadow = '0 0 10px rgba(0, 230, 118, 0.5)';
        
        // Make marker clickable if onMarkerClick is provided
        if (onMarkerClick) {
          el.style.cursor = 'pointer';
          el.onclick = () => onMarkerClick(index);
        }

        // Add icon or default marker
        if (marker.icon) {
          const img = document.createElement('img');
          img.src = marker.icon;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.borderRadius = '50%';
          img.style.border = '2px solid #00E676';
          el.appendChild(img);
        } else {
          el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
          el.style.color = '#151822';
        }

        // Add tooltip
        if (marker.title) {
          el.title = marker.title;
        }

        // Create and add marker to map
        const mapboxMarker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom',
        })
          .setLngLat([marker.position.lng, marker.position.lat])
          .addTo(mapInstanceRef.current);

        // Store marker reference
        markersRef.current.push(mapboxMarker);
      });
    }, [markers, mapLoaded, isMoving, onMarkerClick]);

    // Add route line between markers if directions and showRoute are enabled
    useEffect(() => {
      if (!mapInstanceRef.current || !directions || !showRoute || !markers || markers.length < 2 || isMoving) return;

      const map = mapInstanceRef.current;

      // Wait for map to be loaded
      if (!map.loaded()) return;

      try {
        // Remove existing route layers if they exist
        if (map.getLayer('route-glow')) map.removeLayer('route-glow');
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getSource('route')) map.removeSource('route');

        // Add route source and layers
        const routeCoordinates = markers.map(marker => [marker.position.lng, marker.position.lat]);

        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        });

        // Add glow effect layer
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#9b87f5',
            'line-width': 12,
            'line-opacity': 0.2,
            'line-blur': 8
          }
        });

        // Add main route layer
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#9b87f5',
            'line-width': 4,
            'line-opacity': 0.9,
            'line-dasharray': [0, 2, 1]
          }
        });
      } catch (error) {
        console.error('Error adding route:', error);
      }

      return () => {
        if (mapInstanceRef.current) {
          try {
            const map = mapInstanceRef.current;
            if (map.getLayer('route-glow')) map.removeLayer('route-glow');
            if (map.getLayer('route')) map.removeLayer('route');
            if (map.getSource('route')) map.removeSource('route');
          } catch (error) {
            console.error('Error cleaning up route:', error);
          }
        }
      };
    }, [directions, showRoute, markers, isMoving]);

    // Map style options
    const mapStyleOptions = [
      { name: 'Streets', value: MAP_STYLES.STREETS },
      { name: 'Satellite', value: MAP_STYLES.SATELLITE },
      { name: 'Dark', value: MAP_STYLES.DARK },
      { name: 'Light', value: MAP_STYLES.LIGHT }
    ];

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-lg shadow-xl ${className}`}
        {...props}
      >
        {/* Mapbox container */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{
            opacity: mapLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
        />

        {/* Custom attribution */}
        {mapLoaded && (
          <div
            className="absolute bottom-2 left-2 text-xs text-white/70 bg-[#1A1F2C]/70 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10 z-10 hover:bg-[#1A1F2C]/90 hover:text-white transition-all duration-300"
          >
            © Mapbox © OpenStreetMap
          </div>
        )}

        {/* Map style selector - LARGE BUTTONS */}
        {mapLoaded && interactive && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border-2 border-green-500 shadow-xl">
              <div className="flex flex-col space-y-3">
                <div className="text-sm text-white text-center font-bold mb-1 border-b border-green-500 pb-2">MAP STYLE</div>
                {mapStyleOptions.map((style) => (
                  <button
                    key={style.value}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center ${
                      currentMapStyle === style.value
                        ? 'bg-green-500 text-white font-bold shadow-lg'
                        : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                    }`}
                    onClick={() => {
                      setCurrentMapStyle(style.value);
                      if (onStyleChange) onStyleChange(style.value);
                    }}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interactive floating controls */}
        {mapLoaded && interactive && (
          <div className="absolute bottom-20 right-4 flex flex-col space-y-3">
            {/* Center map button */}
            <button
              className="w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo({
                    center: [center.lng, center.lat],
                    zoom: zoom,
                    essential: true,
                    duration: 1500
                  });
                }
              }}
            >
              <MapIcon size={22} />
            </button>

            {/* Traffic toggle button */}
            <button
              className={`w-12 h-12 rounded-full ${trafficVisible ? 'bg-green-500' : 'bg-gray-500'} text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200`}
              onClick={() => {
                const newValue = !trafficVisible;
                setTrafficVisible(newValue);
                if (onTrafficToggle) onTrafficToggle(newValue);
              }}
            >
              <Car size={20} />
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-[#151822] flex items-center justify-center z-20">
            <div className="w-12 h-12 border-4 border-[#9b87f5] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }
);

Map.displayName = 'Map';

export default Map;
