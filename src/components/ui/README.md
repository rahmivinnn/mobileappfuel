# Enhanced Map Component

This component provides an enhanced map experience with multiple custom icons and features.

## Features

- Multiple custom icon types (fuel agent, gas station, EV charging, car repair, coffee shop)
- Symbol layers for better performance with large numbers of markers
- Clustering support for large datasets
- Popup information on marker click
- 3D buildings support
- Traffic layer support
- Multiple map styles (streets, satellite, dark)
- Custom GeoJSON data support

## Usage

```tsx
import EnhancedMap, { MarkerData, IconType } from '@/components/ui/EnhancedMap';

// Define markers
const markers: MarkerData[] = [
  {
    id: 'fuel-agent-1',
    type: IconType.FUEL_AGENT,
    position: { lat: 34.0522, lng: -118.2437 },
    title: 'Fuel Agent 1',
    description: 'Mobile fuel delivery agent',
    properties: {
      agentId: 'A1001',
      rating: '4.8',
      available: true
    }
  },
  {
    id: 'gas-station-1',
    type: IconType.GAS_STATION,
    position: { lat: 34.0622, lng: -118.2537 },
    title: 'Shell Gas Station',
    description: 'Regular: $3.99, Premium: $4.29',
    properties: {
      brand: 'Shell',
      fuelTypes: ['Regular', 'Premium', 'Diesel'],
      isOpen: true
    }
  }
];

// Use the component
<EnhancedMap
  className="w-full h-full"
  zoom={12}
  center={{ lat: 34.0522, lng: -118.2437 }}
  markers={markers}
  onMarkerClick={handleMarkerClick}
  interactive={true}
  showTraffic={true}
  mapStyle={MAP_STYLES.STREETS}
  onStyleChange={handleStyleChange}
  enable3DBuildings={true}
  initialPitch={60}
  initialBearing={30}
  enableClustering={true}
/>
```

## Icon Types

The component supports the following icon types:

- `IconType.FUEL_AGENT`: Fuel delivery agents
- `IconType.GAS_STATION`: Gas stations
- `IconType.EV_CHARGING`: Electric vehicle charging stations
- `IconType.CAR_REPAIR`: Car repair centers
- `IconType.COFFEE_SHOP`: Coffee shops

## Custom Icons

To use custom icons, place the icon images in the `public/lovable-uploads/` directory with the following names:

- `fuel-agent.png`: Custom fuel agent icon
- `ev-charging.png`: Electric vehicle charging station icon
- `car-repair.png`: Car repair center icon
- `coffee-shop.png`: Coffee shop icon

The gas station icon is already available at `/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| center | `{ lat: number; lng: number }` | LA coordinates | Center of the map |
| zoom | `number` | 13 | Initial zoom level |
| markers | `MarkerData[]` | `[]` | Array of markers to display |
| interactive | `boolean` | `true` | Whether the map is interactive |
| showTraffic | `boolean` | `false` | Whether to show traffic layer |
| mapStyle | `string` | `MAP_STYLES.STREETS` | Map style to use |
| onStyleChange | `(style: string) => void` | - | Callback when map style changes |
| onMarkerClick | `(marker: MarkerData) => void` | - | Callback when marker is clicked |
| initialPitch | `number` | 0 | Initial pitch angle |
| initialBearing | `number` | 0 | Initial bearing angle |
| enable3DBuildings | `boolean` | `true` | Whether to enable 3D buildings |
| enableClustering | `boolean` | `true` | Whether to enable clustering |

## MarkerData Interface

```typescript
interface MarkerData {
  id: string;
  type: IconType;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  properties?: Record<string, any>;
}
```

## Utility Functions

The `mapUtils.ts` file provides utility functions for working with the enhanced map:

- `generateRandomCoordinates`: Generate random coordinates around a center point
- `markersToGeoJSON`: Convert marker data to GeoJSON
- `groupMarkersByType`: Group markers by type
- `generateSampleMarkers`: Generate sample markers of a specific type
- `generateAllSampleMarkers`: Generate all types of sample markers

## Example

See `src/pages/EnhancedMapDemo.tsx` for a complete example of how to use the enhanced map component.
