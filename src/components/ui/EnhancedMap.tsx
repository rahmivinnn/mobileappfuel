import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAP_STYLES } from '@/config/mapbox';
import { toast } from '@/hooks/use-toast';

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

  // Icon URLs
  const iconUrls = {
    [IconType.FUEL_AGENT]: '/lovable-uploads/fuel-agent.png',
    [IconType.GAS_STATION]: '/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png',
    [IconType.EV_CHARGING]: '/lovable-uploads/ev-charging.png',
    [IconType.CAR_REPAIR]: '/lovable-uploads/car-repair.png',
    [IconType.COFFEE_SHOP]: '/lovable-uploads/coffee-shop.png'
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
      
      // Add symbol layer for individual markers
      map.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceId,
        filter: enableClustering && geojson.features.length > 100 ? ['!', ['has', 'point_count']] : ['all'],
        layout: {
          'icon-image': type,
          'icon-size': 0.75,
          'icon-allow-overlap': true,
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-size': 12,
          'text-optional': true
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 1
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
                
                popupRef.current = new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(`
                    <div style="padding: 10px;">
                      <h3 style="margin: 0 0 5px 0; font-weight: bold;">${props.title}</h3>
                      <p style="margin: 0;">${props.description || 'No description available'}</p>
                    </div>
                  `)
                  .addTo(map);
                
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
