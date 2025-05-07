
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Banknote, Fuel, Clock, GasPump } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatToCurrency } from '@/utils/currencyUtils';

interface StationCardProps {
  id: string;
  name: string;
  address: string;
  distance: string;
  price?: string;
  rating: number;
  image?: string;
  imageUrl?: string;
  openStatus?: string;
  isOpen?: boolean;
}

const StationCard: React.FC<StationCardProps> = ({
  id,
  name,
  address,
  distance,
  price,
  rating,
  image,
  imageUrl,
  openStatus,
  isOpen = true
}) => {
  const navigate = useNavigate();

  // Always use US country for currency display
  const userCountry = 'US';

  const displayStatus = openStatus || (isOpen ? "Open" : "Closed");

  // Get the lowest price from the first fuel type if price is not provided
  const displayPrice = price || "3.50";  // Default price in USD if not provided

  const handleStationClick = () => {
    navigate(`/station/${id}`);
  };

  // No longer need image error handling with SVG icons

  // Determine language based on country for labels
  const getLabels = () => {
    const labels = {
      fuelPrice: "Fuel Price",
      distance: "Distance",
      select: "Select Station"
    };

    return labels;
  };

  const labels = getLabels();

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-800 flex flex-col"
      onClick={handleStationClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
            <Star className="text-yellow-500 w-3 h-3 mr-1" />
            <span className="text-xs text-yellow-700 dark:text-yellow-400">{rating}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <Banknote className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700 dark:text-green-400">{labels.fuelPrice}</span>
            <span className="ml-auto font-bold text-gray-900 dark:text-white">{formatToCurrency(displayPrice, userCountry)}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{labels.distance}</span>
            <span className="ml-auto text-gray-700 dark:text-gray-300">{distance} km</span>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className={`ml-auto ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {displayStatus}
            </span>
          </div>
        </div>

        <div className="mt-3 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center shadow-md">
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            {/* Gas Station Icon */}
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-1">
              <GasPump className="w-8 h-8 text-green-500" />
            </div>

            {/* Brand Name */}
            <div className="bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-xs font-bold shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              {name.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      <button
        className="mt-auto w-full bg-green-500 text-white py-2 font-medium hover:bg-green-600 transition-colors"
      >
        {labels.select}
      </button>
    </motion.div>
  );
};

export default StationCard;
