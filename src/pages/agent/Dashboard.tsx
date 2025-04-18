
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, User, MapPin, Clock, DollarSign, MessageSquare, 
  PlayCircle, PauseCircle, ChevronRight, RefreshCw, Search,
  Check, X, AlertTriangle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/layout/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);
  const [orderTimer, setOrderTimer] = useState(30);
  const [activeTab, setActiveTab] = useState('incoming');
  
  // Mock data
  const pendingOrders = [
    {
      id: 'ORD-1234',
      customerName: 'John Smith',
      fuelType: 'Regular Unleaded',
      quantity: '10 gallons',
      address: '123 Main St, Memphis, TN',
      distance: '2.5 miles',
      eta: '12 mins',
      earnings: '$25.50'
    },
    {
      id: 'ORD-5678',
      customerName: 'Sarah Johnson',
      fuelType: 'Premium Unleaded',
      quantity: '15 gallons',
      address: '456 Oak Ave, Memphis, TN',
      distance: '3.8 miles',
      eta: '18 mins',
      earnings: '$38.75'
    }
  ];
  
  const activeOrders = [
    {
      id: 'ORD-9012',
      customerName: 'Michael Brown',
      fuelType: 'Diesel',
      quantity: '20 gallons',
      address: '789 Pine Rd, Memphis, TN',
      distance: '1.2 miles',
      eta: '5 mins',
      earnings: '$42.00',
      status: 'en-route'
    }
  ];
  
  const completedOrders = [
    {
      id: 'ORD-3456',
      customerName: 'Lisa Williams',
      fuelType: 'Regular Unleaded',
      quantity: '8 gallons',
      address: '321 Elm St, Memphis, TN',
      earnings: '$22.40',
      completedAt: '2023-04-18T14:30:00'
    }
  ];

  // Simulate incoming order
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        setIncomingOrder({
          id: 'ORD-7890',
          customerName: 'Robert Davis',
          fuelType: 'Premium Unleaded',
          quantity: '12 gallons',
          address: '567 Maple Dr, Memphis, TN',
          distance: '4.2 miles',
          eta: '20 mins',
          earnings: '$32.60'
        });
        
        toast({
          title: "New Order Request!",
          description: "You have a new delivery request",
          variant: "default",
        });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, toast]);

  // Countdown timer for order acceptance
  useEffect(() => {
    let interval: any;
    
    if (incomingOrder && orderTimer > 0) {
      interval = setInterval(() => {
        setOrderTimer((prev) => prev - 1);
      }, 1000);
    } else if (orderTimer === 0 && incomingOrder) {
      setIncomingOrder(null);
      setOrderTimer(30);
      
      toast({
        title: "Order Expired",
        description: "The order request has timed out",
        variant: "destructive",
      });
    }
    
    return () => clearInterval(interval);
  }, [incomingOrder, orderTimer, toast]);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    
    toast({
      title: isOnline ? "You're now offline" : "You're now online",
      description: isOnline 
        ? "You won't receive any new orders" 
        : "You'll start receiving order requests",
      variant: "default",
    });
  };

  const acceptOrder = (order: any) => {
    setIncomingOrder(null);
    setOrderTimer(30);
    
    // Add to active orders
    activeOrders.unshift({
      ...order,
      status: 'accepted'
    });
    
    toast({
      title: "Order Accepted!",
      description: `You've accepted delivery for ${order.customerName}`,
      variant: "default",
    });
    
    // Navigate to order details
    navigate(`/agent/order/${order.id}`);
  };

  const rejectOrder = () => {
    setIncomingOrder(null);
    setOrderTimer(30);
    
    toast({
      title: "Order Rejected",
      description: "You've declined this delivery request",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Agent Dashboard" showBack={false} />
      
      {/* Online/Offline Toggle */}
      <div className="px-4 py-3 flex items-center justify-between bg-card rounded-b-xl">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-green-500">
            <AvatarImage src="/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png" />
            <AvatarFallback className="bg-green-500/20">AG</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">Christopher Dastin</h3>
            <div className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span className="text-xs text-muted-foreground">{isOnline ? 'Active' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          <Switch checked={isOnline} onCheckedChange={toggleOnlineStatus} />
        </div>
      </div>
      
      {/* Incoming Order Popup */}
      {incomingOrder && (
        <motion.div 
          className="mx-4 my-3 p-4 bg-card rounded-xl border border-green-500/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">New Delivery Request</h3>
            <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
              <span className="font-semibold">{orderTimer}</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{incomingOrder.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{incomingOrder.address}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span>{incomingOrder.fuelType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{incomingOrder.eta}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-semibold">{incomingOrder.earnings}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2"
              onClick={rejectOrder}
            >
              <X className="h-4 w-4" />
              <span>Decline</span>
            </button>
            <button 
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg flex items-center justify-center gap-2"
              onClick={() => acceptOrder(incomingOrder)}
            >
              <Check className="h-4 w-4" />
              <span>Accept</span>
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Orders Tab Navigation */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex border-b border-border">
          <button
            className={`px-4 py-2 relative ${activeTab === 'incoming' ? 'text-green-500' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('incoming')}
          >
            Incoming
            {pendingOrders.length > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-green-500 text-xs text-black flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
            {activeTab === 'incoming' && (
              <motion.div 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"
                layoutId="tabIndicator"
              />
            )}
          </button>
          <button
            className={`px-4 py-2 relative ${activeTab === 'active' ? 'text-green-500' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('active')}
          >
            Active
            {activeOrders.length > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-black flex items-center justify-center">
                {activeOrders.length}
              </span>
            )}
            {activeTab === 'active' && (
              <motion.div 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"
                layoutId="tabIndicator"
              />
            )}
          </button>
          <button
            className={`px-4 py-2 relative ${activeTab === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
            {activeTab === 'completed' && (
              <motion.div 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"
                layoutId="tabIndicator"
              />
            )}
          </button>
        </div>
      </div>
      
      {/* Search Box */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders by ID or customer name"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-input"
          />
        </div>
      </div>
      
      {/* Order Lists based on active tab */}
      <motion.div 
        className="pb-24 px-4"
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'incoming' && (
          <>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No incoming orders at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="bg-card border border-border rounded-xl p-4"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => acceptOrder(order)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{order.customerName}</h3>
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.address}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.eta}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-semibold">{order.earnings}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        {order.distance} away
                      </div>
                      <button className="text-xs flex items-center text-green-500">
                        Accept <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'active' && (
          <>
            {activeOrders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No active deliveries at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="bg-card border border-border rounded-xl p-4"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/agent/order/${order.id}`)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{order.customerName}</h3>
                      <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full">
                        {order.status === 'en-route' ? 'En Route' : 'Active'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.address}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.eta}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-semibold">{order.earnings}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        {order.distance} away
                      </div>
                      <button className="text-xs flex items-center text-blue-500">
                        View Details <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'completed' && (
          <>
            {completedOrders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No completed deliveries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="bg-card border border-border rounded-xl p-4"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/agent/order/${order.id}`)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{order.customerName}</h3>
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.address}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-semibold">{order.earnings}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.completedAt).toLocaleDateString()}
                      </div>
                      <button className="text-xs flex items-center text-green-500">
                        View Details <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
      
      <BottomNav />
    </div>
  );
};

export default Dashboard;
