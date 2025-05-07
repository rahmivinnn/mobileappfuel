import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedMap, { MarkerData, IconType } from '@/components/ui/EnhancedMap';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { motion } from 'framer-motion';
import { MAP_STYLES } from '@/config/mapbox';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Layers, Box, Zap, Coffee, Tool, Fuel } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateAllSampleMarkers } from '@/utils/mapUtils';

// Los Angeles coordinates
const LA_COORDINATES = {
  lat: 34.0522,
  lng: -118.2437
};

const EnhancedMapDemo: React.FC = () => {
  const navigate = useNavigate();
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES.STREETS);
  const [enable3DBuildings, setEnable3DBuildings] = useState(true);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  // Generate sample markers
  useEffect(() => {
    // Use the utility function to generate all sample markers
    setMarkers(generateAllSampleMarkers(LA_COORDINATES));
  }, []);

  // Handle marker click
  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);

    toast({
      title: marker.title,
      description: marker.description || 'No description available',
      duration: 3000
    });
  };

  // Handle map style change
  const handleStyleChange = (style: string) => {
    setCurrentMapStyle(style);

    toast({
      title: "Map Style Changed",
      description: style.includes('satellite') ?
        "Switched to satellite view" :
        (style.includes('dark') ? "Switched to dark mode" : "Switched to streets view"),
      duration: 2000
    });
  };

  // Toggle 3D buildings
  const toggle3DBuildings = () => {
    setEnable3DBuildings(prev => !prev);

    toast({
      title: !enable3DBuildings ? "3D Buildings Enabled" : "3D Buildings Disabled",
      description: !enable3DBuildings ? "Showing buildings in 3D view" : "Switched to 2D map view",
      duration: 2000
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Header title="Enhanced Map" showBackButton onBackClick={() => navigate('/')} />

      {/* Map Controls */}
      <div className="px-4 pt-2 bg-white dark:bg-gray-900 shadow-sm z-10">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={currentMapStyle === MAP_STYLES.STREETS ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${currentMapStyle === MAP_STYLES.STREETS ? "bg-green-500 hover:bg-green-600" : "border-gray-300"}`}
              onClick={() => handleStyleChange(MAP_STYLES.STREETS)}
            >
              <Globe className={`h-3.5 w-3.5 ${currentMapStyle === MAP_STYLES.STREETS ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">Streets</span>
            </Button>

            <Button
              size="sm"
              variant={currentMapStyle === MAP_STYLES.SATELLITE ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${currentMapStyle === MAP_STYLES.SATELLITE ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-300"}`}
              onClick={() => handleStyleChange(MAP_STYLES.SATELLITE)}
            >
              <Layers className={`h-3.5 w-3.5 ${currentMapStyle === MAP_STYLES.SATELLITE ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">Satellite</span>
            </Button>

            <Button
              size="sm"
              variant={currentMapStyle === MAP_STYLES.DARK ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${currentMapStyle === MAP_STYLES.DARK ? "bg-gray-800 text-white hover:bg-gray-700" : "border-gray-300"}`}
              onClick={() => handleStyleChange(MAP_STYLES.DARK)}
            >
              <Box className={`h-3.5 w-3.5 ${currentMapStyle === MAP_STYLES.DARK ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">Dark</span>
            </Button>

            {/* 3D Buildings Toggle */}
            <Button
              size="sm"
              variant={enable3DBuildings ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${enable3DBuildings ? "bg-purple-600 text-white hover:bg-purple-700" : "border-gray-300"}`}
              onClick={toggle3DBuildings}
            >
              <Box className={`h-3.5 w-3.5 ${enable3DBuildings ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">3D</span>
            </Button>
          </div>
        </div>

        {/* Icon Legend */}
        <div className="flex flex-wrap gap-2 mt-2 pb-2">
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <Fuel className="h-3 w-3 text-green-500" />
            <span>Fuel Agents</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <MapPin className="h-3 w-3 text-red-500" />
            <span>Gas Stations</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <Zap className="h-3 w-3 text-blue-500" />
            <span>EV Charging</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <Tool className="h-3 w-3 text-gray-500" />
            <span>Car Repair</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <Coffee className="h-3 w-3 text-yellow-700" />
            <span>Coffee Shops</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <motion.div
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <EnhancedMap
          className="w-full h-full"
          zoom={12}
          center={LA_COORDINATES}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          interactive={true}
          showTraffic={showTraffic}
          mapStyle={currentMapStyle}
          onStyleChange={handleStyleChange}
          enable3DBuildings={enable3DBuildings}
          initialPitch={enable3DBuildings ? 60 : 0}
          initialBearing={30}
          enableClustering={true}
        />
      </motion.div>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <motion.div
          className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <h3 className="font-bold text-lg">{selectedMarker.title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{selectedMarker.description}</p>

          {/* Display properties based on marker type */}
          {selectedMarker.type === IconType.FUEL_AGENT && selectedMarker.properties && (
            <div className="mt-2">
              <p className="text-sm">Agent ID: {selectedMarker.properties.agentId}</p>
              <p className="text-sm">Rating: {selectedMarker.properties.rating} ⭐</p>
              <p className="text-sm">Status: {selectedMarker.properties.available ? 'Available' : 'Busy'}</p>
            </div>
          )}

          {selectedMarker.type === IconType.GAS_STATION && selectedMarker.properties && (
            <div className="mt-2">
              <p className="text-sm">Brand: {selectedMarker.properties.brand}</p>
              <p className="text-sm">Fuel Types: {selectedMarker.properties.fuelTypes.join(', ')}</p>
              <p className="text-sm">Status: {selectedMarker.properties.isOpen ? 'Open' : 'Closed'}</p>
            </div>
          )}

          <Button
            className="mt-3 w-full"
            onClick={() => setSelectedMarker(null)}
          >
            Close
          </Button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default EnhancedMapDemo;
