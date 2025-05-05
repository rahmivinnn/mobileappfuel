
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatToRupiah } from '@/pages/MapView';

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
  // Use the provided image
  const displayImage = imageUrl || "/lovable-uploads/8ed0bc34-d448-42c8-804a-8dda4e3e6840.png";
  const displayStatus = openStatus || (isOpen ? "Open" : "Closed");

  // Get the lowest price from the first fuel type if price is not provided
  const displayPrice = price || "3.29";  // Default price if not provided

  const handleStationClick = () => {
    navigate(`/station/${id}`);
  };

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
            <span className="text-sm text-green-700 dark:text-green-400">fuel Price</span>
            <span className="ml-auto font-bold text-gray-900 dark:text-white">{formatToRupiah(displayPrice)}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Distance</span>
            <span className="ml-auto text-gray-700 dark:text-gray-300">{distance} miles</span>
          </div>
        </div>
      </div>

      <button
        className="mt-auto w-full bg-green-500 text-white py-2 font-medium hover:bg-green-600 transition-colors"
      >
        Select Station
      </button>
    </motion.div>
  );
};

export default StationCard;
