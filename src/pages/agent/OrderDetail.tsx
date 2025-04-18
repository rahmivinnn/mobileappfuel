
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PhoneCall, MessageCircle, MapPin, Clock, DollarSign, ChevronDown,
  CheckCircle, Circle, AlertTriangle, Droplets, ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Map from '@/components/ui/Map';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<any>({
    id: id || 'ORD-9012',
    customerName: 'Michael Brown',
    customerPhone: '+1 (901) 555-3210',
    fuelType: 'Diesel',
    quantity: '20 gallons',
    address: '789 Pine Rd, Memphis, TN',
    distance: '1.2 miles',
    eta: '5 mins',
    earnings: '$42.00',
    status: 'accepted',
    notes: 'Please text when you arrive. Vehicle is a blue Ford F-150, parked in the driveway.',
    customerLocation: { lat: 35.146, lng: -90.052 },
    agentLocation: { lat: 35.149, lng: -90.048 }
  });

  const [orderSteps, setOrderSteps] = useState([
    { id: 'accepted', label: 'Order Accepted', completed: true, current: false },
    { id: 'en-route', label: 'En Route', completed: false, current: true },
    { id: 'arrived', label: 'Arrived at Location', completed: false, current: false },
    { id: 'fueling', label: 'Fueling in Progress', completed: false, current: false },
    { id: 'completed', label: 'Delivery Completed', completed: false, current: false }
  ]);

  const [showNotes, setShowNotes] = useState(false);
  const [customerMarker, setCustomerMarker] = useState<any[]>([]);
  const [agentMarker, setAgentMarker] = useState<any[]>([]);
  
  // Initialize the map markers
  useEffect(() => {
    setCustomerMarker([{
      position: order.customerLocation,
      title: order.customerName,
      icon: '/lovable-uploads/bd7d3e2c-d8cc-4ae3-b3f6-e23f3527fa24.png'
    }]);
    
    setAgentMarker([{
      position: order.agentLocation,
      title: "Your Location",
      icon: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png'
    }]);
  }, [order.customerLocation, order.customerName, order.agentLocation]);

  // Simulate agent movement
  useEffect(() => {
    if (order.status === 'en-route') {
      const interval = setInterval(() => {
        // Move agent slightly closer to customer
        setOrder(prev => {
          const newAgentLocation = {
            lat: prev.agentLocation.lat + (prev.customerLocation.lat - prev.agentLocation.lat) * 0.1,
            lng: prev.agentLocation.lng + (prev.customerLocation.lng - prev.agentLocation.lng) * 0.1
          };
          
          // Update agent marker
          setAgentMarker([{
            position: newAgentLocation,
            title: "Your Location",
            icon: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png'
          }]);
          
          return {
            ...prev,
            agentLocation: newAgentLocation,
            distance: (prev.distance.split(' ')[0] * 0.9).toFixed(1) + ' miles',
            eta: Math.max(1, Math.floor(prev.eta.split(' ')[0] * 0.9)) + ' mins'
          };
        });
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [order.status]);

  const updateOrderStatus = (nextStatus: string) => {
    // Find the index of the next status
    const currentStepIndex = orderSteps.findIndex(step => step.id === nextStatus);
    
    if (currentStepIndex === -1) return;
    
    // Update order status
    setOrder({
      ...order,
      status: nextStatus
    });
    
    // Update order steps
    setOrderSteps(orderSteps.map((step, index) => {
      if (index < currentStepIndex) {
        return { ...step, completed: true, current: false };
      } else if (index === currentStepIndex) {
        return { ...step, completed: false, current: true };
      } else {
        return { ...step, completed: false, current: false };
      }
    }));
    
    // Show toast notification
    toast({
      title: "Status Updated",
      description: `Order status updated to ${nextStatus.replace(/-/g, ' ')}`,
    });
    
    // If completed, navigate to rating page after delay
    if (nextStatus === 'completed') {
      setTimeout(() => {
        navigate('/agent/delivery-complete', { 
          state: { orderId: order.id, earnings: order.earnings }
        });
      }, 2000);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${order.customerPhone}`;
  };

  const handleMessage = () => {
    navigate(`/chat?customerName=${encodeURIComponent(order.customerName)}`);
  };

  // Determine next action button based on current status
  const getNextActionButton = () => {
    const currentStep = orderSteps.find(step => step.current);
    if (!currentStep) return null;
    
    const currentIndex = orderSteps.findIndex(step => step.id === currentStep.id);
    const nextStep = orderSteps[currentIndex + 1];
    
    if (!nextStep) return null;
    
    let buttonText = '';
    let buttonIcon = null;
    
    switch (nextStep.id) {
      case 'en-route':
        buttonText = 'Start Navigation';
        buttonIcon = <MapPin className="h-4 w-4" />;
        break;
      case 'arrived':
        buttonText = 'Mark as Arrived';
        buttonIcon = <CheckCircle className="h-4 w-4" />;
        break;
      case 'fueling':
        buttonText = 'Start Fueling';
        buttonIcon = <Droplets className="h-4 w-4" />;
        break;
      case 'completed':
        buttonText = 'Complete Delivery';
        buttonIcon = <CheckCircle className="h-4 w-4" />;
        break;
      default:
        buttonText = 'Next Step';
        buttonIcon = <CheckCircle className="h-4 w-4" />;
    }
    
    return (
      <Button 
        className="w-full py-6 bg-green-500 hover:bg-green-600 text-black font-medium text-lg flex items-center gap-2 justify-center"
        onClick={() => updateOrderStatus(nextStep.id)}
      >
        {buttonIcon}
        {buttonText}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
          onClick={() => navigate('/agent/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
      
      {/* Map Section */}
      <div className="h-[40vh] relative">
        <Map 
          className="h-full"
          markers={[...customerMarker, ...agentMarker]}
          zoom={14}
          interactive={true}
          showRoute={true}
        />
        
        {/* Status Badge */}
        <div className="absolute bottom-4 left-4 bg-green-500 text-black px-3 py-1.5 rounded-full font-medium text-sm flex items-center">
          <span>{orderSteps.find(step => step.current)?.label}</span>
        </div>
      </div>
      
      {/* Customer Info Card */}
      <div className="p-4 bg-card rounded-t-xl -mt-5 relative z-10 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-green-500/30">
              <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${order.customerName}`} />
              <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold">{order.customerName}</h2>
              <p className="text-sm text-muted-foreground">Order #{order.id}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="h-10 w-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"
              onClick={handleMessage}
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button 
              className="h-10 w-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"
              onClick={handleCall}
            >
              <PhoneCall className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Address and ETA */}
        <div className="mt-4 bg-background p-3 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{order.address}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{order.eta}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">{order.earnings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Details */}
        <div className="mt-4 space-y-4">
          <div className="bg-background p-3 rounded-lg">
            <h3 className="font-medium mb-2">Order Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Fuel Type</p>
                <p className="font-medium">{order.fuelType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{order.quantity}</p>
              </div>
            </div>
          </div>
          
          {/* Notes Section (Expandable) */}
          <div className="bg-background p-3 rounded-lg">
            <button 
              className="w-full flex items-center justify-between"
              onClick={() => setShowNotes(!showNotes)}
            >
              <h3 className="font-medium">Customer Notes</h3>
              <ChevronDown className={`h-5 w-5 transition-transform ${showNotes ? 'rotate-180' : ''}`} />
            </button>
            
            {showNotes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 border-t border-border pt-2"
              >
                <p className="text-sm">{order.notes}</p>
              </motion.div>
            )}
          </div>
          
          {/* Delivery Progress */}
          <div className="bg-background p-3 rounded-lg">
            <h3 className="font-medium mb-3">Delivery Progress</h3>
            <div className="space-y-3">
              {orderSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  {step.completed ? (
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-black" />
                    </div>
                  ) : step.current ? (
                    <div className="h-6 w-6 rounded-full border-2 border-green-500 flex items-center justify-center animate-pulse">
                      <Circle className="h-4 w-4 text-green-500" fill="currentColor" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                      <Circle className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                  <span className={`text-sm ${
                    step.completed ? 'text-green-500' : 
                    step.current ? 'font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        {order.status === 'completed' ? (
          <Button 
            className="w-full py-6 bg-green-500 hover:bg-green-600 text-black font-medium text-lg"
            onClick={() => navigate('/agent/dashboard')}
          >
            Return to Dashboard
          </Button>
        ) : (
          getNextActionButton()
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
