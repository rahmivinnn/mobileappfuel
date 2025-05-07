import { MarkerData, IconType } from '@/components/ui/EnhancedMap';

/**
 * Generate random coordinates around a center point
 * @param baseLat Base latitude
 * @param baseLng Base longitude
 * @param radiusInKm Radius in kilometers
 * @returns Random coordinates
 */
export const generateRandomCoordinates = (
  baseLat: number, 
  baseLng: number, 
  radiusInKm: number
): { lat: number; lng: number } => {
  const earthRadius = 6371; // Earth radius in kilometers
  const degreesToRadians = Math.PI / 180;
  const radiansToDegreesLat = 180 / Math.PI;
  const radiansToDegreesLng = 180 / Math.PI / Math.cos(baseLat * degreesToRadians);
  
  const randomDistance = Math.random() * radiusInKm;
  const randomAngle = Math.random() * 2 * Math.PI;
  
  const latOffset = randomDistance / earthRadius * radiansToDegreesLat;
  const lngOffset = randomDistance / earthRadius * radiansToDegreesLng;
  
  const lat = baseLat + latOffset * Math.sin(randomAngle);
  const lng = baseLng + lngOffset * Math.cos(randomAngle);
  
  return { lat, lng };
};

/**
 * Convert marker data to GeoJSON
 * @param markers Array of marker data
 * @returns GeoJSON feature collection
 */
export const markersToGeoJSON = (markers: MarkerData[]): GeoJSON.FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: markers.map(marker => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [marker.position.lng, marker.position.lat]
      },
      properties: {
        id: marker.id,
        type: marker.type,
        title: marker.title,
        description: marker.description || '',
        ...marker.properties
      }
    }))
  };
};

/**
 * Group markers by type
 * @param markers Array of marker data
 * @returns Object with markers grouped by type
 */
export const groupMarkersByType = (markers: MarkerData[]): Record<string, MarkerData[]> => {
  return markers.reduce((acc, marker) => {
    if (!acc[marker.type]) {
      acc[marker.type] = [];
    }
    
    acc[marker.type].push(marker);
    
    return acc;
  }, {} as Record<string, MarkerData[]>);
};

/**
 * Generate sample markers around a center point
 * @param center Center coordinates
 * @param count Number of markers to generate
 * @param type Icon type
 * @param radiusInKm Radius in kilometers
 * @returns Array of marker data
 */
export const generateSampleMarkers = (
  center: { lat: number; lng: number },
  count: number,
  type: IconType,
  radiusInKm: number = 10
): MarkerData[] => {
  const markers: MarkerData[] = [];
  
  for (let i = 0; i < count; i++) {
    const position = generateRandomCoordinates(center.lat, center.lng, radiusInKm);
    
    let title = '';
    let description = '';
    let properties = {};
    
    switch (type) {
      case IconType.FUEL_AGENT:
        title = `Fuel Agent ${i + 1}`;
        description = 'Mobile fuel delivery agent available 24/7';
        properties = {
          agentId: `A${1000 + i}`,
          rating: (4 + Math.random()).toFixed(1),
          available: Math.random() > 0.2
        };
        break;
        
      case IconType.GAS_STATION:
        const gasStationBrands = ['Shell', 'Chevron', 'Exxon', 'Mobil', 'BP', 'ARCO'];
        const brand = gasStationBrands[Math.floor(Math.random() * gasStationBrands.length)];
        title = `${brand} Gas Station`;
        description = `Regular: $${(3.5 + Math.random()).toFixed(2)}, Premium: $${(4.0 + Math.random()).toFixed(2)}`;
        properties = {
          brand,
          fuelTypes: ['Regular', 'Premium', 'Diesel'],
          isOpen: Math.random() > 0.1
        };
        break;
        
      case IconType.EV_CHARGING:
        const evProviders = ['Tesla', 'ChargePoint', 'Electrify America', 'EVgo'];
        const provider = evProviders[Math.floor(Math.random() * evProviders.length)];
        title = `${provider} Charging Station`;
        description = `${Math.floor(Math.random() * 8) + 2} charging ports available`;
        properties = {
          provider,
          kW: [50, 150, 350][Math.floor(Math.random() * 3)],
          availablePorts: Math.floor(Math.random() * 4)
        };
        break;
        
      case IconType.CAR_REPAIR:
        title = `Auto Repair Center ${i + 1}`;
        description = 'Full service auto repair and maintenance';
        properties = {
          services: ['Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Repair'],
          rating: (3.5 + Math.random() * 1.5).toFixed(1)
        };
        break;
        
      case IconType.COFFEE_SHOP:
        const coffeeShops = ['Starbucks', 'Peet\'s', 'Blue Bottle', 'Dunkin\'', 'Local Cafe'];
        const shop = coffeeShops[Math.floor(Math.random() * coffeeShops.length)];
        title = `${shop} Coffee`;
        description = 'Coffee and snacks while you wait';
        properties = {
          brand: shop,
          hasWifi: Math.random() > 0.2,
          hasDriveThru: Math.random() > 0.6
        };
        break;
    }
    
    markers.push({
      id: `${type}-${i}`,
      type,
      position,
      title,
      description,
      properties
    });
  }
  
  return markers;
};

/**
 * Generate all types of sample markers
 * @param center Center coordinates
 * @returns Array of marker data
 */
export const generateAllSampleMarkers = (center: { lat: number; lng: number }): MarkerData[] => {
  return [
    ...generateSampleMarkers(center, 10, IconType.FUEL_AGENT, 10),
    ...generateSampleMarkers(center, 30, IconType.GAS_STATION, 15),
    ...generateSampleMarkers(center, 15, IconType.EV_CHARGING, 12),
    ...generateSampleMarkers(center, 8, IconType.CAR_REPAIR, 8),
    ...generateSampleMarkers(center, 12, IconType.COFFEE_SHOP, 10)
  ];
};
