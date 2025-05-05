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
import { MapPin, AlertCircle, User } from 'lucide-react';

// Bandung coordinates
const BANDUNG_COORDINATES = { lat: -6.9175, lng: 107.6191 };

// Helper function for rupiah formatting
export const formatToRupiah = (number: number | string) => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

// Sample FuelFriendly agent locations near Bandung
const fuelAgents = [
  { lat: -6.9125, lng: 107.6181, name: "Agent John" },
  { lat: -6.9190, lng: 107.6281, name: "Agent Sarah" },
  { lat: -6.9075, lng: 107.6091, name: "Agent Mike" }
];

// Calculate distance between two coordinates in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

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

  // Calculate actual distances based on user location or default to Bandung
  const stationsWithDistance = allStations.map(station => {
    const userLat = location?.coordinates?.lat || BANDUNG_COORDINATES.lat;
    const userLng = location?.coordinates?.lng || BANDUNG_COORDINATES.lng;
    const distance = getDistance(
      userLat, 
      userLng, 
      station.position.lat, 
      station.position.lng
    ).toFixed(1);
    
    return {
      ...station,
      distance
    };
  });

  // Sort stations by distance
  const sortedStations = [...stationsWithDistance].sort((a, b) => 
    parseFloat(a.distance) - parseFloat(b.distance)
  );

  // Convert stations to map markers
  const markers = sortedStations.slice(0, 10).map(station => ({
    position: {
      lat: station.position.lat,
      lng: station.position.lng
    },
    title: station.name,
    icon: station.imageUrl,
    label: "Gas Station"
  }));

  // Add FuelFriendly agents as markers
  const agentMarkers = fuelAgents.map(agent => ({
    position: {
      lat: agent.lat,
      lng: agent.lng
    },
    title: agent.name,
    icon: "/lovable-uploads/1bc06a60-0463-4f47-abde-502bc408852e.png", // Using a placeholder icon
    label: "FuelFriendly Agent",
    isAgent: true
  }));

  // Combine regular markers with agent markers
  const allMarkers = [...markers, ...agentMarkers];

  const handleMarkerClick = (index: number) => {
    // Only navigate to station details if it's a gas station marker
    if (index < markers.length) {
      const stationId = sortedStations[index].id;
      setSelectedStationId(stationId);
      navigate(`/station/${stationId}`);
    } else {
      // Handle agent marker click if needed
      console.log("Agent clicked:", agentMarkers[index - markers.length].title);
    }
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
      <Header title="Temukan SPBU" showBack={true} />

      {permissionDenied && (
        <motion.div
          className="m-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center space-x-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="text-red-500 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">Izin lokasi ditolak. Mohon aktifkan layanan lokasi untuk hasil yang lebih baik.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-red-500 text-red-500 hover:bg-red-500/20"
            onClick={refreshLocation}
          >
            Coba Lagi
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
          markers={allMarkers}
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
            <span className="text-white text-sm">Mencari lokasi Anda...</span>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedStationId && (
          <motion.div
            className="absolute bottom-20 left-4 right-4 bg-white dark:bg-black/80 backdrop-blur-md rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-black dark:text-white font-semibold">
                  {sortedStations.find(s => s.id === selectedStationId)?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {sortedStations.find(s => s.id === selectedStationId)?.distance} km jaraknya
                </p>
              </div>
              <motion.button
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/station/${selectedStationId}`)}
              >
                Lihat Detail
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
