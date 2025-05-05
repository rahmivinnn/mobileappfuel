
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/ui/Map';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { allStations } from '@/data/dummyData';
import { motion, AnimatePresence } from 'framer-motion';
import { MAPBOX_STYLE, MAP_STYLES } from '@/config/mapbox';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';

// Bandung coordinates
const BANDUNG_COORDINATES = { lat: -6.9175, lng: 107.6191 };

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const { location, loading: locationLoading, error: locationError, permissionDenied, refreshLocation } = useGeolocation();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAPBOX_STYLE);

  useEffect(() => {
    if (location) {
      console.log("MapView received location:", location);
    }
  }, [location]);

  // Convert stations to map markers
  const markers = allStations.map(station => ({
    position: {
      lat: station.position.lat,
      lng: station.position.lng
    },
    title: station.name,
    icon: station.imageUrl
  }));

  const handleMarkerClick = (index: number) => {
    const stationId = allStations[index].id;
    setSelectedStationId(stationId);
    navigate(`/station/${stationId}`);
  };

  // Handle map style change
  const handleStyleChange = (style: string) => {
    setCurrentMapStyle(style);
  };

  // Handle traffic toggle
  const handleTrafficToggle = (show: boolean) => {
    setShowTraffic(show);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Find Stations" showBack={true} />

      {permissionDenied && (
        <motion.div
          className="m-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center space-x-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="text-red-500 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">Location permission denied. Please enable location services for better results.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-red-500 text-red-500 hover:bg-red-500/20"
            onClick={refreshLocation}
          >
            Try Again
          </Button>
        </motion.div>
      )}

      <motion.div
        className="h-[calc(100vh-8rem)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Map
          className="w-full h-full"
          zoom={13}
          center={BANDUNG_COORDINATES}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          showBackButton={true}
          interactive={true}
          showTraffic={showTraffic}
          mapStyle={currentMapStyle}
          onStyleChange={handleStyleChange}
          onTrafficToggle={handleTrafficToggle}
        />

        {locationLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm">Locating you...</span>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedStationId && (
          <motion.div
            className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-gray-800 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold">
                  {allStations.find(s => s.id === selectedStationId)?.name}
                </h3>
                <p className="text-gray-300 text-sm">
                  {allStations.find(s => s.id === selectedStationId)?.distance} miles away
                </p>
              </div>
              <motion.button
                className="bg-green-500 text-black px-4 py-2 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/station/${selectedStationId}`)}
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default MapView;
