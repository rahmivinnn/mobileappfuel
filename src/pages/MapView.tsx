
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/ui/Map';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { allStations } from '@/data/dummyData';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { MAPBOX_STYLE, MAP_STYLES } from '@/config/mapbox';

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAPBOX_STYLE);

  // Convert stations to map markers
  const markers = allStations.map(station => ({
    position: station.position,
    title: station.name,
    icon: station.imageUrl
  }));

  const handleMarkerClick = (index: number) => {
    const stationId = allStations[index].id;
    setSelectedStationId(stationId);
    toast({
      title: "Station Selected",
      description: `${allStations[index].name} has been selected`,
    });
    navigate(`/station/${stationId}`);
  };

  // Handle map style change
  const handleStyleChange = (style: string) => {
    setCurrentMapStyle(style);
    toast({
      title: "Map Style Changed",
      description: `Map style updated to ${Object.keys(MAP_STYLES).find(key => MAP_STYLES[key as keyof typeof MAP_STYLES] === style)?.replace(/_/g, ' ') || 'new style'}`
    });
  };

  // Handle traffic toggle
  const handleTrafficToggle = (show: boolean) => {
    setShowTraffic(show);
    toast({
      title: show ? "Traffic Enabled" : "Traffic Disabled",
      description: show ? "Now showing real-time traffic conditions" : "Traffic layer has been hidden"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Find Stations" showBack={true} />

      <motion.div
        className="h-[calc(100vh-8rem)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Map
          className="w-full h-full"
          zoom={13}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          showBackButton={true}
          interactive={true}
          showTraffic={showTraffic}
          mapStyle={currentMapStyle}
          onStyleChange={handleStyleChange}
          onTrafficToggle={handleTrafficToggle}
        />
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
