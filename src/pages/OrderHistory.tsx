
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import AgentBottomNav from '@/components/layout/AgentBottomNav';
import { orderHistory } from '@/data/dummyData';

const agentOrderHistory = [
  {
    id: 'ORD-9012',
    customerName: 'Michael Brown',
    status: 'completed',
    date: '2023-04-18T16:30:00',
    location: '789 Pine Rd, Memphis, TN',
    fuelType: 'Diesel',
    totalPrice: '42.00',
    customerRating: 4.9,
    items: [
      { name: '20 Gallons Diesel', quantity: '1x', price: 42.00 }
    ]
  },
  {
    id: 'ORD-8765',
    customerName: 'Sarah Johnson',
    status: 'completed',
    date: '2023-04-17T14:15:00',
    location: '456 Oak Ave, Memphis, TN',
    fuelType: 'Premium Unleaded',
    totalPrice: '38.75',
    customerRating: 4.7,
    items: [
      { name: '15 Gallons Premium Unleaded', quantity: '1x', price: 38.75 }
    ]
  },
  {
    id: 'ORD-7654',
    customerName: 'David Wilson',
    status: 'cancelled',
    date: '2023-04-16T10:45:00',
    location: '234 Maple St, Memphis, TN',
    fuelType: 'Regular Unleaded',
    totalPrice: '27.50',
    customerRating: null,
    items: [
      { name: '10 Gallons Regular Unleaded', quantity: '1x', price: 27.50 }
    ]
  }
];

const OrderHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAgentView, setIsAgentView] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState<typeof orderHistory>([]);
  
  // Determine if we're in agent mode based on the URL path
  useEffect(() => {
    setIsAgentView(location.pathname.startsWith('/agent'));
  }, [location.pathname]);
  
  // Filter orders based on search term
  useEffect(() => {
    const orders = isAgentView ? agentOrderHistory : orderHistory;
    
    if (!searchTerm) {
      setFilteredOrders(orders);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(order => 
      order.id.toLowerCase().includes(lowerSearchTerm) || 
      (isAgentView && order.customerName?.toLowerCase().includes(lowerSearchTerm)) ||
      (!isAgentView && order.fuelType?.toLowerCase().includes(lowerSearchTerm)) ||
      order.status.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredOrders(filtered);
  }, [searchTerm, isAgentView]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-transit':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const handleOrderClick = (orderId: string) => {
    if (isAgentView) {
      navigate(`/agent/order/${orderId}`);
    } else {
      navigate(`/track?orderId=${orderId}`);
    }
  };

  const NoOrders = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <Clock className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium mb-1">No orders yet</h3>
      <p className="text-gray-500 text-sm">
        {isAgentView 
          ? "You haven't completed any deliveries yet" 
          : "You haven't placed any orders yet"}
      </p>
      {!isAgentView && (
        <button 
          className="mt-6 px-6 py-2 bg-green-500 text-black rounded-full font-medium"
          onClick={() => navigate('/')}
        >
          Order Now
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={isAgentView ? "Delivery History" : "My Orders"} 
        showBack={true} 
      />
      
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={isAgentView ? "Search orders by ID or customer" : "Search orders by ID or fuel type"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-input"
          />
          <button className="absolute right-3 top-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
      
      <div className="pb-24">
        {filteredOrders.length > 0 ? (
          <div className="space-y-3 p-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-lg border border-border p-4 shadow-sm"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{order.id}</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)} mr-2`}></div>
                    <span className="text-xs text-muted-foreground capitalize">{order.status}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <div>
                    {isAgentView ? (
                      <p className="font-semibold">{order.customerName}</p>
                    ) : (
                      <p>{order.fuelType}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.totalPrice}</p>
                    {isAgentView && order.customerRating && (
                      <div className="flex items-center text-xs text-yellow-500">
                        <svg className="h-3.5 w-3.5 fill-current mr-1" viewBox="0 0 20 20">
                          <path d="M10 13.18l-4.64 2.8 1.23-5.25-4.15-3.81 5.44-.48L10 1.21l2.12 5.23 5.44.48-4.15 3.81 1.23 5.25z"/>
                        </svg>
                        <span>{order.customerRating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate max-w-[70%]">
                    {order.location}
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <NoOrders />
        )}
      </div>
      
      {isAgentView ? <AgentBottomNav /> : <BottomNav />}
    </div>
  );
};

export default OrderHistory;
