
import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, List, Layers, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Map from '@/components/ui/Map';
import { useToast } from "@/hooks/use-toast";
import { allStations } from "@/data/dummyData";
import { motion } from 'framer-motion';

const MapView = () => {
  const [showList, setShowList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  // Create markers from station data
  const markers = allStations.map(station => ({
    position: {
      lat: parseFloat(station.coordinates.lat),
      lng: parseFloat(station.coordinates.lng)
    },
    title: station.name,
    icon: station.brand === 'Shell' 
      ? '/lovable-uploads/63b42fc8-62eb-4bdb-84c2-73e747d69d45.png'
      : '/lovable-uploads/463bf610-05e1-4137-856e-46609ab49bbc.png'
  }));

  const filteredStations = allStations
    .filter(station => 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  const handleMarkerClick = (index: number) => {
    setSelectedStation(index);
    setShowList(true);
    
    toast({
      title: "Station Selected",
      description: `${allStations[index].name} has been selected.`,
      duration: 3000,
    });
  };

  useEffect(() => {
    // Notify user when the map has loaded
    toast({
      title: "Map Loaded",
      description: "Viewing all nearby fuel stations.",
      duration: 3000,
    });
  }, [toast]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 z-10">
        <Link to="/" className="h-10 w-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold">Nearby Fuel Stations</h1>
        <button 
          onClick={() => setShowList(!showList)} 
          className="h-10 w-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg"
        >
          {showList ? <Layers className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>

      <div className="relative flex-1">
        <Map
          className="w-full h-full"
          markers={markers}
          interactive={true}
          showRoute={false}
          directions={false}
          onMarkerClick={handleMarkerClick}
          showBackButton={false}
          zoom={12}
        />
        
        <div className="absolute top-4 left-0 right-0 mx-auto w-[80%] max-w-md">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search stations..."
              className="h-12 w-full rounded-full bg-background/80 backdrop-blur-sm pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Station list panel */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto"
          initial={{ y: "100%" }}
          animate={{ y: showList ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="w-12 h-1 bg-gray-300 mx-auto mb-4 rounded-full" />
          <h2 className="text-xl font-bold mb-4">Nearby Stations</h2>
          
          <div className="space-y-3">
            {filteredStations.map((station, index) => {
              const cheapestFuel = station.fuels && station.fuels.length > 0 
                ? station.fuels.reduce((min, fuel) => 
                    parseFloat(fuel.price) < parseFloat(min.price) ? fuel : min, 
                    station.fuels[0])
                : null;
              
              return (
                <Link 
                  to={`/station/${station.id}`} 
                  key={station.id} 
                  className={`block p-3 rounded-xl transition-all ${
                    selectedStation === index ? 'bg-green-500/20 border border-green-500' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex items-center justify-center">
                      {station.imageUrl ? (
                        <img src={station.imageUrl} alt={station.name} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{station.name}</h3>
                      <p className="text-xs text-gray-500">{station.address}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{station.distance} miles</span>
                        {cheapestFuel && (
                          <span className="text-green-500 font-bold">${cheapestFuel.price}/gal</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MapView;
