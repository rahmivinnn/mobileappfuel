import React, { useState, useEffect, useRef } from "react";

// Add lastMarkerUpdate to window object
declare global {
  interface Window {
    lastMarkerUpdate?: number;
  }
}
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, MessageSquare, ChevronLeft, Clock, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Map from "@/components/ui/Map";
import { MAPBOX_STYLE, MAP_STYLES } from '@/config/mapbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
  status: "job-accepted" | "processing" | "in-transit" | "delivered";
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
  customerName?: string;
  customerLocation?: { lat: number; lng: number };
}

const dedicatedDriver: Driver = {
  name: "Cristopert Dastin",
  location: "Tennessee",
  image: "/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png",
  rating: 4.8,
  phone: "+1 (901) 555-3478",
  vehicle: "White Toyota Camry",
};

const TrackOrder: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [order, setOrder] = useState<Order | null>(null);
  const [showJobStartedModal, setShowJobStartedModal] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number }>({
    lat: 3.1390,
    lng: 101.6869,
  });
  const [driverMarkers, setDriverMarkers] = useState<any[]>([]);
  const [destinationMarker, setDestinationMarker] = useState<any[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES.STREETS);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Setup order & markers
    const customerLocation = { lat: 35.146, lng: -90.052 };
    const mockOrder: Order = {
      id: "123",
      status: "job-accepted",
      estimatedDelivery: "7:15 - 7:45 PM",
      items: [
        { name: "2 Gallons Regular Unleaded", quantity: "1x", price: 7.34 },
        { name: "Chocolate cookies", quantity: "2x", price: 3.5 },
      ],
      total: 10.84,
      pickupLocation: "Shell Station- Abc Town",
      dropoffLocation: "Shell Station- Abc Town",
      orderType: "Fuel delivery",
      licensePlate: "TN-56A782",
      driver: dedicatedDriver,
      progress: 0,
      statusDetails: "Job Accepted",
      driverLocation,
      customerName: "Michael Johnson",
      customerLocation
    };
    setOrder(mockOrder);
    setDriverMarkers([
      {
        position: driverLocation,
        title: dedicatedDriver.name,
        icon: dedicatedDriver.image,
      },
    ]);
    setDestinationMarker([
      {
        position: customerLocation,
        title: "Customer",
        icon: "/lovable-uploads/bd7d3e2c-d8cc-4ae3-b3f6-e23f3527fa24.png",
      },
    ]);
  }, []);

  // Simulate driver movement & status update once job starts (modal closed)
  useEffect(() => {
    if (!order || order.status !== "processing") return;

    let currentStep = 0;
    type StatusType = "processing" | "in-transit" | "delivered";
    const statuses: { status: StatusType; progress: number; statusDetails: string }[] = [
      { status: "processing", progress: 10, statusDetails: "Order received" },
      { status: "processing", progress: 30, statusDetails: "Processing your order" },
      { status: "in-transit", progress: 50, statusDetails: "Driver on the way to pickup" },
      { status: "in-transit", progress: 80, statusDetails: "Fuel picked up, headed your way" },
      { status: "delivered", progress: 100, statusDetails: "Delivery complete!" },
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
    if (!order || order.status === "job-accepted") return;

    const destination = order.customerLocation || { lat: 35.146, lng: -90.052 };
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
      const newLat = lat + deltaLat * 0.03; // Slower movement
      const newLng = lng + deltaLng * 0.03; // Slower movement
      const newLocation = { lat: newLat, lng: newLng };

      if (newLat !== lat || newLng !== lng) {
        // Batch all updates together to prevent multiple re-renders
        setDriverLocation(newLocation);
        setDriverMarkers([
          {
            position: newLocation,
            title: dedicatedDriver.name,
            icon: dedicatedDriver.image,
          },
        ]);
        setOrder((prev) => (prev ? { ...prev, driverLocation: newLocation } : prev));
      }
    }, 8000); // Very slow updates to prevent flickering

    return () => clearInterval(moveInterval);
  }, [order?.status]); // Remove driverLocation from dependencies to prevent re-renders

  const handleStartTracking = () => {
    setShowJobStartedModal(false);
    setOrder((prev) =>
      prev ? {
        ...prev,
        status: "processing",
        statusDetails: "Order started",
        progress: 10
      } : prev
    );
    toast({
      title: "Order is now being processed",
      description: "You can track your order in real-time",
    });
  };

  const handleCall = () => {
    if (!order) return;
    navigate(`/call?fuelFriendName=${encodeURIComponent(order.driver.name)}`);
  };

  const handleMessage = () => {
    if (!order) return;
    navigate(`/chat?fuelFriendName=${encodeURIComponent(order.driver.name)}`);
  };

  // Colors for the progress bar according to the status
  const progressColor = () => {
    switch (order?.status) {
      case "job-accepted":
        return "bg-gray-500";
      case "processing":
        return "bg-blue-500";
      case "in-transit":
        return "bg-[#00E676]";
      case "delivered":
        return "bg-[#00C853]";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch(order?.status) {
      case "job-accepted":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "in-transit":
        return <Navigation className="h-5 w-5 text-[#00E676]" />;
      case "delivered":
        return <MapPin className="h-5 w-5 text-[#00C853]" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F1117]">
      {/* Header */}
      <motion.header
        className="flex items-center h-[60px] px-4 border-b border-[#262A34] bg-[#151822] z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <motion.button
          aria-label="Back"
          onClick={() => navigate("/orders")}
          className="p-2 rounded-full hover:bg-[#262A34] transition-all duration-300"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(38, 42, 52, 0.8)" }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="h-6 w-6 text-[#d6bcfa]" />
        </motion.button>
        <motion.h1
          className="flex-grow text-center font-semibold text-lg text-[#d6bcfa]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Track Order
        </motion.h1>
        <motion.button
          onClick={() => setShowOrderDetails(true)}
          className="p-2 rounded-full bg-[#262A34] text-[#d6bcfa] hover:bg-[#2a2e3d] transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Clock className="h-5 w-5" />
        </motion.button>
      </motion.header>

      {/* Enhanced Job Started Modal */}
      <Dialog open={showJobStartedModal} onOpenChange={setShowJobStartedModal}>
        <DialogContent className="bg-[#151822] border-[#262A34] text-white max-w-md w-[95%] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-[#d6bcfa]">
              New Order Accepted!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Track your customer's order in real-time for a smooth delivery experience
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-5 my-4">
            <motion.div
              className="w-20 h-20 rounded-full bg-[#00E676] flex items-center justify-center ring-4 ring-[#00E676]/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </motion.svg>
            </motion.div>

            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="w-full bg-[#1A1F2C] border-[#262A34] shadow-xl hover:shadow-[#262A34]/20 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Customer Info */}
                    <motion.div
                      className="flex items-center space-x-3 pb-3 border-b border-[#262A34]"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div
                        className="h-12 w-12 rounded-full bg-[#262A34] flex items-center justify-center"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(214, 188, 250, 0.2)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-[#d6bcfa]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </motion.div>
                      <div>
                        <p className="text-sm text-gray-400">Customer</p>
                        <p className="font-semibold">{order?.customerName || "Michael Johnson"}</p>
                      </div>
                    </motion.div>

                  {/* Order Details */}
                  <div className="space-y-3 text-sm">
                    <motion.div
                      className="flex space-x-2"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div>
                        <MapPin className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                      </div>
                      <div>
                        <p className="text-gray-400">Pickup Location</p>
                        <p className="font-medium">{order?.pickupLocation}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex space-x-2"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div>
                        <MapPin className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                      </div>
                      <div>
                        <p className="text-gray-400">Drop off Location</p>
                        <p className="font-medium">{order?.dropoffLocation}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex space-x-2"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        transition={{ type: "spring" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#00E676] flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </motion.div>
                      <div>
                        <p className="text-gray-400">Order Type</p>
                        <p className="font-medium">{order?.orderType}</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <motion.button
                  onClick={handleStartTracking}
                  className="w-full bg-[#00E676] text-black font-bold py-3.5 rounded-lg hover:bg-[#00C853] transition-all duration-300 shadow-lg hover:shadow-[#00E676]/20"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  Start Tracking
                </motion.button>
              </CardFooter>
            </Card>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Drawer */}
      <Drawer open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DrawerContent className="bg-[#151822] border-t border-[#262A34]">
          <DrawerHeader>
            <DrawerTitle className="text-[#d6bcfa] text-center">Order Details</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 py-2 space-y-4">
            {order && (
              <>
                <div className="rounded-lg bg-[#1A1F2C] p-4 border border-[#262A34]">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Order ID</h3>
                  <p className="font-medium">#{order.id}</p>
                </div>

                <div className="rounded-lg bg-[#1A1F2C] p-4 border border-[#262A34]">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <p>{item.quantity} {item.name}</p>
                        <p>${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#262A34] flex justify-between font-semibold">
                    <p>Total</p>
                    <p>${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-[#1A1F2C] p-4 border border-[#26A34]">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Delivery Info</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex space-x-2">
                      <MapPin className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Pickup</p>
                        <p className="font-medium">{order.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <MapPin className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Dropoff</p>
                        <p className="font-medium">{order.dropoffLocation}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Clock className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Estimated Delivery</p>
                        <p className="font-medium">{order.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DrawerFooter>
            <button
              onClick={() => setShowOrderDetails(false)}
              className="w-full bg-[#262A34] text-white py-3 rounded-lg hover:bg-[#1e2235] transition-colors"
            >
              Close
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Interactive map with driver info panel */}
      <main className="flex-grow relative">
        <Map
          className="w-full h-full"
          markers={[...driverMarkers, ...destinationMarker]}
          directions
          showRoute
          interactive
          zoom={14}
          showTraffic={showTraffic}
          mapStyle={currentMapStyle}
          onStyleChange={(style) => {
            setCurrentMapStyle(style);
            toast({
              title: "Map Style Changed",
              description: `Map style updated to ${Object.keys(MAP_STYLES).find(key => MAP_STYLES[key as keyof typeof MAP_STYLES] === style)?.replace(/_/g, ' ') || 'new style'}`
            });
          }}
          onTrafficToggle={(show) => {
            // Hanya update state tanpa toast
            setShowTraffic(show);
          }}
        />

        {/* Enhanced Driver Info Panel */}
        {!showJobStartedModal && order && (
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.3 }}
          >
            <div className="bg-gradient-to-t from-[#151822] via-[#151822]/95 to-transparent pt-10 px-4 pb-6">
              {/* Progress bar and status */}
              <motion.div
                className="mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div>
                      {getStatusIcon()}
                    </div>
                    <p className="font-semibold text-white">{order.statusDetails}</p>
                  </div>
                  <motion.p
                    className="text-sm text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {order.estimatedDelivery}
                  </motion.p>
                </div>

                <div className="w-full h-2 rounded-full bg-[#262A34] overflow-hidden">
                  <div
                    style={{ width: `${order.progress}%` }}
                    className={`h-2 rounded-full ${progressColor()} transition-all duration-1000 ease-in-out`}
                  />
                </div>
              </motion.div>

              {/* Driver card */}
              <motion.div
                className="bg-[#1A1F2C] rounded-2xl p-4 shadow-lg border border-[#262A34] hover:shadow-[#262A34]/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(45deg, #00E676, #00C853)",
                          filter: "blur(4px)",
                          zIndex: -1,
                        }}
                      />
                      <img
                        src={order.driver.image}
                        alt={order.driver.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#00E676]"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00E676] flex items-center justify-center"
                      >
                        <span className="text-xs font-bold text-black">{order.driver.rating}</span>
                      </div>
                    </motion.div>
                    <div>
                      <p className="font-semibold text-white">
                        {order.driver.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {order.driver.vehicle}
                      </p>
                      <p className="text-xs text-[#00E676]">
                        {order.licensePlate}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleMessage}
                      aria-label={`Message ${order.driver.name}`}
                      className="w-12 h-12 rounded-full bg-[#262A34] border border-[#403d49] hover:bg-[#2a3049] hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                      <MessageSquare className="h-5 w-5 text-[#d6bcfa]" />
                    </button>
                    <button
                      onClick={handleCall}
                      aria-label={`Call ${order.driver.name}`}
                      className="w-12 h-12 rounded-full bg-[#00E676] hover:bg-[#00C853] hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                      <Phone className="h-5 w-5 text-black" />
                    </button>
                  </div>
                </div>

                {/* Customer card - Minimized */}
                <div
                  className="mt-4 bg-[#262A34] rounded-xl p-3 flex items-center hover:bg-[#2a2e3d] transition-all duration-200"
                >
                  <div
                    className="h-10 w-10 rounded-full bg-[#363C4B] flex items-center justify-center mr-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#d6bcfa]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Customer</p>
                    <p className="font-medium text-white">{order.customerName}</p>
                  </div>
                  <div>
                    <MapPin className="h-5 w-5 text-[#00E676]" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Traffic and weather indicators */}
        <AnimatePresence>
          {!showJobStartedModal && (
            <motion.div
              className="absolute top-4 left-4 flex flex-col space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-black/80 backdrop-blur-md rounded-xl p-3 border-2 border-blue-500 shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-sm text-white text-center font-bold mb-1 border-b border-blue-500 pb-2">TRAFFIC INFO</div>
                <div className="flex items-center space-x-2 px-2 py-1">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-white">Light traffic</span>
                </div>
                <div className="flex items-center space-x-2 px-2 py-1">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-white">Moderate traffic</span>
                </div>
                <div className="flex items-center space-x-2 px-2 py-1">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-white">Heavy traffic</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-black/80 backdrop-blur-md rounded-xl p-3 border-2 border-purple-500 shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-sm text-white text-center font-bold mb-1 border-b border-purple-500 pb-2">ARRIVAL TIME</div>
                <div className="text-center text-xl font-bold text-green-500 mt-2">{order?.estimatedDelivery}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TrackOrder;
