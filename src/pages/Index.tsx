
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Bell, User, Home, ShoppingBag, MapPin, Settings, Fuel } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import StationCard from '@/components/ui/StationCard';
import Map from '@/components/ui/Map';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allStations } from "@/data/dummyData";
import { MAPBOX_STYLE, MAP_STYLES } from '@/config/mapbox';
import { useGeolocation } from '@/hooks/use-geolocation';
import StationListItem from '@/components/ui/StationListItem';
import { formatToRupiah } from './MapView';

// Calculate distance between two coordinates in km using Haversine formula
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

const Index = () => {
  const { location, refreshLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const [showTraffic, setShowTraffic] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES.STREETS);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const navigate = useNavigate();
  
  // Track location changes to update map and stations
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [stationsWithDistance, setStationsWithDistance] = useState(allStations);
  
  // Update map center and calculate distances when location changes
  useEffect(() => {
    if (location && location.coordinates) {
      console.log("Location updated in Index:", location);
      setMapCenter(location.coordinates);
      
      // Recalculate distances based on new location
      const updatedStations = allStations.map(station => {
        const distance = getDistance(
          location.coordinates.lat,
          location.coordinates.lng,
          station.position.lat,
          station.position.lng
        ).toFixed(1);
        
        return {
          ...station,
          distance
        };
      });
      
      setStationsWithDistance(updatedStations);
    }
  }, [location]);

  // Filter and sort stations by distance
  const filteredStations = stationsWithDistance
    .filter(station =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSeeAll = () => {
    navigate('/map');
  };

  // Gas station image URL
  const gasStationIconUrl = "/lovable-uploads/e7264ee5-ed98-4679-91b4-8f12d183784b.png";

  // Convert stations to map markers - limit to nearest 5
  const markers = filteredStations.slice(0, 5).map(station => ({
    position: {
      lat: station.position.lat,
      lng: station.position.lng
    },
    title: station.name,
    icon: gasStationIconUrl,
    label: "Gas Station"
  }));

  // Add FuelFriendly agents as markers - adjusted based on current location
  const fuelAgents = location ? [
    { 
      lat: location.coordinates.lat + 0.005, 
      lng: location.coordinates.lng + 0.005, 
      name: "Agent John" 
    },
    { 
      lat: location.coordinates.lat - 0.008, 
      lng: location.coordinates.lng + 0.007, 
      name: "Agent Sarah" 
    }
  ] : [];

  // Add FuelFriendly agents as markers
  const agentMarkers = fuelAgents.map(agent => ({
    position: {
      lat: agent.lat,
      lng: agent.lng
    },
    title: agent.name,
    icon: "/lovable-uploads/1bc06a60-0463-4f47-abde-502bc408852e.png",
    label: "FuelFriendly Agent",
    isAgent: true
  }));

  // Combine regular markers with agent markers
  const allMarkers = [...markers, ...agentMarkers];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex justify-between items-center px-4 py-2">
          <Avatar className="w-10 h-10 bg-green-500 border-2 border-green-300">
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600">
              <User className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex justify-center">
            <img
              src="/lovable-uploads/57aff490-f08a-4205-9ae9-496a32e810e6.png"
              alt="FUELFRIENDLY"
              className="h-7"
            />
          </div>

          <Bell className="h-6 w-6" />
        </div>

        {/* Search */}
        <div className="px-4 py-2 flex items-center space-x-3 pb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for nearest gas stations..."
              className="h-12 w-full rounded-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            onClick={() => refreshLocation()}
          >
            <Filter className="h-5 w-5 text-green-500" />
          </button>
        </div>
      </div>

      {/* Location Indicator */}
      {location && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-green-800 dark:text-green-300">
              {location.city}, {location.country}
            </span>
          </div>
          <button 
            onClick={() => refreshLocation()}
            className="text-xs text-green-600 dark:text-green-400 underline"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Map Section */}
      <div className="px-4 py-2 relative">
        <div className={`transition-all duration-1000 rounded-2xl overflow-hidden ${mapVisible ? 'opacity-100 shadow-lg scale-100' : 'opacity-0 scale-95'}`}>
          <Map
            className="h-56 w-full rounded-2xl overflow-hidden"
            interactive={true}
            showTraffic={showTraffic}
            center={location?.coordinates || { lat: 0, lng: 0 }}
            zoom={13}
            mapStyle={currentMapStyle}
            markers={allMarkers}
            onStyleChange={(style) => setCurrentMapStyle(style)}
            onTrafficToggle={(show) => setShowTraffic(show)}
            initialPitch={60}
            initialBearing={30}
            enable3DBuildings={true}
            onMarkerClick={(index) => {
              // Only navigate to station details if it's a gas station marker
              if (index < markers.length) {
                navigate(`/station/${filteredStations[index].id}`);
              }
            }}
          />
        </div>
      </div>

      {/* Stations List */}
      <div className="px-4 pt-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {location ? `Nearest Gas Stations in ${location.city}` : 'Loading Gas Stations...'}
        </h2>

        <div className="space-y-4">
          {filteredStations.slice(0, 8).map((station, index) => {
            const cheapestFuel = station.fuels && station.fuels.length > 0
              ? station.fuels.reduce((min, fuel) =>
                  parseFloat(fuel.price) < parseFloat(min.price) ? fuel : min,
                  station.fuels[0])
              : null;

            return (
              <StationListItem
                key={station.id}
                id={station.id}
                name={station.name}
                address={`${station.address}, ${location?.city || 'Unknown Location'}`}
                distance={station.distance}
                price={cheapestFuel ? cheapestFuel.price : "3.29"}
                rating={station.rating}
                reviewCount={24}
                imageUrl={station.imageUrl}
                delay={index}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 flex items-center justify-around">
        <div className="flex flex-col items-center text-green-500">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xs mt-1">My Orders</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <MapPin className="h-6 w-6" />
          <span className="text-xs mt-1">Track Order</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
