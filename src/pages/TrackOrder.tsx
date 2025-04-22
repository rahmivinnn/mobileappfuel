
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, MessageSquare, ChevronLeft, Clock, MapIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Map from "@/components/ui/Map";
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
    lat: 35.149,
    lng: -90.048,
  });
  const [driverMarkers, setDriverMarkers] = useState<any[]>([]);
  const [destinationMarker, setDestinationMarker] = useState<any[]>([]);

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
      const newLat = lat + deltaLat * 0.07;
      const newLng = lng + deltaLng * 0.07;
      const newLocation = { lat: newLat, lng: newLng };

      if (newLat !== lat || newLng !== lng) {
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
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [driverLocation, order?.status]);

  const handleStartTracking = () => {
    setShowJobStartedModal(false);
    setOrder((prev) =>
      prev ? { ...prev, status: "processing", statusDetails: "Order started", progress: 10 } : prev
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
        return <MapIcon className="h-5 w-5 text-[#00E676]" />;
      case "delivered":
        return <MapPin className="h-5 w-5 text-[#00C853]" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-dark-purple text-white">
      {/* Header */}
      <header className="flex items-center h-[60px] px-4 border-b border-[#403d49] bg-[#1A1F2C] z-10">
        <button
          aria-label="Back"
          onClick={() => navigate("/orders")}
          className="p-2 rounded-full hover:bg-[#333a57] transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-[#d6bcfa]" />
        </button>
        <h1 className="flex-grow text-center font-semibold text-lg text-[#d6bcfa]">Track Order</h1>
        <div className="w-10" /> {/* placeholder for right side spacing */}
      </header>

      {/* Enhanced Job Started Modal */}
      <Dialog open={showJobStartedModal} onOpenChange={setShowJobStartedModal}>
        <DialogContent className="bg-[#15172B] border-[#403d49] text-white max-w-md w-[95%]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center text-[#d6bcfa]">
              New Order Accepted!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Track your customer's order in real-time for a smooth delivery experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-5 my-4">
            <div className="w-20 h-20 rounded-full bg-[#00E676] flex items-center justify-center ring-4 ring-[#00E676]/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <Card className="w-full bg-[#1e2235] border-[#403d49]">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Customer Info */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-[#403d49]">
                    <div className="h-12 w-12 rounded-full bg-[#403d49] flex items-center justify-center">
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
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Customer</p>
                      <p className="font-semibold">{order?.customerName || "Michael Johnson"}</p>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex space-x-2">
                      <MapPin className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                      <div>
                        <p className="text-gray-400">Pickup Location</p>
                        <p className="font-medium">{order?.pickupLocation}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <MapPin className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                      <div>
                        <p className="text-gray-400">Drop off Location</p>
                        <p className="font-medium">{order?.dropoffLocation}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
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
                      <div>
                        <p className="text-gray-400">Order Type</p>
                        <p className="font-medium">{order?.orderType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <button
                  onClick={handleStartTracking}
                  className="w-full bg-[#00E676] text-black font-medium py-3 rounded-full hover:bg-[#00C853] transition-colors"
                >
                  Start Tracking Now
                </button>
              </CardFooter>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive map with driver info panel */}
      <main className="flex-grow relative">
        <Map
          className="w-full h-full"
          markers={[...driverMarkers, ...destinationMarker]}
          directions
          showRoute
          interactive
          zoom={14}
        />

        {/* Enhanced Driver Info Panel */}
        {!showJobStartedModal && order && (
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 bg-gradient-to-t from-[#15172B] via-[#15172B]/95 to-transparent">
            <div className="max-w-lg mx-auto bg-[#252e42] rounded-3xl p-5 shadow-lg border border-[#403d49] backdrop-blur-md">
              {/* Customer Info */}
              <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[#403d49]">
                <div className="h-12 w-12 rounded-full bg-[#403d49] flex items-center justify-center">
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
                </div>
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="font-semibold">{order?.customerName || "Michael Johnson"}</p>
                </div>
              </div>
              
              {/* Status and Progress */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <p className="font-semibold">{order.statusDetails}</p>
                </div>
                <p className="text-sm">{order.estimatedDelivery}</p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#1e2235] overflow-hidden mb-4">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${progressColor()}`}
                  style={{ width: `${order.progress}%` }}
                />
              </div>

              {/* Driver Info and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={order.driver.image}
                    alt={order.driver.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#00E676]"
                  />
                  <div>
                    <p className="font-semibold">{order.driver.name}</p>
                    <p className="text-sm text-gray-400">{order.driver.vehicle}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleMessage}
                    aria-label={`Message ${order.driver.name}`}
                    className="w-12 h-12 rounded-full bg-[#1e2235] border border-[#403d49] hover:bg-[#2a3049] flex items-center justify-center"
                  >
                    <MessageSquare className="h-6 w-6 text-[#d6bcfa]" />
                  </button>
                  <button
                    onClick={handleCall}
                    aria-label={`Call ${order.driver.name}`}
                    className="w-12 h-12 rounded-full bg-[#00E676] hover:bg-[#00C853] flex items-center justify-center"
                  >
                    <Phone className="h-6 w-6 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackOrder;
