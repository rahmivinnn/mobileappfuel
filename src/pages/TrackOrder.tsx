import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, ChevronLeft, Check, ArrowLeft, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { orderHistory } from '@/data/dummyData';
import { useIsMobile } from '@/hooks/use-mobile';
import RatingModal from '@/components/ui/RatingModal';
import OrderConfirmModal from '@/components/ui/OrderConfirmModal';
import Map from '@/components/ui/Map';
import AgentBottomNav from '@/components/layout/AgentBottomNav';

interface TrackOrderProps {
  agentView?: boolean;
}

const memphisLicensePlates = ["TN-56A782"];

const dedicatedDriver = {
  name: "Christopher Dastin",
  location: "Memphis, TN", 
  image: "/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png", 
  rating: 4.8, 
  phone: "+1 (901) 555-3478",
  vehicle: "White Toyota Camry"
};

const deliveryTime = "7:15 - 7:45 PM";

const driverAvatar = (
  <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center border-2 border-white text-black overflow-hidden">
    <img
      src={dedicatedDriver.image}
      alt={dedicatedDriver.name}
      className="h-full w-full object-cover"
    />
  </div>
);

interface OrderDetails {
  id: string;
  status: string;
  estimatedDelivery: string;
  items: {
    name: string;
    quantity: string;
    price: number;
  }[];
  total: number;
  licensePlate: string;
  driver: {
    name: string;
    location: string;
    image: string;
    rating: number;
    phone: string;
    vehicle: string;
  };
  progress: number;
  statusDetails: string;
  driverLocation: { lat: number; lng: number };
}

interface AgentOrderDetails extends OrderDetails {
  customerName: string;
  address: string;
  eta: string;
}

const defaultOrder: OrderDetails = {
  id: 'ORD-1234',
  status: 'processing',
  estimatedDelivery: deliveryTime,
  items: [
    { name: '2 Gallons Regular Unleaded', quantity: '1x', price: 7.34 },
    { name: 'Chocolate cookies', quantity: '2x', price: 3.50 }
  ],
  total: 10.84,
  licensePlate: memphisLicensePlates[0],
  driver: dedicatedDriver,
  progress: 0,
  statusDetails: 'Order received',
  driverLocation: { lat: 35.149, lng: -90.048 }
};

const defaultAgentOrder: AgentOrderDetails = {
  ...defaultOrder,
  customerName: 'John Smith',
  address: '123 Main St, Memphis, TN',
  eta: '5 mins'
};

const driverMessages = [
  "I'm on my way to your location!",
  "I'll be there in about 5 minutes.",
  "I'm nearby, please prepare for arrival.",
  "I've arrived at your location.",
  "Is there a specific place you'd like me to meet you?",
  "Thank you for using our service!"
];

const TrackOrder: React.FC<TrackOrderProps> = ({ agentView = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [order, setOrder] = useState<OrderDetails | AgentOrderDetails>(agentView ? defaultAgentOrder : defaultOrder);
  const [orderComplete, setOrderComplete] = useState(false);
  const [driverLocation, setDriverLocation] = useState({ lat: 35.149, lng: -90.048 });
  const [showDirections, setShowDirections] = useState(true);
  const [routeColor, setRouteColor] = useState('#4ade80');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinishScreen, setShowFinishScreen] = useState(false);
  const [driverMarkers, setDriverMarkers] = useState<any[]>([]);
  const [destinationMarker, setDestinationMarker] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  
  const [driverArrived, setDriverArrived] = useState(false);
  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    
    if (orderId) {
      try {
        const foundOrder = orderHistory.find(o => o.id === orderId);
        
        if (foundOrder) {
          const initialDriverLocation = {
            lat: 35.149 + (Math.random() - 0.5) * 0.01,
            lng: -90.048 + (Math.random() - 0.5) * 0.01
          };
          
          setDriverLocation(initialDriverLocation);
          setDriverMarkers([{
            position: initialDriverLocation,
            title: dedicatedDriver.name,
            icon: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png'
          }]);
          
          setDestinationMarker([{
            position: { lat: 35.146, lng: -90.052 },
            title: "Your Location",
            icon: '/lovable-uploads/bd7d3e2c-d8cc-4ae3-b3f6-e23f3527fa24.png'
          }]);
          
          if (isMounted.current) {
            if (agentView) {
              setOrder({
                ...defaultAgentOrder,
                id: foundOrder.id || defaultAgentOrder.id,
                status: foundOrder.status || defaultAgentOrder.status,
                estimatedDelivery: deliveryTime,
                items: foundOrder.items || defaultAgentOrder.items,
                total: parseFloat(foundOrder.totalPrice) || defaultAgentOrder.total,
                driverLocation: initialDriverLocation
              });
            } else {
              setOrder({
                ...defaultOrder,
                id: foundOrder.id || defaultOrder.id,
                status: foundOrder.status || defaultOrder.status,
                estimatedDelivery: deliveryTime,
                items: foundOrder.items || defaultOrder.items,
                total: parseFloat(foundOrder.totalPrice) || defaultOrder.total,
                driverLocation: initialDriverLocation
              });
            }
          }
        } else {
          console.log(`Order ${orderId} not found, using default`);
          if (isMounted.current) {
            setOrder(agentView ? defaultAgentOrder : defaultOrder);
          }
        }
      } catch (error) {
        console.error("Error processing order data:", error);
        if (isMounted.current) {
          setOrder(agentView ? defaultAgentOrder : defaultOrder);
          toast({
            title: "Error",
            description: "Could not load order details",
            duration: 3000,
            variant: "destructive"
          });
        }
      }
    } else {
      if (isMounted.current) {
        setOrder(agentView ? defaultAgentOrder : defaultOrder);
      }
    }
    
    const statuses = [
      { status: 'processing', progress: 0, statusDetails: 'Order received' },
      { status: 'processing', progress: 20, statusDetails: 'Processing your order' },
      { status: 'in-transit', progress: 40, statusDetails: 'Driver on the way to pickup' },
      { status: 'in-transit', progress: 60, statusDetails: 'Fuel picked up, headed your way' },
      { status: 'in-transit', progress: 80, statusDetails: 'Almost at your location' },
      { status: 'delivered', progress: 100, statusDetails: 'Delivery complete!' }
    ];
    
    let currentStep = 0;
    
    const statusTimer = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(statusTimer);
        return;
      }
      
      if (currentStep < statuses.length) {
        setOrder(prevOrder => {
          const safeOrder = prevOrder || {...defaultOrder};
          return {
            ...safeOrder,
            status: statuses[currentStep].status,
            progress: statuses[currentStep].progress,
            statusDetails: statuses[currentStep].statusDetails
          };
        });
        
        if (statuses[currentStep].status === 'processing') {
          setRouteColor('#facc15');
        } else if (statuses[currentStep].status === 'in-transit') {
          setRouteColor('#4ade80');
        } else if (statuses[currentStep].status === 'delivered') {
          setRouteColor('#3b82f6');
        }
        
        if (isMounted.current) {
          toast({
            title: "Order Update",
            description: statuses[currentStep].statusDetails,
            duration: 3000
          });
        }
        
        if (currentStep === statuses.length - 1) {
          if (isMounted.current) {
            setOrderComplete(true);
            setDriverArrived(true);
          }
          
          setTimeout(() => {
            if (isMounted.current) {
              toast({
                title: "Delivery Complete!",
                description: "Your order has been successfully delivered.",
                duration: 2000,
                className: "bg-green-500 border-green-600 text-white"
              });
            
              setTimeout(() => {
                if (isMounted.current) {
                  setShowConfirmModal(true);
                }
              }, 1500);
            }
          }, 1000);
        }
        
        currentStep++;
      } else {
        clearInterval(statusTimer);
      }
    }, 5000);

    const messageTimer = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(messageTimer);
        return;
      }
      
      if (!orderComplete) {
        const randomMessage = driverMessages[Math.floor(Math.random() * driverMessages.length)];
        
        if (isMounted.current) {
          toast({
            title: `Message from ${dedicatedDriver.name}`,
            description: randomMessage,
            duration: 3000,
            className: "bg-blue-500 border-blue-600 text-white"
          });
        }
      }
    }, Math.floor(Math.random() * 15000) + 15000);

    return () => {
      clearInterval(statusTimer);
      clearInterval(messageTimer);
    };
  }, [location.search, toast, navigate, orderComplete, agentView]);

  useEffect(() => {
    const movementInterval = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(movementInterval);
        return;
      }
      
      const destination = { lat: 35.146, lng: -90.052 };
      const currentLocation = driverLocation;
      
      const newDriverLocation = {
        lat: currentLocation.lat + (destination.lat - currentLocation.lat) * 0.05,
        lng: currentLocation.lng + (destination.lng - currentLocation.lng) * 0.05
      };
      
      setDriverLocation(newDriverLocation);
      setDriverMarkers([{
        position: newDriverLocation,
        title: dedicatedDriver.name,
        icon: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png'
      }]);
      
      setOrder(prev => {
        const safeOrder = prev || {...defaultOrder};
        return {
          ...safeOrder,
          driverLocation: newDriverLocation
        };
      });
    }, 3000);
    
    return () => clearInterval(movementInterval);
  }, [driverLocation]);

  useEffect(() => {
    if (orderComplete && isMounted.current) {
      const arrivalTimer = setTimeout(() => {
        if (isMounted.current) {
          toast({
            title: "Service Complete",
            description: "Your Fuel Friend has finished pumping gas and delivered your groceries!",
            duration: 2000,
            className: "bg-green-500 border-green-600 text-white"
          });
        }
      }, 2000);
      
      return () => clearTimeout(arrivalTimer);
    }
  }, [orderComplete, toast]);

  const handleCall = () => {
    navigate(`/call?fuelFriendName=${encodeURIComponent(dedicatedDriver.name)}`);
  };

  const handleMessage = () => {
    navigate(`/chat?fuelFriendName=${encodeURIComponent(dedicatedDriver.name)}`);
  };

  const handleOrderConfirm = () => {
    setShowConfirmModal(false);
    toast({
      title: "Order Confirmed",
      description: "Your payment has been processed successfully.",
      duration: 3000,
      className: "bg-green-500 border-green-600 text-white"
    });
    
    setTimeout(() => {
      if (isMounted.current) {
        setShowRatingModal(true);
      }
    }, 1000);
  };

  const handleRatingSubmit = (driverRating: number, stationRating: number, feedback: string) => {
    setShowRatingModal(false);
    if (isMounted.current) {
      setShowFinishScreen(true);
    }
    
    toast({
      title: "Thank You for Your Feedback",
      description: "Your ratings have been submitted.",
      duration: 3000,
    });
    
    setTimeout(() => {
      if (isMounted.current) {
        navigate('/');
      }
    }, 5000);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-500';
    
    switch(status) {
      case 'processing': return 'bg-yellow-500';
      case 'in-transit': return 'bg-green-500';
      case 'delivered': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusName = (status: string | undefined) => {
    if (!status) return 'Unknown';
    
    switch(status) {
      case 'processing': return 'Processing';
      case 'in-transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const status = order?.status ?? 'processing';
  const progress = order?.progress ?? 0;
  const statusDetails = order?.statusDetails ?? 'Processing your order';
  const driverPhone = dedicatedDriver.phone ?? '+1 (901) 555-1234';
  const licensePlate = order?.licensePlate ?? 'TN-XXXXX';
  const estimatedDelivery = order?.estimatedDelivery ?? 'Soon';
  const orderItems = order?.items ?? [];
  const orderTotal = order?.total ?? 0;
  const orderId = order?.id ?? 'ORD-XXXX';

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
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
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
          <p className="text-gray-400 mb-1">Order ID: {orderId}</p>
          <p className="text-gray-400 mb-4">Amount: ${(orderTotal + 3.99).toFixed(2)}</p>
          
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

  if (agentView) {
    const agentOrderDetails = order as AgentOrderDetails;
    
    return (
      <div className="fixed inset-0 flex flex-col bg-black text-white">
        <div className="relative px-4 py-3 flex items-center justify-center">
          <button 
            className="absolute left-4 h-10 w-10 flex items-center justify-center rounded-full bg-gray-800"
            onClick={() => navigate('/agent/dashboard')}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Agent Tracking View</h1>
        </div>
        
        <div className="px-4 py-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
              <span className="font-medium">{getStatusName(status)}</span>
            </div>
            <span className="text-sm text-gray-400">{orderId}</span>
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
              <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white text-white overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${agentOrderDetails.customerName || "Customer"}`}
                  alt="Customer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{agentOrderDetails.customerName || "Customer"}</h3>
              <p className="text-gray-400">{agentOrderDetails.address || "Customer location"}</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-400 text-xs">Order #{orderId}</p>
                <p className="text-gray-400 text-xs">ETA: {agentOrderDetails.eta || "Calculating..."}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleMessage}
                className="h-12 w-12 p-0 rounded-full bg-green-500 hover:bg-green-600"
              >
                <MessageSquare className="h-6 w-6 mx-auto text-black" />
              </button>
              <button 
                onClick={handleCall}
                className="h-12 w-12 p-0 rounded-full bg-green-500 hover:bg-green-600"
              >
                <Phone className="h-6 w-6 mx-auto text-black" />
              </button>
            </div>
          </div>
          
          <div className="mb-6 bg-gray-800 rounded-lg p-4">
            <h4 className="text-gray-300 mb-2 font-medium">Order Details</h4>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-medium">
                <span>Total Earnings</span>
                <span className="text-green-400">${orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${progress >= 20 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
                  <Truck className={`h-4 w-4 ${progress >= 20 ? 'text-black' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Assigned</p>
              </div>
              <div className="flex-1 mx-1 h-0.5">
                <div className={`h-0.5 w-full border-t-2 border-dashed ${progress >= 40 ? 'border-green-500' : 'border-gray-700'}`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${progress >= 40 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
                  <MapPin className={`h-4 w-4 ${progress >= 40 ? 'text-black' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs text-gray-400 mt-1">En Route</p>
              </div>
              <div className="flex-1 mx-1 h-0.5">
                <div className={`h-0.5 w-full border-t-2 border-dashed ${progress >= 80 ? 'border-green-500' : 'border-gray-700'}`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${progress >= 80 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
                  <svg className={`h-4 w-4 ${progress >= 80 ? 'text-black' : 'text-gray-400'}`} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18 10a1 1 0 0 1-1-1 1 1 0 0 1 1-1 1 1 0 0 1 1 1 1 1 0 0 1-1 1m-6 0H6V5h6m7.77 2.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11C16.17 7 15.5 7.93 15.5 9a2.5 2.5 0 0 0 2.5 2.5c.36 0 .69-.08 1-.21v7.21a1 1 0 0 1-1 1 1 1 0 0 1-1-1V14a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2H6c-1.11 0-2 .89-2 2v16h10v-7.5h1.5v5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5V9c0-.69-.28-1.32-.73-1.77M12 10H6V9h6m0-2H6V7h6M6 19v-3h5v3H6m0-4.5V19h-1v-4.5"/>
                  </svg>
                </div>
                <p className="text-xs text-gray-400 mt-1">Fueling</p>
              </div>
              <div className="flex-1 mx-1 h-0.5">
                <div className={`h-0.5 w-full border-t-2 border-dashed ${progress >= 100 ? 'border-green-500' : 'border-gray-700'}`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${progress >= 100 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
                  <Check className={`h-4 w-4 ${progress >= 100 ? 'text-black' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Done</p>
              </div>
            </div>
          </div>
          
          {progress < 100 && (
            <button 
              onClick={() => {
                toast({
                  title: "Status Updated",
                  description: "You've advanced the order status",
                });
                setOrder({
                  ...order,
                  progress: Math.min(100, progress + 20),
                  status: progress >= 80 ? 'delivered' : progress >= 40 ? 'in-transit' : 'processing',
                });
              }}
              className="w-full py-3 bg-green-500 text-black rounded-lg font-medium mb-20"
            >
              {progress < 40 ? "Start Delivery" : 
               progress < 80 ? "Arrived at Location" : 
               progress < 100 ? "Complete Fueling" : "Complete Delivery"}
            </button>
          )}
        </div>
        
        <AgentBottomNav />
      </div>
    );
  }

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
          <span className="text-sm text-gray-400">{orderId}</span>
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
            {driverAvatar}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{dedicatedDriver.name}</h3>
            <p className="text-gray-400">{dedicatedDriver.location}</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-400 text-xs">Vehicle: {dedicatedDriver.vehicle}</p>
              <p className="text-gray-400 text-xs">License: {licensePlate}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleMessage}
              className="h-12 w-12 p-0 rounded-full bg-green-500 hover:bg-green-600"
            >
              <MessageSquare className="h-6 w-6 mx-auto text-black" />
            </button>
            <button 
              onClick={handleCall}
              className="h-12 w-12 p-0 rounded-full bg-green-500 hover:bg-green-600"
            >
              <Phone className="h-6 w-6 mx-auto text-black" />
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-gray-400 mb-1">Your Fuel Friend Will Arrive</h4>
          <p className="font-semibold text-white text-lg">Estimated {estimatedDelivery}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${progress >= 20 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
                <MapPin className={`h-4 w-4 ${progress >= 20 ? 'text-black' : 'text-gray-400'}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Assigned</p>
            </div>
            <div className="flex-1 mx-1 h-0.5">
              <div className={`h-0.5 w-full border-t-2 border-dashed ${progress >= 40 ? 'border-green-500' : 'border-gray-700'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${progress >= 40 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
                <svg className={`h-4 w-4 ${progress >= 40 ? 'text-black' : 'text-gray-400'}`} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18 10a1 1 0 0 1-1-1 1 1 0 0 1 1-1 1 1 0 0 1 1 1 1 1 0 0 1-1 1m-6 0H6V5h6m7.77 2.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11C16.17 7 15.5 7.93 15.5 9a2.5 2.5 0 0 0 2.5 2.5c.36 0 .69-.08 1-.21v7.21a1 1 0 0 1-1 1 1 1 0 0 1-1-1V14a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2H6c-1.11 0-2 .89-2 2v16h10v-7.5h1.5v5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5V9c0-.69-.28-1.32-.73-1.77M12 10H6V9h6m0-2H6V7h6M6 19v-3h5v3H6m0-4.5V19h-1v-4.5"/>
                </svg>
              </div>
              <p className="text-xs text-gray-400 mt-1">At Station</p>
            </div>
            <div className="flex-1 mx-1 h-0.5">
              <div className={`h-0.5 w-full border-t-2 border-dashed ${progress >= 80 ? 'border-green-500' : 'border-gray-700'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${progress >= 80 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
                <svg className={`h-4 w-4 ${progress >= 80 ? 'text-black' : 'text-gray-400'}`} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18 10a1 1 0 0 1-1-1 1 1 0 0 1 1-1 1 1 0 0 1 1 1 1 1 0 0 1-1 1m-6 0H6V5h6m7.77 2.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11C16.17 7 15.5 7.93 15.5 9a2.5 2.5 0 0 0 2.5 2.5c.36 0 .69-.08 1-.21v7.21a1 1 0 0 1-1 1 1 1 0 0 1-1-1V14a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2H6c-1.11 0-2 .89-2 2v16h10v-7.5h1.5v5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5V9c0-.69-.28-1.32-.73-1.77M12 10H6V9h6m0-2H6V7h6M6 19v-3h5v3H6m0-4.5V19h-1v-4.5"/>
                </svg>
              </div>
              <p className="text-xs text-gray-400 mt-1">Pumping</p>
            </div>
            <div className="flex-1 mx-1 h-0.5">
              <div className={`h-0.5 w-full border-t-2 border-dashed ${progress >= 100 ? 'border-green-500' : 'border-gray-700'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${progress >= 100 ? 'bg-green-500' : 'bg-gray-700'} rounded-full flex items-center justify-center`}>
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
          orderTotal={orderTotal}
          serviceFee={3.99}
          driverName={dedicatedDriver.name}
          licensePlate={licensePlate}
          items={orderItems}
        />
      )}
      
      {showRatingModal && (
        <RatingModal 
          driverName={dedicatedDriver.name}
          stationName="Memphis Fuel Station"
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default TrackOrder;
