
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, ChevronLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import RatingModal from '@/components/ui/RatingModal';
import OrderConfirmModal from '@/components/ui/OrderConfirmModal';
import Map from '@/components/ui/Map';

// Define consistent order and driver types as in OrderHistory.tsx
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
  status: 'processing' | 'in-transit' | 'delivered';
  estimatedDelivery: string;
  items: OrderItem[];
  total: number;
  licensePlate: string;
  driver: Driver;
  progress: number;
  statusDetails: string;
  driverLocation: { lat: number; lng: number };
}

const dedicatedDriver: Driver = {
  name: 'Christopher Dastin',
  location: 'Memphis, TN',
  image: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png',
  rating: 4.8,
  phone: '+1 (901) 555-3478',
  vehicle: 'White Toyota Camry',
};

const deliveryTime = '7:15 - 7:45 PM';

const TrackOrder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number }>({ lat: 35.149, lng: -90.048 });
  const [driverMarkers, setDriverMarkers] = useState<any[]>([]);
  const [destinationMarker, setDestinationMarker] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showFinishScreen, setShowFinishScreen] = useState(false);
  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Parse orderId from query params
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');

    // In a real app, fetch order details by orderId here.
    // For now, generate a mock order data consistent with Order type
    if (orderId) {
      const mockOrder: Order = {
        id: orderId,
        status: 'processing',
        estimatedDelivery: deliveryTime,
        items: [
          { name: '2 Gallons Regular Unleaded', quantity: '1x', price: 7.34 },
          { name: 'Chocolate cookies', quantity: '2x', price: 3.5 }
        ],
        total: 10.84,
        licensePlate: 'TN-56A782',
        driver: dedicatedDriver,
        progress: 0,
        statusDetails: 'Order received',
        driverLocation: driverLocation,
      };
      setOrder(mockOrder);

      // Setup markers for driver and destination
      setDriverMarkers([{
        position: driverLocation,
        title: dedicatedDriver.name,
        icon: dedicatedDriver.image
      }]);
      setDestinationMarker([{
        position: { lat: 35.146, lng: -90.052 },
        title: 'Your Location',
        icon: '/lovable-uploads/bd7d3e2c-d8cc-4ae3-b3f6-e23f3527fa24.png'
      }]);
    }
  }, [location.search, driverLocation]);

  // Progress status updates and driver movement effects (simulate)
  useEffect(() => {
    if (!order) return;
    let currentStep = 0;
    const statuses = [
      { status: 'processing', progress: 0, statusDetails: 'Order received' },
      { status: 'processing', progress: 20, statusDetails: 'Processing your order' },
      { status: 'in-transit', progress: 40, statusDetails: 'Driver on the way to pickup' },
      { status: 'in-transit', progress: 60, statusDetails: 'Fuel picked up, headed your way' },
      { status: 'in-transit', progress: 80, statusDetails: 'Almost at your location' },
      { status: 'delivered', progress: 100, statusDetails: 'Delivery complete!' },
    ];

    const progressTimer = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(progressTimer);
        return;
      }
      if (currentStep < statuses.length) {
        setOrder((prev) => {
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
          setOrderComplete(true);
          setShowConfirmModal(true);
        }
      } else {
        clearInterval(progressTimer);
      }
    }, 5000);

    return () => clearInterval(progressTimer);
  }, [order]);

  useEffect(() => {
    if (!order) return;
    if (orderComplete && isMounted.current) {
      const finishTimer = setTimeout(() => {
        toast({
          title: 'Service Complete',
          description: 'Your Fuel Friend has finished pumping gas and delivered your groceries!',
          duration: 2000,
          className: 'bg-green-500 border-green-600 text-white',
        });
        setShowFinishScreen(true);
      }, 2000);
      return () => clearTimeout(finishTimer);
    }
  }, [orderComplete, toast]);

  useEffect(() => {
    if (!order) return;
    // Simulate driver movement toward destination
    const moveInterval = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(moveInterval);
        return;
      }
      // Move driver location slightly towards destination
      const destination = { lat: 35.146, lng: -90.052 };
      const { lat, lng } = driverLocation;

      const newLat = lat + (destination.lat - lat) * 0.05;
      const newLng = lng + (destination.lng - lng) * 0.05;
      const newLocation = { lat: newLat, lng: newLng };

      setDriverLocation(newLocation);
      setDriverMarkers([{
        position: newLocation,
        title: dedicatedDriver.name,
        icon: dedicatedDriver.image,
      }]);
      setOrder(prev => prev ? { ...prev, driverLocation: newLocation } : prev);
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [driverLocation, order]);

  const handleCall = () => {
    if (!order) return;
    navigate(`/call?fuelFriendName=${encodeURIComponent(order.driver.name)}`);
  };

  const handleMessage = () => {
    if (!order) return;
    navigate(`/chat?fuelFriendName=${encodeURIComponent(order.driver.name)}`);
  };

  const handleOrderConfirm = () => {
    setShowConfirmModal(false);
    toast({
      title: 'Order Confirmed',
      description: 'Your payment has been processed successfully.',
      duration: 3000,
      className: 'bg-green-500 border-green-600 text-white',
    });
    setTimeout(() => {
      setShowRatingModal(true);
    }, 1000);
  };

  const handleRatingSubmit = (driverRating: number, stationRating: number, feedback: string) => {
    setShowRatingModal(false);
    setShowFinishScreen(true);
    toast({
      title: 'Thank You for Your Feedback',
      description: 'Your ratings have been submitted.',
      duration: 3000,
    });
    setTimeout(() => {
      navigate('/');
    }, 5000);
  };

  if (showFinishScreen) {
    return (
      <motion.div
        className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
        >
          <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <motion.h1
          className="text-2xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Order Complete
        </motion.h1>
        <motion.p
          className="text-gray-400 text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Thank you for using our service. Your payment has been processed successfully.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center w-full"
        >
          <p className="text-gray-400 mb-1">Order ID: {order?.id}</p>
          <p className="text-gray-400 mb-4">Amount: ${(order?.total + 3.99).toFixed(2)}</p>
          <div className="flex justify-center mt-4">
            <Link to="/" className="inline-block">
              <button className="px-6 py-3 bg-green-500 text-black rounded-xl font-medium">
                Return to Home
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-6">
        <p>Loading order details...</p>
      </div>
    );
  }

  const status = order.status;
  const progress = order.progress;
  const statusDetails = order.statusDetails;

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-500';
    switch (status) {
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
  const getStatusName = (status: string | undefined) => {
    if (!status) return 'Unknown';
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'in-transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white">
      <div className="relative px-4 py-3 flex items-center justify-center">
        <Link to="/orders" className="absolute left-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-800">
            <ChevronLeft className="h-6 w-6" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Track Fuel Friend</h1>
      </div>

      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
            <span className="font-medium">{getStatusName(status)}</span>
          </div>
          <span className="text-sm text-gray-400">{order.id}</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <motion.div
            className={`h-2 rounded-full ${getStatusColor(status)}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-gray-400 text-sm">{statusDetails}</p>
      </div>

      <div className={`${isMobile ? 'h-[350px]' : 'h-[300px]'} mb-4 mt-2 relative`}>
        <Map
          className="w-full h-full"
          markers={[...driverMarkers, ...destinationMarker]}
          directions={true}
          showRoute={true}
          interactive={true}
          zoom={14}
        />
      </div>

      <div className="px-4 py-2 bg-black relative">
        <div className="flex items-center mb-6">
          <div className="mr-3">
            <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center border-2 border-white text-black overflow-hidden">
              <img
                src={order.driver.image}
                alt={order.driver.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{order.driver.name}</h3>
            <p className="text-gray-400">{order.driver.location}</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-400 text-xs">Vehicle: {order.driver.vehicle}</p>
              <p className="text-gray-400 text-xs">License: {order.licensePlate}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleMessage} className="h-12 w-12 p-0 rounded-full bg-green-500 hover:bg-green-600">
              <MessageSquare className="h-6 w-6 mx-auto text-black" />
            </button>
            <button onClick={handleCall} className="h-12 w-12 p-0 rounded-full bg-green-500 hover:bg-green-600">
              <Phone className="h-6 w-6 mx-auto text-black" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-gray-400 mb-1">Your Fuel Friend Will Arrive</h4>
          <p className="font-semibold text-white text-lg">Estimated {order.estimatedDelivery}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 ${progress >= 20 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}
              >
                <MapPin className={`h-4 w-4 ${progress >= 20 ? 'text-black' : 'text-gray-400'}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Assigned</p>
            </div>
            <div className="flex-1 mx-1 h-0.5">
              <div
                className={`h-0.5 w-full border-t-2 border-dashed ${
                  progress >= 40 ? 'border-green-500' : 'border-gray-700'
                }`}
              />
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 ${progress >= 40 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}
              >
                <svg
                  className={`h-4 w-4 ${progress >= 40 ? 'text-black' : 'text-gray-400'}`}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5M20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3M3 6v9h.76c.55-.61 1.35-1 2.24-1 .89 0 1.69.39 2.24 1H15V6H3z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400 mt-1">At Station</p>
            </div>
            <div className="flex-1 mx-1 h-0.5">
              <div
                className={`h-0.5 w-full border-t-2 border-dashed ${
                  progress >= 80 ? 'border-green-500' : 'border-gray-700'
                }`}
              />
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 ${progress >= 80 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}
              >
                <svg
                  className={`h-4 w-4 ${progress >= 80 ? 'text-black' : 'text-gray-400'}`}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M18 10a1 1 0 0 1-1-1 1 1 0 0 1 1-1 1 1 0 0 1 1 1 1 1 0 0 1-1 1m-6 0H6V5h6m7.77 2.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11C16.17 7 15.5 7.93 15.5 9a2.5 2.5 0 0 0 2.5 2.5c.36 0 .69-.08 1-.21v7.21a1 1 0 0 1-1 1 1 1 0 0 1-1-1V14a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2H6c-1.11 0-2 .89-2 2v16h10v-7.5h1.5v5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5V9c0-.69-.28-1.32-.73-1.77M12 10H6V9h6m0-2H6V7h6M6 19v-3h5v3H6m0-4.5V19h-1v-4.5"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400 mt-1">Pumping</p>
            </div>
            <div className="flex-1 mx-1 h-0.5">
              <div
                className={`h-0.5 w-full border-t-2 border-dashed ${
                  progress >= 100 ? 'border-green-500' : 'border-gray-700'
                }`}
              />
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 ${progress >= 100 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}
              >
                <Check className={`h-4 w-4 ${progress >= 100 ? 'text-black' : 'text-gray-400'}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Complete</p>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <OrderConfirmModal
          onConfirm={handleOrderConfirm}
          orderTotal={order.total}
          serviceFee={3.99}
          driverName={order.driver.name}
          licensePlate={order.licensePlate}
          items={order.items}
        />
      )}

      {showRatingModal && (
        <RatingModal
          driverName={order.driver.name}
          stationName="Memphis Fuel Station"
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default TrackOrder;

