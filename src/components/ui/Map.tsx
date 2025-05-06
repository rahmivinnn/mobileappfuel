import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAP_STYLES } from '@/config/mapbox';
import { Map as MapIcon, Layers, Car, Target, User, Info, Locate } from 'lucide-react';
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
  initialPitch?: number;
  initialBearing?: number;
  enable3DBuildings?: boolean;
  hideStyleControls?: boolean; // Prop to hide style controls
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
      initialPitch = 30,
      initialBearing = 0,
      enable3DBuildings = true,
      hideStyleControls = false, // Default to showing controls
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
    const [showPopup, setShowPopup] = useState(false);
    const [popupInfo, setPopupInfo] = useState<{position: [number, number], title: string, content: string} | null>(null);
    const [mapRotation, setMapRotation] = useState(initialBearing);
    const [is3DEnabled, setIs3DEnabled] = useState(enable3DBuildings);

    // New gas station icon URL (uploaded image)
    const gasStationIconUrl = "/lovable-uploads/8bb583f1-3cc3-48b8-9f8b-904bfcfe84ef.png";

    // Initialize map
    useEffect(() => {
      if (!mapContainerRef.current) return;

      // Create map instance with enhanced options
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: currentMapStyle,
        center: [center.lng, center.lat],
        zoom: zoom,
        attributionControl: false,
        interactive: interactive,
        pitch: is3DEnabled ? initialPitch : 0, // Use initialPitch for 3D effect if enabled
        bearing: initialBearing, // Initial rotation based on prop
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
          setMapRotation(map.getBearing());
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
        
        // Add 3D buildings for more immersive view if enabled
        if (is3DEnabled) {
          add3DBuildings(map);
        }

        // Rotate map slowly for visual effect if interactive and with initial bearing
        if (interactive && initialBearing !== 0) {
          setTimeout(() => {
            map.easeTo({
              bearing: initialBearing,
              duration: 6000,
              pitch: is3DEnabled ? initialPitch : 0,
              essential: true
            });
          }, 1000);
        }
      });

      // Clean up on unmount
      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    }, []);

    // Helper function to add 3D building layers
    const add3DBuildings = (map: mapboxgl.Map) => {
      try {
        if (map.getLayer('3d-buildings')) {
          map.removeLayer('3d-buildings');
        }
          
        map.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 14,
          'paint': {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0, '#AAAAAA',
              50, '#888888',
              100, '#666666',
              200, '#444444'
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.7,
            'fill-extrusion-vertical-gradient': true
          }
        });

        // Add light effect for 3D buildings
        map.setLight({
          anchor: 'viewport',
          color: 'white',
          intensity: 0.4,
          position: [1, 0, 0.8]
        });
      } catch (error) {
        console.error("Error adding 3D buildings:", error);
      }
    };

    // Toggle 3D buildings function
    const toggle3DBuildings = () => {
      if (!mapInstanceRef.current || !mapInstanceRef.current.loaded()) return;
      
      const map = mapInstanceRef.current;
      const newIs3DEnabled = !is3DEnabled;
      setIs3DEnabled(newIs3DEnabled);
      
      if (newIs3DEnabled) {
        // Enable 3D buildings
        map.easeTo({
          pitch: 60,
          duration: 1000
        });
        add3DBuildings(map);
        
        toast({
          title: "3D Mode Enabled",
          description: "Showing buildings in 3D"
        });
      } else {
        // Disable 3D buildings
        if (map.getLayer('3d-buildings')) {
          map.removeLayer('3d-buildings');
        }
        
        map.easeTo({
          pitch: 0,
          duration: 1000
        });
        
        toast({
          title: "3D Mode Disabled",
          description: "Switched to 2D map view"
        });
      }
    };

    // Update map center and zoom when props change
    useEffect(() => {
      if (mapInstanceRef.current && mapInstanceRef.current.loaded()) {
        mapInstanceRef.current.flyTo({
          center: [center.lng, center.lat],
          zoom: zoom,
          essential: true,
          duration: 2000, // Extended duration for smoother transitions
          pitch: is3DEnabled ? 30 : 0, // Maintain consistent pitch based on 3D mode
        });
      }
    }, [center, zoom, is3DEnabled]);

    // Update map style when currentMapStyle changes
    useEffect(() => {
      if (mapInstanceRef.current && mapInstanceRef.current.loaded()) {
        try {
          const currentStyle = mapInstanceRef.current.getStyle();
          // Check if style needs to be updated
          if (currentStyle && currentMapStyle && currentStyle.sprite !== currentMapStyle) {
            mapInstanceRef.current.setStyle(currentMapStyle);
            
            // Re-add 3D buildings if enabled after style change
            if (is3DEnabled) {
              mapInstanceRef.current.once('style.load', () => {
                add3DBuildings(mapInstanceRef.current!);
              });
            }
            
            if (onStyleChange) onStyleChange(currentMapStyle);
          }
        } catch (error) {
          console.error('Error updating map style:', error);
        }
      }
    }, [currentMapStyle, onStyleChange, is3DEnabled]);

    // Add markers to map with enhanced animations and interactivity
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
          el.onclick = () => {
            // Show toast notification
            toast({
              title: marker.title || "Location selected",
              description: marker.isAgent ? "FuelFriendly Agent is ready to help you" : "Gas station selected",
              duration: 2000,
            });
            
            // Call the provided click handler
            onMarkerClick(index);
          };
        }

        // On hover effect for markers
        el.onmouseenter = () => {
          el.style.transform = 'scale(1.1)';
          el.style.transition = 'transform 0.3s ease';
          
          // Show info popup
          if (marker.title) {
            setPopupInfo({
              position: [marker.position.lng, marker.position.lat],
              title: marker.title,
              content: marker.isAgent ? "FuelFriendly Agent: Ready to deliver fuel to your location" : "Gas station: Tap to see details and prices"
            });
            setShowPopup(true);
          }
        };
        
        el.onmouseleave = () => {
          el.style.transform = 'scale(1)';
          setShowPopup(false);
        };

        // Create marker HTML with simpler icon-based approach
        if (marker.isAgent) {
          // FuelFriendly Agent marker as simple icon
          const agentIconUrl = "/lovable-uploads/1bc06a60-0463-4f47-abde-502bc408852e.png";
          el.innerHTML = `
            <div style="width: 32px; height: 32px; position: relative; transform: translateY(-16px);">
              <img 
                src="${agentIconUrl}" 
                style="width: 32px; height: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" 
                alt="Agent"
              />
              ${marker.label ? 
                `<div style="
                  position: absolute;
                  white-space: nowrap;
                  bottom: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(59,130,246,0.9);
                  color: white;
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-size: 10px;
                  font-weight: bold;
                  font-family: Arial, sans-serif;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  border: 1px solid rgba(255,255,255,0.3);
                ">${marker.label}</div>` : 
                ''
              }
            </div>
          `;
        } else {
          // Gas station marker with the new 3D gas station icon
          const markerImageUrl = marker.icon || gasStationIconUrl;
          
          el.innerHTML = `
            <div style="width: 36px; height: 36px; position: relative; transform: translateY(-18px);">
              <img 
                src="${markerImageUrl}" 
                style="width: 36px; height: 36px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" 
                alt="Gas Station"
                onerror="this.onerror=null; this.src='/lovable-uploads/8bb583f1-3cc3-48b8-9f8b-904bfcfe84ef.png';"
              />
              ${marker.label ? 
                `<div style="
                  position: absolute;
                  white-space: nowrap;
                  bottom: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(0,0,0,0.75);
                  color: white;
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-size: 10px;
                  font-weight: bold;
                  font-family: Arial, sans-serif;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  border: 1px solid rgba(255,255,255,0.2);
                ">${marker.label}</div>` : 
                ''
              }
            </div>
          `;
        }

        // Add tooltip
        if (marker.title) {
          el.title = marker.title;
        }

        // Create and add marker to map with animation
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

        // Add glow effect layer with animation
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
            'line-blur': 8,
            'line-dasharray': [2, 1]
          }
        });

        // Add animated main route layer
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

        // Animate line dash pattern for movement effect
        let dashOffset = 0;
        const animateDash = () => {
          dashOffset = (dashOffset + 1) % 100;
          map.setPaintProperty('route', 'line-dasharray', [0, dashOffset / 10, 1, 0]);
          requestAnimationFrame(animateDash);
        };

        animateDash();
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

    // Function to locate user with enhanced animation
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
            // Fly to user location with enhanced camera movement
            map.flyTo({
              center: [longitude, latitude],
              zoom: 16,
              pitch: 60, // Enhanced pitch for dramatic effect
              bearing: 0, // Reset bearing
              essential: true,
              duration: 2500,
              easing: (t) => {
                return t * (2 - t); // Ease out quadratic
              }
            });

            // Add or update user location marker
            if (userMarkerRef.current) {
              userMarkerRef.current.setLngLat([longitude, latitude]);
            } else {
              // Create user marker element with enhanced visuals
              const el = document.createElement('div');
              el.className = 'user-location-marker';
              el.innerHTML = `
                <div style="
                  position: relative;
                  width: 24px; 
                  height: 24px;
                ">
                  <div style="
                    width: 24px; 
                    height: 24px; 
                    background-color: #3498db; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 0 0 2px rgba(0,0,0,0.1), 0 0 10px rgba(52,152,219,0.7);
                    position: relative;
                    z-index: 2;
                  "></div>
                  <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(52,152,219,0.4);
                    animation: pulse-user 2s ease-out infinite;
                    z-index: 1;
                  "></div>
                  <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(52,152,219,0.2);
                    animation: pulse-user 2s ease-out 0.5s infinite;
                    z-index: 0;
                  "></div>
                </div>
              `;
              
              // Add keyframes for pulse animation
              if (!document.querySelector('#pulse-user-animation')) {
                const style = document.createElement('style');
                style.id = 'pulse-user-animation';
                style.innerHTML = `
                  @keyframes pulse-user {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(4); opacity: 0; }
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
              variant: "default",
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

    // Function to toggle map tilt/pitch
    const toggleTilt = () => {
      if (!mapInstanceRef.current) return;
      
      const currentPitch = mapInstanceRef.current.getPitch();
      const newPitch = currentPitch > 30 ? 0 : 60;
      
      mapInstanceRef.current.easeTo({
        pitch: newPitch,
        duration: 1000,
      });
      
      toast({
        title: newPitch > 0 ? "3D View Enabled" : "2D View Enabled",
        description: newPitch > 0 ? "Showing terrain and buildings in 3D" : "Switched to flat map view",
      });
    };

    // Function to rotate map
    const rotateMap = () => {
      if (!mapInstanceRef.current) return;
      
      const newRotation = (mapRotation + 45) % 360;
      
      mapInstanceRef.current.easeTo({
        bearing: newRotation,
        duration: 1000,
      });
      
      setMapRotation(newRotation);
    };

    // Map style options
    const mapStyleOptions = !hideStyleControls ? [
      { name: 'Streets', value: MAP_STYLES.STREETS },
      { name: 'Satellite', value: MAP_STYLES.SATELLITE },
      { name: 'Dark', value: MAP_STYLES.DARK }
    ] : [];

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

        {/* Info popup for markers */}
        {showPopup && popupInfo && mapLoaded && (
          <div 
            className="absolute z-20 bg-black/80 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-white/20 max-w-[200px]"
            style={{
              left: '50%',
              bottom: '100px',
              transform: 'translateX(-50%)',
              animation: 'fade-in 0.3s ease-out'
            }}
          >
            <h3 className="font-bold text-sm">{popupInfo.title}</h3>
            <p className="text-xs mt-1">{popupInfo.content}</p>
          </div>
        )}

        {/* Custom attribution */}
        {mapLoaded && (
          <div
            className="absolute bottom-2 left-2 text-xs text-white/70 bg-[#1A1F2C]/70 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10 z-10 hover:bg-[#1A1F2C]/90 hover:text-white transition-all duration-300"
          >
            © Mapbox © OpenStreetMap
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
                    pitch: is3DEnabled ? 30 : 0,
                    essential: true,
                    duration: 1500
                  });
                  
                  toast({
                    title: "Map reset",
                    description: "Returning to default view"
                  });
                }
              }}
            >
              <MapIcon size={18} />
            </button>

            {/* Locate me button */}
            <button
              className={`w-10 h-10 rounded-full ${isLocatingUser ? 'bg-blue-500 animate-pulse' : 'bg-white'} text-${isLocatingUser ? 'white' : 'blue-600'} flex items-center justify-center shadow-lg transition-all duration-200`}
              onClick={locateUser}
              disabled={isLocatingUser}
            >
              <Locate size={18} />
            </button>
            
            {/* Toggle 3D view button */}
            <button
              className={`w-10 h-10 rounded-full ${is3DEnabled ? 'bg-purple-600' : 'bg-purple-400'} text-white flex items-center justify-center shadow-lg hover:bg-purple-500 hover:scale-105 transition-all duration-200`}
              onClick={toggle3DBuildings}
              title={is3DEnabled ? "Disable 3D buildings" : "Enable 3D buildings"}
            >
              <Layers size={18} />
            </button>
            
            {/* Rotate map button */}
            <button
              className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg hover:bg-orange-400 hover:scale-105 transition-all duration-200"
              onClick={rotateMap}
              style={{ transform: `rotate(${mapRotation}deg)`, transition: 'transform 0.3s ease' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="flex flex-col shadow-lg rounded-full overflow-hidden">
              <button
                className="w-10 h-10 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const currentZoom = mapInstanceRef.current.getZoom();
                    mapInstanceRef.current.easeTo({
                      zoom: currentZoom + 1,
                      duration: 300
                    });
                  }
                }}
              >
                +
              </button>
              <div className="w-10 h-px bg-gray-200" />
              <button
                className="w-10 h-10 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const currentZoom = mapInstanceRef.current.getZoom();
                    mapInstanceRef.current.easeTo({
                      zoom: currentZoom - 1,
                      duration: 300
                    });
                  }
                }}
              >
                −
              </button>
            </div>
          </div>
        )}

        {/* Map style selector - Only show if hideStyleControls is false */}
        {mapLoaded && interactive && mapStyleOptions.length > 0 && !hideStyleControls && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
            <div className="flex flex-col">
              {mapStyleOptions.map((style) => (
                <button
                  key={style.value}
                  className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 transition-colors ${
                    currentMapStyle === style.value
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setCurrentMapStyle(style.value);
                    if (onStyleChange) onStyleChange(style.value);
                  }}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      currentMapStyle === style.value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                  <span>{style.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-[#151822] flex items-center justify-center z-20">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#9b87f5] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white text-sm">Loading interactive map...</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Map.displayName = 'Map';

export default Map;
