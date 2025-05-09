
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedMap, { MarkerData, IconType } from '@/components/ui/EnhancedMap';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { motion } from 'framer-motion';
import { MAP_STYLES } from '@/config/mapbox';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Layers, Box, Zap, Coffee, Wrench, Fuel } from 'lucide-react';
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
      <Header title="Enhanced Map" backButton onBackClick={() => navigate('/')} />

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
            <Wrench className="h-3 w-3 text-gray-500" />
            <span>Car Repair</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <Coffee className="h-3 w-3 text-yellow-700" />
            <span>Coffee Shops</span>
          </div>
        </div>
      </div>

      {/* Map - Full height */}
      <motion.div
        className="flex-grow relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ height: 'calc(100vh - 180px)' }} // Full height minus header and bottom nav
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

        {/* Floating action buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            className="bg-white dark:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-700"
            onClick={() => {
              const map = document.querySelector('.mapboxgl-map') as HTMLElement;
              if (map) {
                map.style.transform = 'scale(1.01)';
                setTimeout(() => {
                  map.style.transform = 'scale(1)';
                }, 200);
              }
              toast({
                title: "Current Location",
                description: "Centering map on your location",
                duration: 2000
              });
            }}
          >
            <div className="h-6 w-6 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          <button
            className="bg-white dark:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-700"
            onClick={() => {
              toast({
                title: "Refreshing Map",
                description: "Updating map data...",
                duration: 2000
              });
              // Simulate refresh by regenerating markers
              setMarkers([]);
              setTimeout(() => {
                setMarkers(generateAllSampleMarkers(LA_COORDINATES));
              }, 500);
            }}
          >
            <div className="h-6 w-6 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
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
