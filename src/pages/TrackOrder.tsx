
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import Map from '@/components/ui/Map';

interface OrderItem {
  name: string;
  quantity: string;
  price: number;
}

interface Driver {
  name: string;
  location: string;
  image: string;
  rating: number;
  phone: string;
  vehicle: string;
}

interface Order {
  id: string;
  status: 'job-accepted' | 'processing' | 'in-transit' | 'delivered';
  estimatedDelivery: string;
  items: OrderItem[];
  total: number;
  pickupLocation: string;
  dropoffLocation: string;
  orderType: string;
  licensePlate: string;
  driver: Driver;
  progress: number;
  statusDetails: string;
  driverLocation: { lat: number; lng: number };
}

const dedicatedDriver: Driver = {
  name: 'Cristopert Dastin',
  location: 'Tennessee',
  image: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png',
  rating: 4.8,
  phone: '+1 (901) 555-3478',
  vehicle: 'White Toyota Camry',
};

const TrackOrder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [order, setOrder] = useState<Order | null>(null);
  const [showJobStartedModal, setShowJobStartedModal] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number }>({ lat: 35.149, lng: -90.048 });
  const [driverMarkers, setDriverMarkers] = useState<any[]>([]);
  const [destinationMarker, setDestinationMarker] = useState<any[]>([]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false };
  }, []);

  useEffect(() => {
    // Mock setup order
    const mockOrder: Order = {
      id: '123',
      status: 'job-accepted',
      estimatedDelivery: '7:15 - 7:45 PM',
      items: [
        { name: '2 Gallons Regular Unleaded', quantity: '1x', price: 7.34 },
        { name: 'Chocolate cookies', quantity: '2x', price: 3.5 }
      ],
      total: 10.84,
      pickupLocation: 'Shell Station- Abc Town',
      dropoffLocation: 'Shell Station- Abc Town',
      orderType: 'Fuel delivery',
      licensePlate: 'TN-56A782',
      driver: dedicatedDriver,
      progress: 0,
      statusDetails: 'Job Accepted',
      driverLocation,
    };
    setOrder(mockOrder);
    setDriverMarkers([{
      position: driverLocation,
      title: dedicatedDriver.name,
      icon: dedicatedDriver.image,
    }]);
    setDestinationMarker([{
      position: { lat: 35.146, lng: -90.052 },
      title: 'Customer',
      icon: '/lovable-uploads/bd7d3e2c-d8cc-4ae3-b3f6-e23f3527fa24.png',
    }]);
  }, []);

  // Simulate driver movement & status update once job starts (modal closed)
  useEffect(() => {
    if (!order || order.status !== 'processing') return;

    let currentStep = 0;
    type StatusType = 'processing' | 'in-transit' | 'delivered';
    const statuses: { status: StatusType; progress: number; statusDetails: string }[] = [
      { status: 'processing', progress: 10, statusDetails: 'Order received' },
      { status: 'processing', progress: 30, statusDetails: 'Processing your order' },
      { status: 'in-transit', progress: 50, statusDetails: 'Driver on the way to pickup' },
      { status: 'in-transit', progress: 80, statusDetails: 'Fuel picked up, headed your way' },
      { status: 'delivered', progress: 100, statusDetails: 'Delivery complete!' },
    ];

    const progressTimer = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(progressTimer);
        return;
      }
      if (currentStep < statuses.length) {
        setOrder(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: statuses[currentStep].status,
            progress: statuses[currentStep].progress,
            statusDetails: statuses[currentStep].statusDetails,
          };
        });
        currentStep++;
        if (currentStep === statuses.length) {
          clearInterval(progressTimer);
        }
      } else {
        clearInterval(progressTimer);
      }
    }, 8000);

    return () => clearInterval(progressTimer);
  }, [order?.status]);

  // Driver movement simulation on map
  useEffect(() => {
    if (!order || order.status === 'job-accepted') return;

    const destination = { lat: 35.146, lng: -90.052 };
    const moveInterval = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(moveInterval);
        return;
      }
      const { lat, lng } = driverLocation;
      const deltaLat = destination.lat - lat;
      const deltaLng = destination.lng - lng;
      if (Math.abs(deltaLat) < 0.00001 && Math.abs(deltaLng) < 0.00001) {
        clearInterval(moveInterval);
        return;
      }
      const newLat = lat + deltaLat * 0.07;
      const newLng = lng + deltaLng * 0.07;
      const newLocation = { lat: newLat, lng: newLng };

      if (newLat !== lat || newLng !== lng) {
        setDriverLocation(newLocation);
        setDriverMarkers([{
          position: newLocation,
          title: dedicatedDriver.name,
          icon: dedicatedDriver.image,
        }]);
        setOrder(prev => prev ? { ...prev, driverLocation: newLocation } : prev);
      }
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [driverLocation, order?.status]);

  const handleStartTracking = () => {
    setShowJobStartedModal(false);
    setOrder(prev => prev ? { ...prev, status: 'processing', statusDetails: 'Order started', progress: 10 } : prev);
  };

  const handleCall = () => {
    if (!order) return;
    navigate(`/call?fuelFriendName=${encodeURIComponent(order.driver.name)}`);
  };

  const handleMessage = () => {
    if (!order) return;
    navigate(`/chat?fuelFriendName=${encodeURIComponent(order.driver.name)}`);
  };

  // Status color helper
  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-500';
    switch (status) {
      case 'job-accepted':
        return 'bg-green-400';
      case 'processing':
        return 'bg-yellow-500';
      case 'in-transit':
        return 'bg-green-500';
      case 'delivered':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!order) return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center p-6">
      <p>Loading order...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white px-4">
      {/* Header */}
      <div className="flex items-center py-4">
        <button
          aria-label="Back"
          onClick={() => navigate("/orders")}
          className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-grow text-center font-semibold text-lg sm:text-xl px-4">
          {showJobStartedModal ? 'Track Your Customer' : 'Track Customer'}
        </h1>
        <div className="w-10" /> {/* Placeholder for spacing */}
      </div>

      {/* Job Started Modal */}
      <AnimatePresence>
      {showJobStartedModal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center px-4"
          aria-modal="true"
          role="dialog"
        >
          <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-lg relative">
            <button
              onClick={() => setShowJobStartedModal(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              &#x2715;
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center ring-4 ring-green-400">
                <Check className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Job Started Successfully!</h2>
              <p className="text-gray-400 px-1">
                Track your customer&apos;s location to ensure a smooth delivery!
              </p>
              <div className="space-y-2 text-left text-sm text-gray-300 w-full px-8">
                <p><span className="inline-block mr-1 text-red-500">📍</span> Pickup: {order.pickupLocation}</p>
                <p><span className="inline-block mr-1 text-red-400">🎯</span> Drop off: {order.dropoffLocation}</p>
                <p><span className="inline-block mr-1 text-green-500">🎫</span> Order type: {order.orderType}</p>
              </div>
              <button
                onClick={handleStartTracking}
                className="mt-4 w-full bg-green-500 text-black font-semibold rounded-full py-3 hover:bg-green-600 transition"
              >
                Track Order
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {!showJobStartedModal && (
        <>
          {/* Map */}
          <div className={`${isMobile ? 'h-[400px]' : 'h-[450px]'} rounded-2xl overflow-hidden`}>
            <Map
              className="w-full h-full"
              markers={[...driverMarkers, ...destinationMarker]}
              directions={true}
              showRoute={true}
              interactive={true}
              zoom={14}
            />
          </div>

          {/* Driver Info Bottom */}
          <div className="mt-6 bg-gray-900 px-6 py-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={order.driver.image}
                alt={order.driver.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <p className="font-semibold">{order.driver.name}</p>
                <p className="text-sm text-gray-400">{order.driver.location}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleMessage}
                aria-label={`Message ${order.driver.name}`}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
              >
                <MessageSquare className="h-6 w-6 text-black" />
              </button>
              <button
                onClick={handleCall}
                aria-label={`Call ${order.driver.name}`}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
              >
                <Phone className="h-6 w-6 text-black" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrackOrder;
