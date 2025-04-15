
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/ui/Map';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import { stations } from '@/data/dummyData';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  
  // Convert stations to map markers
  const markers = stations.map(station => ({
    position: station.position, // Use position property directly
    title: station.name,
    icon: station.imageUrl // Use imageUrl as icon
  }));

  const handleMarkerClick = (index: number) => {
    const stationId = stations[index].id;
    setSelectedStationId(stationId);
    toast({
      title: "Station Selected",
      description: `${stations[index].name} has been selected`,
    });
    navigate(`/station/${stationId}`);
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
        />
      </motion.div>
      
      <BottomNav />
    </div>
  );
};

export default MapView;
