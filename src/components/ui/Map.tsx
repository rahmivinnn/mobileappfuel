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
    poiType?: string; // Added for different types of POIs
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

    // Gas station icon URL - using the Shell Beverly Hills style icon
    const gasStationIconUrl = "/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png";

    // Initialize map
    useEffect(() => {
      if (!mapContainerRef.current) return;

      console.log("Initializing map with style:", currentMapStyle);
      console.log("3D buildings enabled:", is3DEnabled);

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
        console.log("Map loaded successfully with style:", map.getStyle().name);
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
            console.log("Adding traffic layer");
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
            console.log("Traffic layer added successfully");
          } catch (error) {
            console.error("Error adding traffic layer:", error);
          }
        }

        // Add 3D buildings for more immersive view if enabled
        if (is3DEnabled) {
          console.log("Adding 3D buildings on initial load");
          // Add with slight delay to ensure style is fully loaded
          setTimeout(() => {
            add3DBuildings(map);

            // Try again after a longer delay if needed
            setTimeout(() => {
              if (!map.getLayer('3d-buildings')) {
                console.log("Retry adding 3D buildings on initial load");
                add3DBuildings(map);
              }
            }, 1000);
          }, 500);
        }

        // Rotate map slowly for visual effect if interactive and with initial bearing
        if (interactive && initialBearing !== 0) {
          setTimeout(() => {
            console.log("Rotating map to initial bearing:", initialBearing);
            map.easeTo({
              bearing: initialBearing,
              duration: 6000,
              pitch: is3DEnabled ? initialPitch : 0,
              essential: true
            });
          }, 1000);
        }
      });

      // Add style change event listener
      map.on('style.load', () => {
        console.log("Style loaded event triggered");

        // Re-add 3D buildings if enabled after style change
        if (is3DEnabled) {
          console.log("Re-adding 3D buildings after style change event");
          setTimeout(() => {
            add3DBuildings(map);
          }, 500);
        }
      });

      // Clean up on unmount
      return () => {
        console.log("Cleaning up map");
        map.remove();
        mapInstanceRef.current = null;
      };
    }, []);

    // Helper function to add 3D building layers
    const add3DBuildings = (map: mapboxgl.Map) => {
      try {
        console.log("Adding 3D buildings...");

        // Remove existing 3D buildings layer if it exists
        if (map.getLayer('3d-buildings')) {
          console.log("Removing existing 3D buildings layer");
          map.removeLayer('3d-buildings');
        }

        // Check if the map style is loaded
        if (!map.isStyleLoaded()) {
          console.log("Map style not fully loaded, waiting...");
          map.once('style.load', () => {
            console.log("Style loaded, trying to add 3D buildings again");
            setTimeout(() => add3DBuildings(map), 500);
          });
          return;
        }

        // Check if the composite source exists
        if (!map.getSource('composite')) {
          console.log("Composite source not available, trying alternative approach");

          // Try to add a custom 3D buildings layer for satellite and dark modes
          try {
            // Add a custom 3D buildings source if needed
            if (!map.getSource('custom-buildings')) {
              map.addSource('custom-buildings', {
                'type': 'vector',
                'url': 'mapbox://mapbox.mapbox-streets-v8'
              });
            }

            // Add the 3D buildings layer with the custom source and colorful buildings
            map.addLayer({
              'id': '3d-buildings',
              'source': 'custom-buildings',
              'source-layer': 'building',
              'type': 'fill-extrusion',
              'minzoom': 12, // Lower minzoom to see buildings from further away
              'paint': {
                // Colorful gradient based on building height
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'height'],
                  0, '#6A98F0',   // Blue for shorter buildings
                  20, '#5D9DF0',
                  40, '#4FB8F5',  // Light blue
                  60, '#45D0B0',  // Teal
                  80, '#38E08D',  // Green
                  100, '#A2E638', // Lime
                  120, '#F0DE59', // Yellow
                  150, '#F5A742', // Orange
                  180, '#F56C42', // Red-orange
                  200, '#F54242'  // Red for taller buildings
                ],
                // Random color variation to make buildings more distinct
                'fill-extrusion-color-transition': {
                  'duration': 0,
                  'delay': 0
                },
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.9,
                'fill-extrusion-vertical-gradient': true
              }
            });

            console.log("Added 3D buildings with custom source");
          } catch (customError) {
            console.error("Error adding custom 3D buildings:", customError);

            // Wait and try again with the standard approach
            setTimeout(() => {
              try {
                if (map.getSource('composite')) {
                  add3DBuildings(map);
                }
              } catch (retryError) {
                console.error("Retry failed:", retryError);
              }
            }, 1000);
          }
          return;
        }

        // Add enhanced 3D buildings layer with the composite source and vibrant colors
        console.log("Adding colorful 3D buildings with composite source");
        map.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 12, // Lower minzoom to see buildings from further away
          'paint': {
            // Vibrant color palette based on building height
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0, '#6A98F0',   // Blue for shorter buildings
              20, '#5D9DF0',
              40, '#4FB8F5',  // Light blue
              60, '#45D0B0',  // Teal
              80, '#38E08D',  // Green
              100, '#A2E638', // Lime
              120, '#F0DE59', // Yellow
              150, '#F5A742', // Orange
              180, '#F56C42', // Red-orange
              200, '#F54242'  // Red for taller buildings
            ],
            // Add some randomness to building colors for more visual interest
            'fill-extrusion-color-transition': {
              'duration': 0,
              'delay': 0
            },
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.9,
            'fill-extrusion-vertical-gradient': true
          }
        });

        // Add enhanced dynamic light effect for 3D buildings
        map.setLight({
          anchor: 'viewport',
          color: 'white',
          intensity: 0.75, // Higher intensity for better visibility
          position: [1.5, 0.5, 0.7] // Adjusted light position for better shadows and highlights
        });

        // Add ambient light to prevent buildings from being too dark
        map.setFog({
          'color': 'rgba(255, 255, 255, 0.8)', // Light fog color
          'high-color': 'rgba(135, 206, 250, 0.5)', // Sky blue tint
          'horizon-blend': 0.1, // Minimal horizon blend
          'space-color': 'rgba(135, 206, 250, 0.2)', // Light blue space color
          'star-intensity': 0.15 // Subtle stars
        });

        console.log("3D buildings added successfully");
      } catch (error) {
        console.error("Error adding 3D buildings:", error);
      }
    };

    // Toggle 3D buildings function with enhanced animation
    const toggle3DBuildings = () => {
      if (!mapInstanceRef.current || !mapInstanceRef.current.loaded()) return;

      const map = mapInstanceRef.current;
      const newIs3DEnabled = !is3DEnabled;

      console.log("Toggling 3D buildings:", newIs3DEnabled ? "ON" : "OFF");
      setIs3DEnabled(newIs3DEnabled);

      if (newIs3DEnabled) {
        // Enable 3D buildings with enhanced animation
        console.log("Enabling 3D buildings, adjusting camera...");
        map.easeTo({
          pitch: 60,
          duration: 1500,
          bearing: mapRotation + 15, // Slight rotation for better 3D effect
          easing: (t) => {
            return t * (2 - t); // Ease out quadratic for smoother animation
          }
        });

        // Add 3D buildings with slight delay to ensure style is loaded
        console.log("Adding 3D buildings after delay...");
        setTimeout(() => {
          add3DBuildings(map);

          // Add another attempt after a longer delay if needed
          setTimeout(() => {
            if (!map.getLayer('3d-buildings')) {
              console.log("Retry adding 3D buildings...");
              add3DBuildings(map);
            }
          }, 1000);
        }, 300);

        toast({
          title: "3D Buildings Enabled",
          description: "Showing buildings in 3D view",
          duration: 2000
        });
      } else {
        // Disable 3D buildings with smooth transition
        console.log("Disabling 3D buildings...");
        try {
          if (map.getLayer('3d-buildings')) {
            console.log("Removing 3D buildings layer");
            map.removeLayer('3d-buildings');
          }
        } catch (error) {
          console.error("Error removing 3D buildings layer:", error);
        }

        console.log("Adjusting camera for 2D view");
        map.easeTo({
          pitch: 0,
          duration: 1500,
          easing: (t) => {
            return t * (2 - t); // Ease out quadratic
          }
        });

        toast({
          title: "3D Buildings Disabled",
          description: "Switched to 2D map view",
          duration: 2000
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
          // Always update the style when currentMapStyle changes
          // Store current pitch and bearing before style change
          const currentPitch = mapInstanceRef.current.getPitch();
          const currentBearing = mapInstanceRef.current.getBearing();

          console.log("Changing map style to:", currentMapStyle);

          // Set new style
          mapInstanceRef.current.setStyle(currentMapStyle);

          // Re-add 3D buildings and restore camera after style change
          mapInstanceRef.current.once('style.load', () => {
            console.log("Style loaded, restoring camera and 3D buildings");

            // Restore pitch and bearing
            mapInstanceRef.current!.setPitch(currentPitch);
            mapInstanceRef.current!.setBearing(currentBearing);

            // Re-add 3D buildings if enabled
            if (is3DEnabled) {
              console.log("Re-adding 3D buildings after style change");
              setTimeout(() => {
                add3DBuildings(mapInstanceRef.current!);
              }, 500); // Add a delay to ensure style is fully loaded
            }

            // Show toast notification for style change
            toast({
              title: "Map Style Changed",
              description: currentMapStyle.includes('satellite') ?
                "Switched to satellite view" :
                (currentMapStyle.includes('dark') ? "Switched to dark mode" : "Switched to streets view"),
              duration: 2000
            });
          });

          if (onStyleChange) onStyleChange(currentMapStyle);
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

        // Enhanced hover effects for markers
        el.onmouseenter = () => {
          // Different hover effects for different marker types
          if (marker.isAgent) {
            el.style.transform = 'scale(1.1)';
          } else {
            // Gas station gets a more dynamic hover effect
            el.style.transform = 'scale(1.15) translateY(-5px)';
            el.style.filter = 'drop-shadow(0 6px 8px rgba(0,0,0,0.3))';
          }

          el.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          el.style.zIndex = '999';

          // Show info popup with enhanced content
          if (marker.title) {
            // Different popup content for different marker types
            const content = marker.isAgent
              ? "FuelFriendly Agent: Ready to deliver fuel to your location"
              : `${marker.title}: Tap to see fuel prices and station details`;

            setPopupInfo({
              position: [marker.position.lng, marker.position.lat],
              title: marker.isAgent ? marker.title : "Gas Station",
              content: content
            });
            setShowPopup(true);
          }
        };

        el.onmouseleave = () => {
          el.style.transform = 'scale(1) translateY(0)';
          el.style.filter = '';
          el.style.zIndex = '';
          setShowPopup(false);
        };

        // Create marker HTML with enhanced SVG icons
        if (marker.isAgent) {
          // Enhanced FuelFriendly Agent marker with SVG
          el.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              position: relative;
              transform: translateY(-20px);
              transition: all 0.3s ease;
            ">
              <div style="
                width: 40px;
                height: 40px;
                position: relative;
                filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
                transform-origin: bottom center;
                animation: agent-appear 0.5s ease-out;
              ">
                <!-- SVG Agent Icon -->
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background circle -->
                  <circle cx="12" cy="12" r="11" fill="#3B82F6" stroke="#1E40AF" stroke-width="1"/>

                  <!-- Person icon -->
                  <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="white"/>
                  <path d="M17 18C17 14.6863 14.7614 13 12 13C9.23858 13 7 14.6863 7 18" stroke="white" stroke-width="2" stroke-linecap="round"/>

                  <!-- Fuel can -->
                  <path d="M16 10.5V14.5C16 15.0523 16.4477 15.5 17 15.5H18C18.5523 15.5 19 15.0523 19 14.5V10.5C19 9.94772 18.5523 9.5 18 9.5H17C16.4477 9.5 16 9.94772 16 10.5Z" fill="#FF6B35" stroke="white" stroke-width="0.5"/>
                  <path d="M16.5 11.5H18.5" stroke="white" stroke-width="0.5"/>
                  <path d="M16.5 13.5H18.5" stroke="white" stroke-width="0.5"/>

                  <!-- Glow effect -->
                  <circle cx="12" cy="12" r="10" stroke="white" stroke-width="0.5" stroke-dasharray="1 2" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>

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
                  animation: fade-in 0.3s ease-out;
                ">${marker.label}</div>` :
                ''
              }
            </div>
          `;

          // Add keyframes for agent animations if not already added
          if (!document.querySelector('#agent-animations')) {
            const style = document.createElement('style');
            style.id = 'agent-animations';
            style.innerHTML = `
              @keyframes agent-appear {
                0% { transform: translateY(-10px) scale(0.8); opacity: 0; }
                50% { transform: translateY(5px) scale(1.1); }
                75% { transform: translateY(-3px) scale(0.95); }
                100% { transform: translateY(0) scale(1); opacity: 1; }
              }
            `;
            document.head.appendChild(style);
          }
        } else if (marker.poiType) {
          // Different POI types with custom SVG icons
          let poiSvg = '';
          let poiColor = '#4CAF50'; // Default color

          // Choose SVG based on POI type
          switch(marker.poiType) {
            case 'restaurant':
              poiColor = '#FF9800'; // Orange
              poiSvg = `
                <!-- Restaurant icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <path d="M7 7V17M7 9H10M7 12H10M10 9V12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M13 7C13 7 13 9 15 9C17 9 17 7 17 7V17M13 7V17M17 7V17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              `;
              break;
            case 'shop':
              poiColor = '#9C27B0'; // Purple
              poiSvg = `
                <!-- Shop icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <path d="M6 9H18L17 17H7L6 9Z" fill="${poiColor}" stroke="white" stroke-width="1.5"/>
                <path d="M9 9V7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7V9" stroke="white" stroke-width="1.5"/>
                <path d="M9 13H15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              `;
              break;
            case 'parking':
              poiColor = '#2196F3'; // Blue
              poiSvg = `
                <!-- Parking icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <path d="M10 6H14C16.2091 6 18 7.79086 18 10C18 12.2091 16.2091 14 14 14H10V6Z" fill="${poiColor}" stroke="white" stroke-width="1.5"/>
                <path d="M10 10H14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M10 6V18" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              `;
              break;
            case 'atm':
              poiColor = '#4CAF50'; // Green
              poiSvg = `
                <!-- ATM icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <rect x="7" y="7" width="10" height="10" rx="1" fill="${poiColor}" stroke="white" stroke-width="1.5"/>
                <path d="M12 9V15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M9 12H15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              `;
              break;
            case 'carwash':
              poiColor = '#03A9F4'; // Light Blue
              poiSvg = `
                <!-- Car Wash icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <path d="M6 10L7 7H17L18 10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M6 10H18V13H6V10Z" fill="${poiColor}" stroke="white" stroke-width="1.5"/>
                <circle cx="8.5" cy="14.5" r="1.5" fill="${poiColor}" stroke="white"/>
                <circle cx="15.5" cy="14.5" r="1.5" fill="${poiColor}" stroke="white"/>
                <path d="M7 6C7 6 9 4 12 4C15 4 17 6 17 6" stroke="white" stroke-width="1" stroke-linecap="round" stroke-dasharray="1 1"/>
              `;
              break;
            case 'hotel':
              poiColor = '#E91E63'; // Pink
              poiSvg = `
                <!-- Hotel icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <rect x="6" y="8" width="12" height="10" rx="1" fill="${poiColor}" stroke="white" stroke-width="1.5"/>
                <rect x="9" y="11" width="6" height="4" rx="1" fill="white"/>
                <path d="M6 8V6H18V8" stroke="white" stroke-width="1.5"/>
              `;
              break;
            case 'hospital':
              poiColor = '#F44336'; // Red
              poiSvg = `
                <!-- Hospital icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <rect x="7" y="7" width="10" height="10" rx="1" fill="${poiColor}" stroke="white" stroke-width="1.5"/>
                <path d="M12 7V17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M7 12H17" stroke="white" stroke-width="2" stroke-linecap="round"/>
              `;
              break;
            case 'charging':
              poiColor = '#8BC34A'; // Light Green
              poiSvg = `
                <!-- EV Charging icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <path d="M12 5V12M12 12L9 9M12 12L15 9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="8" y="12" width="8" height="6" rx="1" fill="${poiColor}" stroke="white" stroke-width="1.5"/>
                <path d="M10 15H14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              `;
              break;
            default:
              poiSvg = `
                <!-- Default POI icon -->
                <circle cx="12" cy="12" r="11" fill="${poiColor}" stroke="#333" stroke-width="1"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
                <path d="M12 5V7M12 17V19M5 12H7M17 12H19" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              `;
          }

          // Create POI marker HTML
          el.innerHTML = `
            <div style="
              width: 36px;
              height: 36px;
              position: relative;
              transform: translateY(-18px);
              transition: all 0.3s ease;
            ">
              <div style="
                width: 36px;
                height: 36px;
                position: relative;
                filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
                transform-origin: bottom center;
                animation: poi-appear 0.5s ease-out;
              ">
                <!-- SVG POI Icon -->
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  ${poiSvg}
                </svg>
              </div>

              ${marker.label ?
                `<div style="
                  position: absolute;
                  white-space: nowrap;
                  bottom: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: ${poiColor};
                  color: white;
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-size: 10px;
                  font-weight: bold;
                  font-family: Arial, sans-serif;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  border: 1px solid rgba(255,255,255,0.3);
                  animation: fade-in 0.3s ease-out;
                ">${marker.label}</div>` :
                ''
              }
            </div>
          `;

          // Add keyframes for POI animations if not already added
          if (!document.querySelector('#poi-animations')) {
            const style = document.createElement('style');
            style.id = 'poi-animations';
            style.innerHTML = `
              @keyframes poi-appear {
                0% { transform: scale(0); opacity: 0; }
                60% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
              }
            `;
            document.head.appendChild(style);
          }
        } else {
          // Enhanced interactive gas station marker with Shell Beverly Hills style
          const markerImageUrl = gasStationIconUrl;

          el.innerHTML = `
            <div style="
              width: 44px;
              height: 44px;
              position: relative;
              transform: translateY(-22px);
              transition: all 0.3s ease;
            ">
              <div style="
                width: 44px;
                height: 44px;
                position: relative;
                filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
                transform-origin: bottom center;
                animation: marker-bounce 0.5s ease-out;
              ">
                <!-- Shell Beverly Hills Gas Station Image -->
                <img
                  src="${markerImageUrl}"
                  style="width: 44px; height: 44px; object-fit: contain;"
                  alt="Gas Station"
                  onerror="this.onerror=null; this.src='/lovable-uploads/8bb583f1-3cc3-48b8-9f8b-904bfcfe84ef.png';"
                />

                <!-- Glow effect for interactivity -->
                <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: rgba(255, 215, 0, 0.15);
                  animation: pulse-station 2s ease-out infinite;
                  z-index: -1;
                "></div>
              </div>

              ${marker.label ?
                `<div style="
                  position: absolute;
                  white-space: nowrap;
                  bottom: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(255, 107, 53, 0.9);
                  color: white;
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-size: 10px;
                  font-weight: bold;
                  font-family: Arial, sans-serif;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  border: 1px solid rgba(255,255,255,0.3);
                  animation: fade-in 0.3s ease-out;
                ">${marker.label}</div>` :
                ''
              }
            </div>
          `;

          // Add keyframes for marker animations if not already added
          if (!document.querySelector('#marker-animations')) {
            const style = document.createElement('style');
            style.id = 'marker-animations';
            style.innerHTML = `
              @keyframes marker-bounce {
                0% { transform: translateY(-10px) scale(0.8); opacity: 0; }
                50% { transform: translateY(5px) scale(1.1); }
                75% { transform: translateY(-3px) scale(0.95); }
                100% { transform: translateY(0) scale(1); opacity: 1; }
              }
              @keyframes fade-in {
                0% { opacity: 0; transform: translateY(5px) translateX(-50%); }
                100% { opacity: 1; transform: translateY(0) translateX(-50%); }
              }
              @keyframes pulse-station {
                0% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.2); opacity: 0.2; }
                100% { transform: scale(1.4); opacity: 0; }
              }
            `;
            document.head.appendChild(style);
          }
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

        {/* Enhanced info popup for markers */}
        {showPopup && popupInfo && mapLoaded && (
          <div
            className="absolute z-20 backdrop-blur-md text-white p-3 rounded-lg shadow-lg max-w-[250px]"
            style={{
              left: '50%',
              bottom: '100px',
              transform: 'translateX(-50%)',
              animation: 'popup-fade-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.9) 0%, rgba(0,0,0,0.85) 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
          >
            <div className="flex items-center">
              <div className="mr-2 bg-white/20 p-1 rounded-full">
                {popupInfo.title.includes("Gas Station") ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 22V7a2 2 0 012-2h12a2 2 0 012 2v15" fill="#FF6B35" stroke="white" strokeWidth="1.5"/>
                    <path d="M2 7h20" stroke="white" strokeWidth="1.5"/>
                    <path d="M3 5h18L19 2H5L3 5z" fill="#FF6B35" stroke="white" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="#3B82F6"/>
                    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <h3 className="font-bold text-sm">{popupInfo.title}</h3>
            </div>
            <p className="text-xs mt-2 leading-relaxed">{popupInfo.content}</p>
            <div className="absolute w-4 h-4 bg-gradient-to-br from-[#FF6B35] to-[rgba(0,0,0,0.85)] transform rotate-45 left-1/2 -ml-2 -bottom-2"></div>
          </div>
        )}

        {/* Add keyframes for popup animation if not already added */}
        {showPopup && !document.querySelector('#popup-animations') && (
          <style id="popup-animations">
            {`
              @keyframes popup-fade-in {
                0% { opacity: 0; transform: translateY(10px) translateX(-50%) scale(0.9); }
                100% { opacity: 1; transform: translateY(0) translateX(-50%) scale(1); }
              }
            `}
          </style>
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
