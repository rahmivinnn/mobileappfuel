
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface FuelFriend {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  distance: string;
  phone: string;
  vehicle?: string;
  eta?: string;
}

interface FuelFriendSelectorProps {
  onSelect: (fuelFriend: FuelFriend) => void;
  onClose: () => void;
  orderDetails: {
    stationId: string;
    stationName: string;
    items: Array<{ name: string; quantity: string; price: number }>;
    total: number;
  };
}

const FuelFriendSelector: React.FC<FuelFriendSelectorProps> = ({ 
  onSelect, 
  onClose,
  orderDetails
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<FuelFriend | null>(null);
  
  // Single dedicated Fuel Friend for better tracking experience
  const dedicatedFuelFriend: FuelFriend = {
    id: "ff1",
    name: "Christopher Dastin",
    image: "/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png",
    rating: 4.8,
    location: "Memphis, TN",
    distance: "0.5 miles away",
    phone: "+1 (901) 555-3478",
    vehicle: "White Toyota Camry",
    eta: "6 min"
  };

  React.useEffect(() => {
    // Simulate searching for a nearby Fuel Friend
    const searchTimer = setTimeout(() => {
      setIsSearching(false);
      setSelectedFriend(dedicatedFuelFriend);
      
      toast({
        title: "Fuel Friend Found",
        description: `${dedicatedFuelFriend.name} is nearby and available to fulfill your order.`,
        duration: 3000,
      });
    }, 2000);
    
    return () => clearTimeout(searchTimer);
  }, [toast]);

  const handleSelectFriend = () => {
    if (selectedFriend) {
      onSelect(selectedFriend);
      
      toast({
        title: "Fuel Friend Selected",
        description: `${selectedFriend.name} has been notified of your order.`,
        duration: 3000,
      });
      
      // Show acceptance notification after a delay
      setTimeout(() => {
        toast({
          title: "Order Accepted!",
          description: `${selectedFriend.name} has accepted your request and is on the way.`,
          duration: 3000,
          className: "bg-green-500 border-green-600 text-white"
        });
      }, 2000);
      
      // Navigate to tracking page after selection
      setTimeout(() => {
        navigate(`/track?orderId=${orderDetails.stationId}`);
      }, 3500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-2">
          {isSearching ? "Finding Fuel Friend..." : "Fuel Friend Found"}
        </h2>
        <p className="text-gray-400 mb-4">
          {isSearching ? "Searching for the nearest delivery person" : "Ready to deliver your order"}
        </p>
        
        {/* Order summary */}
        <div className="bg-gray-800 rounded-lg p-3 mb-6">
          <h3 className="font-medium mb-2">Order Summary</h3>
          <p className="text-sm text-gray-400 mb-1">{orderDetails.stationName}</p>
          {orderDetails.items.slice(0, 2).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          {orderDetails.items.length > 2 && (
            <p className="text-xs text-gray-500 mt-1">
              + {orderDetails.items.length - 2} more items
            </p>
          )}
          <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between">
            <span>Total</span>
            <span className="font-bold">${orderDetails.total.toFixed(2)}</span>
          </div>
        </div>
        
        {isSearching ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-10 w-10 text-green-500 animate-spin mb-4" />
            <p className="text-gray-300">Finding the closest Fuel Friend...</p>
            <p className="text-xs text-gray-500 mt-2">This usually takes 5-10 seconds</p>
          </div>
        ) : (
          <div>
            {selectedFriend && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center">
                  <div className="h-20 w-20 rounded-full overflow-hidden mr-4 border-2 border-green-500">
                    <img 
                      src={selectedFriend.image} 
                      alt={selectedFriend.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">{selectedFriend.name}</h3>
                      <div className="flex items-center bg-gray-700 px-2 py-0.5 rounded">
                        <Star size={14} className="text-yellow-400 mr-1" />
                        <span className="text-sm">{selectedFriend.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span>{selectedFriend.distance}</span>
                    </div>
                    {selectedFriend.vehicle && (
                      <p className="text-xs text-gray-500 mt-1">{selectedFriend.vehicle}</p>
                    )}
                    {selectedFriend.eta && (
                      <div className="mt-2 bg-green-500/20 text-green-500 rounded-full px-3 py-1 inline-block text-sm">
                        Estimated arrival: {selectedFriend.eta}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectFriend}
                className="flex-1 py-3 rounded-xl bg-green-500 text-black font-medium hover:bg-green-400 active:scale-[0.98] transition-all duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FuelFriendSelector;
