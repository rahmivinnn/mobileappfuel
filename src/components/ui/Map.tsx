
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAP_STYLES } from '@/config/mapbox';
import { Map as MapIcon, Layers, Car, Target, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Set Mapbox token
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
    label?: string;
    isAgent?: boolean;
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
      center = { lat: 3.1390, lng: 101.6869 },
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
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

    // State
    const [mapLoaded, setMapLoaded] = useState(false);
    const [currentMapStyle, setCurrentMapStyle] = useState(mapStyle);
    const [trafficVisible, setTrafficVisible] = useState(showTraffic);
    const [isMoving, setIsMoving] = useState(false);
    const [isLocatingUser, setIsLocatingUser] = useState(false);

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
        console.log("Map loaded successfully");
        setMapLoaded(true);

        // Add event listeners for map movement
        map.on('movestart', () => {
          setIsMoving(true);
        });

        map.on('moveend', () => {
          setIsMoving(false);
        });

        // Add traffic layer if needed
        if (showTraffic) {
          try {
            map.addSource('traffic', {
              type: 'vector',
              url: 'mapbox://mapbox.mapbox-traffic-v1'
            });
            
            map.addLayer({
              'id': 'traffic-data',
              'type': 'line',
              'source': 'traffic',
              'source-layer': 'traffic',
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-width': 2,
                'line-color': [
                  'match',
                  ['get', 'congestion'],
                  'low', '#00E676',
                  'moderate', '#FFAB00',
                  'heavy', '#FF5252',
                  'severe', '#D50000',
                  '#00E676' // default
                ]
              }
            });
          } catch (error) {
            console.error("Error adding traffic layer:", error);
          }
        }
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
        el.style.position = 'relative';
        el.style.width = '40px';
        el.style.height = '40px';
        
        // Make marker clickable if onMarkerClick is provided
        if (onMarkerClick) {
          el.style.cursor = 'pointer';
          el.onclick = () => onMarkerClick(index);
        }

        // Create marker HTML with label - different for gas stations and agents
        if (marker.isAgent) {
          // FuelFriendly Agent marker
          el.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
              <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 30px;
                height: 30px;
                background-color: #3B82F6;
                border-radius: 50% 50% 50% 0;
                transform: translateX(-50%) rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                animation: bounce 1s ease-in-out infinite alternate;
              ">
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: white;
                  border-radius: 50%;
                  transform: rotate(45deg);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
              ${marker.label ? 
                `<div style="
                  position: absolute;
                  white-space: nowrap;
                  bottom: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(59,130,246,0.8);
                  color: white;
                  padding: 2px 5px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-family: Arial, sans-serif;
                ">${marker.label}</div>` : 
                ''
              }
            </div>
          `;
        } else {
          // Regular gas station marker
          el.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
              <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 30px;
                height: 30px;
                background-color: #FF4136;
                border-radius: 50% 50% 50% 0;
                transform: translateX(-50%) rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                animation: bounce 1s ease-in-out infinite alternate;
              ">
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: white;
                  border-radius: 50%;
                  transform: rotate(45deg);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  ${marker.icon ? 
                    `<img src="${marker.icon}" style="width: 14px; height: 14px; border-radius: 50%;">` : 
                    `<div style="width: 10px; height: 10px; background: #FF4136; border-radius: 50%;"></div>`
                  }
                </div>
              </div>
              ${marker.label ? 
                `<div style="
                  position: absolute;
                  white-space: nowrap;
                  bottom: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(0,0,0,0.6);
                  color: white;
                  padding: 2px 5px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-family: Arial, sans-serif;
                ">${marker.label}</div>` : 
                ''
              }
            </div>
          `;
        }

        // Add keyframes for bounce animation
        if (!document.querySelector('#bounce-animation')) {
          const style = document.createElement('style');
          style.id = 'bounce-animation';
          style.innerHTML = `
            @keyframes bounce {
              0% { transform: translateX(-50%) rotate(-45deg) translateY(0); }
              100% { transform: translateX(-50%) rotate(-45deg) translateY(-5px); }
            }
          `;
          document.head.appendChild(style);
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

    // Function to locate user
    const locateUser = () => {
      if (!mapInstanceRef.current) return;

      setIsLocatingUser(true);
      toast({
        title: "Locating you...",
        description: "Please allow location access if prompted",
      });

      // Request location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const map = mapInstanceRef.current;

          if (map) {
            // Fly to user location
            map.flyTo({
              center: [longitude, latitude],
              zoom: 16,
              essential: true,
              duration: 2000
            });

            // Add or update user location marker
            if (userMarkerRef.current) {
              userMarkerRef.current.setLngLat([longitude, latitude]);
            } else {
              // Create user marker element
              const el = document.createElement('div');
              el.className = 'user-location-marker';
              el.innerHTML = `
                <div style="
                  width: 24px; 
                  height: 24px; 
                  background-color: #3498db; 
                  border: 3px solid white; 
                  border-radius: 50%; 
                  box-shadow: 0 0 0 2px rgba(0,0,0,0.1), 0 0 10px rgba(52,152,219,0.7);
                ">
                </div>
                <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 24px;
                  height: 24px;
                  background: rgba(52,152,219,0.3);
                  border-radius: 50%;
                  animation: pulse 2s ease-out infinite;
                  transform: scale(1);
                  opacity: 1;
                ">
                </div>
              `;
              
              // Add keyframes for pulse animation
              if (!document.querySelector('#pulse-animation')) {
                const style = document.createElement('style');
                style.id = 'pulse-animation';
                style.innerHTML = `
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(3); opacity: 0; }
                  }
                `;
                document.head.appendChild(style);
              }

              // Create and add marker
              userMarkerRef.current = new mapboxgl.Marker({
                element: el,
                anchor: 'center'
              })
                .setLngLat([longitude, latitude])
                .addTo(map);
            }

            toast({
              title: "Location found",
              description: "Map updated to your current location",
            });
          }
          setIsLocatingUser(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: error.message || "Unable to access your location",
            variant: "destructive"
          });
          setIsLocatingUser(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    };

    // Map style options
    const mapStyleOptions = [
      { name: 'Streets', value: MAP_STYLES.STREETS },
      { name: 'Satellite', value: MAP_STYLES.SATELLITE },
      { name: 'Dark', value: MAP_STYLES.DARK }
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
              className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200"
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
              <MapIcon size={18} />
            </button>

            {/* Locate me button */}
            <button
              className={`w-10 h-10 rounded-full ${isLocatingUser ? 'bg-blue-500 animate-pulse' : 'bg-white'} text-${isLocatingUser ? 'white' : 'blue-600'} flex items-center justify-center shadow-lg transition-all duration-200`}
              onClick={() => {
                // Locate user functionality would be here
                toast({
                  title: "Location updated",
                  description: "Map centered on your position"
                });
              }}
              disabled={isLocatingUser}
            >
              <Target size={18} />
            </button>

            {/* Zoom controls */}
            <div className="flex flex-col shadow-lg rounded-full overflow-hidden">
              <button
                className="w-10 h-10 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const currentZoom = mapInstanceRef.current.getZoom();
                    mapInstanceRef.current.zoomTo(currentZoom + 1);
                  }
                }}
              >
                +
              </button>
              <div className="w-10 h-px bg-gray-200" />
              <button
                className="w-10 h-10 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const currentZoom = mapInstanceRef.current.getZoom();
                    mapInstanceRef.current.zoomTo(currentZoom - 1);
                  }
                }}
              >
                −
              </button>
            </div>
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
