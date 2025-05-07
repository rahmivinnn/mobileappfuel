import React, { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/styles/map-popup.css'; // Import custom popup styles
import { MAPBOX_TOKEN, MAP_STYLES } from '@/config/mapbox';
import { toast } from '@/hooks/use-toast';
import FuelAgentIcon from './FuelAgentIcon';
import GasStationIcon from './GasStationIcon';
import EVChargingIcon from './EVChargingIcon';

// Set Mapbox token
mapboxgl.accessToken = MAPBOX_TOKEN;

// Define icon types
export enum IconType {
  FUEL_AGENT = 'fuel-agent',
  GAS_STATION = 'gas-station',
  EV_CHARGING = 'ev-charging',
  CAR_REPAIR = 'car-repair',
  COFFEE_SHOP = 'coffee-shop'
}

// Define marker data structure
export interface MarkerData {
  id: string;
  type: IconType;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  properties?: Record<string, any>;
}

// Define map props
interface EnhancedMapProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerData[];
  interactive?: boolean;
  showTraffic?: boolean;
  mapStyle?: string;
  onStyleChange?: (style: string) => void;
  onMarkerClick?: (marker: MarkerData) => void;
  initialPitch?: number;
  initialBearing?: number;
  enable3DBuildings?: boolean;
  enableClustering?: boolean;
}

const EnhancedMap: React.FC<EnhancedMapProps> = ({
  className,
  center = { lat: 34.0522, lng: -118.2437 }, // Los Angeles as default
  zoom = 13,
  markers = [],
  interactive = true,
  showTraffic = false,
  mapStyle = MAP_STYLES.STREETS,
  onStyleChange,
  onMarkerClick,
  initialPitch = 0,
  initialBearing = 0,
  enable3DBuildings = true,
  enableClustering = true,
  ...props
}) => {
  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState(mapStyle);
  const [is3DEnabled, setIs3DEnabled] = useState(enable3DBuildings);

  // Create SVG icons as data URLs
  const createSVGDataURL = (component: React.ReactElement) => {
    const svgString = ReactDOMServer.renderToString(component);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  };

  // Generate icon URLs using SVG components
  const iconUrls = {
    [IconType.FUEL_AGENT]: createSVGDataURL(<FuelAgentIcon size={48} />),
    [IconType.GAS_STATION]: createSVGDataURL(<GasStationIcon size={48} />),
    [IconType.EV_CHARGING]: createSVGDataURL(<EVChargingIcon size={48} />),
    [IconType.CAR_REPAIR]: '/lovable-uploads/c123a960-63f7-48ab-b0a0-6f29584106f7.png', // Existing icon
    [IconType.COFFEE_SHOP]: '/lovable-uploads/ba008608-8960-40b9-8a96-e5b173a48e08.png' // Existing icon
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    console.log("Initializing enhanced map with style:", currentMapStyle);

    // Create map instance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: currentMapStyle,
      center: [center.lng, center.lat],
      zoom: zoom,
      attributionControl: false,
      interactive: interactive,
      pitch: is3DEnabled ? initialPitch : 0,
      bearing: initialBearing,
    });

    // Store map instance in ref
    mapInstanceRef.current = map;

    // Map load event
    map.on('load', () => {
      console.log("Map loaded");
      setMapLoaded(true);

      // Add 3D buildings if enabled
      if (is3DEnabled) {
        add3DBuildings(map);
      }

      // Add traffic layer if needed
      if (showTraffic) {
        addTrafficLayer(map);
      }
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add 3D buildings layer
  const add3DBuildings = (map: mapboxgl.Map) => {
    if (!map.getLayer('3d-buildings')) {
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 12,
        'paint': {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'height'],
            0, '#6A98F0',
            20, '#5D9DF0',
            40, '#4FB8F5',
            60, '#45D0B0',
            80, '#38E08D',
            100, '#A2E638',
            120, '#F0DE59',
            150, '#F5A742',
            180, '#F56C42',
            200, '#F54242'
          ],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8
        }
      });
    }
  };

  // Add traffic layer
  const addTrafficLayer = (map: mapboxgl.Map) => {
    try {
      if (!map.getSource('traffic')) {
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
      }
    } catch (error) {
      console.error("Error adding traffic layer:", error);
    }
  };

  // Update map style when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || currentMapStyle === mapStyle) return;

    setCurrentMapStyle(mapStyle);

    const map = mapInstanceRef.current;
    map.setStyle(mapStyle);

    // Re-add 3D buildings after style change if enabled
    map.once('style.load', () => {
      if (is3DEnabled) {
        add3DBuildings(map);
      }

      if (showTraffic) {
        addTrafficLayer(map);
      }
    });

    if (onStyleChange) onStyleChange(mapStyle);
  }, [mapStyle, mapLoaded]);

  // Add markers as symbol layers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || markers.length === 0) return;

    const map = mapInstanceRef.current;

    // Create GeoJSON data for each marker type
    const markersByType = markers.reduce((acc, marker) => {
      if (!acc[marker.type]) {
        acc[marker.type] = {
          type: 'FeatureCollection',
          features: []
        };
      }

      acc[marker.type].features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.position.lng, marker.position.lat]
        },
        properties: {
          id: marker.id,
          title: marker.title,
          description: marker.description || '',
          ...marker.properties
        }
      });

      return acc;
    }, {} as Record<string, GeoJSON.FeatureCollection>);

    // Add each marker type as a separate source and layer
    Object.entries(markersByType).forEach(([type, geojson]) => {
      const sourceId = `source-${type}`;
      const layerId = `layer-${type}`;
      const clusterId = `cluster-${type}`;
      const clusterCountId = `cluster-count-${type}`;

      // Remove existing layers and sources if they exist
      if (map.getLayer(clusterCountId)) map.removeLayer(clusterCountId);
      if (map.getLayer(clusterId)) map.removeLayer(clusterId);
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      // Add source
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
        cluster: enableClustering && geojson.features.length > 100,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add clustering layers if enabled and needed
      if (enableClustering && geojson.features.length > 100) {
        // Add clusters
        map.addLayer({
          id: clusterId,
          type: 'circle',
          source: sourceId,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              10, '#f1f075',
              30, '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10, 30,
              30, 40
            ]
          }
        });

        // Add cluster count
        map.addLayer({
          id: clusterCountId,
          type: 'symbol',
          source: sourceId,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });
      }

      // Add symbol layer for individual markers with enhanced interactivity
      map.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceId,
        filter: enableClustering && geojson.features.length > 100 ? ['!', ['has', 'point_count']] : ['all'],
        layout: {
          'icon-image': type,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 15, 0.75, 20, 1],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-padding': 0,
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 12, 20, 14],
          'text-optional': true,
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 1.5,
          'text-justify': 'auto',
          'icon-pitch-alignment': 'auto',
          'icon-rotation-alignment': 'auto'
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0, 11, 1],
          'icon-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1]
        }
      });
    });

    // Load images for each icon type
    Object.entries(iconUrls).forEach(([type, url]) => {
      if (!map.hasImage(type)) {
        map.loadImage(url, (error, image) => {
          if (error) {
            console.error(`Error loading image for ${type}:`, error);
            return;
          }

          if (image && !map.hasImage(type)) {
            map.addImage(type, image);
          }
        });
      }
    });

    // Add click event for markers
    if (onMarkerClick) {
      Object.keys(markersByType).forEach(type => {
        const layerId = `layer-${type}`;

        map.on('click', layerId, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;

            if (props) {
              const marker = markers.find(m => m.id === props.id);
              if (marker) {
                // Show popup
                if (popupRef.current) popupRef.current.remove();

                // Create enhanced interactive popup
                popupRef.current = new mapboxgl.Popup({
                  closeButton: true,
                  closeOnClick: false,
                  maxWidth: '300px',
                  className: 'enhanced-map-popup'
                })
                  .setLngLat(e.lngLat)
                  .setHTML(`
                    <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
                      <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <div style="width: 24px; height: 24px; margin-right: 8px; display: flex; align-items: center; justify-content: center; background-color: ${
                          type === IconType.FUEL_AGENT ? '#22c55e' :
                          type === IconType.GAS_STATION ? '#ef4444' :
                          type === IconType.EV_CHARGING ? '#3b82f6' :
                          '#6b7280'
                        }; border-radius: 50%;">
                          ${
                            type === IconType.FUEL_AGENT ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a5 5 0 0 1 5-5zm0 13c5.52 0 10 2.24 10 5v2H2v-2c0-2.76 4.48-5 10-5z"/></svg>' :
                            type === IconType.GAS_STATION ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>' :
                            type === IconType.EV_CHARGING ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M14.69 10H10l-.61 2h3.3l-.3 1h-3.3l-.61 2h4.61L12.48 17h2l2.52-7h-2.31z"/><path d="M7 7H3.69L3 9h4l-.31 1H3l-.69 2h4l-.31 1H3l-.69 2h4.69L6.48 17h2l.52-2h4l.52 2h2l-.48-2h1.17L17 13h-4.31L13 12h4l.69-2H14l.31-1H18l.69-2H15.3L16 5h-2l-.31 2H9.69z"/></svg>' :
                            '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
                          }
                        </div>
                        <h3 style="margin: 0; font-weight: bold; font-size: 16px;">${props.title}</h3>
                      </div>

                      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">${props.description || 'No description available'}</p>

                      ${Object.entries(props)
                        .filter(([key]) => !['id', 'title', 'description'].includes(key))
                        .map(([key, value]) => {
                          // Format the key for display
                          const formattedKey = key.replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase());

                          // Format the value based on its type
                          let formattedValue = value;
                          if (Array.isArray(value)) {
                            formattedValue = value.join(', ');
                          } else if (typeof value === 'boolean') {
                            formattedValue = value ? '✓' : '✗';
                          }

                          return `<div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 13px;">
                            <span style="color: #6b7280; font-weight: 500;">${formattedKey}:</span>
                            <span style="color: #111827;">${formattedValue}</span>
                          </div>`;
                        }).join('')
                      }

                      <div style="margin-top: 12px; display: flex; justify-content: space-between;">
                        <button onclick="window.mapMarkerAction('directions', '${props.id}')"
                          style="background-color: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer;">
                          Directions
                        </button>
                        <button onclick="window.mapMarkerAction('details', '${props.id}')"
                          style="background-color: #22c55e; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer;">
                          Details
                        </button>
                      </div>
                    </div>
                  `)
                  .addTo(map);

                // Add marker action handler to window
                window.mapMarkerAction = (action, id) => {
                  if (action === 'directions') {
                    // Open directions in Google Maps
                    const position = marker.position;
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`, '_blank');
                  } else if (action === 'details') {
                    // Close popup and call marker click handler
                    if (popupRef.current) popupRef.current.remove();
                    onMarkerClick(marker);
                  }
                };

                // Call marker click handler
                onMarkerClick(marker);
              }
            }
          }
        });

        // Change cursor to pointer when hovering over markers
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      });
    }
  }, [markers, mapLoaded, onMarkerClick]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-xl ${className}`}
      {...props}
    >
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          opacity: mapLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-out'
        }}
      />
    </div>
  );
};

export default EnhancedMap;
