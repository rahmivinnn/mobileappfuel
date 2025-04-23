
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

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
  // Use the new Shell image for all station cards
  const displayImage = "/lovable-uploads/8ed0bc34-d448-42c8-804a-8dda4e3e6840.png";
  const displayStatus = openStatus || (isOpen ? "Open" : "Closed");

  // Get the lowest price from the first fuel type if price is not provided
  const displayPrice = price || "3.29";  // Default price if not provided

  const handleStationClick = () => {
    navigate(`/station/${id}`);
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden h-52 relative cursor-pointer shadow-md hover:shadow-lg border border-gray-800 bg-gray-900/40"
      onClick={handleStationClick}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        borderColor: "rgba(34, 197, 94, 0.3)"
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <motion.img
        src={displayImage}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5 }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

      <div className="relative h-full flex flex-col justify-between p-4">
        <div className="flex justify-between items-start">
          <motion.div
            className="bg-green-500 px-2 py-0.5 rounded-md text-xs font-medium text-black"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {displayStatus}
          </motion.div>

          <motion.div
            className="flex space-x-1 items-center bg-black/60 rounded-full px-2 py-1"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          >
            <motion.div
              animate={{ rotate: [0, 15, 0, -15, 0] }}
              transition={{ delay: 1, duration: 1, repeat: 1 }}
            >
              <Star className="text-yellow-400 w-3 h-3" />
            </motion.div>
            <span className="text-xs text-white">{rating}</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-base font-semibold text-white mb-1">{name}</h3>
              <div className="flex items-center text-gray-300 text-xs">
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ delay: 0.5, duration: 1, repeat: 1 }}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                </motion.div>
                <span className="truncate max-w-[150px]">{address}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{distance} miles away</p>
            </div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <p className="text-white font-bold text-xl">${displayPrice}</p>
              <p className="text-gray-400 text-xs text-right">per gallon</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StationCard;
