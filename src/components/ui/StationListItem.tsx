
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Banknote, Fuel, User, Clock, Map, Timer, GasPump } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatToCurrency } from '@/utils/currencyUtils';
import { Button } from './button';

interface StationListItemProps {
  id: string;
  name: string;
  address: string;
  distance: string;
  price: string | number;
  rating: number;
  reviewCount?: number;
  imageUrl?: string; // Make optional since we'll use a consistent icon
  delay?: number;
  isOpen?: boolean;
  openStatus?: string;
  estimatedTime?: string; // Add estimated time to reach
  brand?: string; // Add brand for future API integration
  onViewMap?: () => void; // Callback for View on Map button
}

const StationListItem: React.FC<StationListItemProps> = ({
  id,
  name,
  address,
  distance,
  price,
  rating,
  reviewCount = 24,
  imageUrl,
  delay = 0,
  isOpen = true,
  openStatus,
  estimatedTime,
  brand,
  onViewMap
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/station/${id}`);
  };

  // Improved image handling
  const [imageError, setImageError] = React.useState(false);

  // Use Shell Beverly Hills style gas station image if the provided URL fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    e.currentTarget.src = "/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png"; // Shell Beverly Hills style icon
  };

  // Always use US currency format
  const userCountry = 'US';

  // Get translated labels based on the user's country/language
  // For now, using English universally, but could be expanded for localization
  const getLabels = () => {
    const labels = {
      fuelPrice: "Fuel Price",
      distance: "Distance",
      reviews: "Reviews",
      status: "Status",
      select: "Select",
      viewOnMap: "View on Map",
      estimatedTime: "Est. Time"
    };

    return labels;
  };

  const labels = getLabels();
  const displayStatus = openStatus || (isOpen ? "Open" : "Closed");

  return (
    <motion.div
      className="w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden mb-2 shadow-sm border border-gray-100 dark:border-gray-800"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.15 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex p-2 gap-2">
        {/* Gas Station Brand Icon - More compact */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-green-100 dark:bg-green-900/30 flex flex-col items-center justify-center shadow-sm">
          {/* Emoji Fallback */}
          <div className="text-xl mb-0.5">⛽</div>

          {/* Brand Name */}
          <div className="bg-white dark:bg-gray-800 rounded-md px-1.5 py-0.5 text-[9px] font-bold shadow-sm text-center w-11 truncate">
            {brand || name.split(' ')[0]}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-xs truncate pr-1">{name}</h3>

          <div className="flex items-center text-green-500 mt-0.5 gap-1">
            <Banknote className="h-3 w-3 flex-shrink-0" />
            <p className="text-[10px] truncate w-16">Fuel Price</p>
            <p className="text-right flex-1 font-bold text-xs">{formatToCurrency(price, userCountry)}</p>
          </div>

          <div className="flex items-center text-orange-500 mt-0.5 gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <p className="text-[10px] truncate w-16">Distance</p>
            <p className="text-right flex-1 text-[10px]">{distance} km</p>
          </div>

          {/* Show estimated time if available */}
          {estimatedTime && (
            <div className="flex items-center text-purple-500 mt-0.5 gap-1">
              <Timer className="h-3 w-3 flex-shrink-0" />
              <p className="text-[10px] truncate w-16">Est. Time</p>
              <p className="text-right flex-1 text-[10px]">{estimatedTime}</p>
            </div>
          )}

          <div className="flex items-center text-blue-500 mt-0.5 gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <p className="text-[10px] truncate w-16">Status</p>
            <p className={`text-right flex-1 text-[10px] ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {displayStatus}
            </p>
          </div>

          <div className="flex items-center text-yellow-500 mt-0.5 gap-1">
            <Star className="h-3 w-3 flex-shrink-0" />
            <p className="text-[10px] truncate w-16">Reviews</p>
            <p className="text-right flex-1 text-[10px]">{rating} ({reviewCount})</p>
          </div>
        </div>
      </div>

      {/* Action buttons - More compact */}
      <div className="flex w-full">
        <button
          onClick={handleClick}
          className="flex-1 bg-green-500 text-white py-1.5 text-[10px] font-medium hover:bg-green-600 transition-colors"
        >
          Select {brand || name.split(' ')[0]}
        </button>

        {onViewMap && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewMap();
            }}
            className="bg-blue-500 text-white py-1.5 px-2 text-[10px] font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Map className="h-2.5 w-2.5 mr-0.5" />
            View on Map
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default StationListItem;
