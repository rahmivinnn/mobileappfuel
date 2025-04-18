
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Home, MapPin, Settings, Calendar, Clock, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/layout/BottomNav';

const orders = [
  {
    id: 'ORD-1234',
    date: '2023-09-15',
    time: '14:30',
    stationName: 'Shell Gas Station',
    items: [
      { name: 'Regular Unleaded', quantity: '5 Gallons', price: 18.95 },
      { name: 'Snickers', quantity: '2x', price: 3.50 }
    ],
    total: 22.45,
    status: 'delivered',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ORD-1235',
    date: '2023-09-12',
    time: '10:15',
    stationName: 'ExxonMobil',
    items: [
      { name: 'Premium Unleaded', quantity: '10 Gallons', price: 45.80 }
    ],
    total: 45.80,
    status: 'delivered',
    paymentMethod: 'PayPal',
  },
  {
    id: 'ORD-1236',
    date: '2023-09-10',
    time: '16:45',
    stationName: 'Chevron',
    items: [
      { name: 'Diesel', quantity: '8 Gallons', price: 34.40 },
      { name: 'Coffee', quantity: '1x', price: 2.50 },
      { name: 'Chips', quantity: '1x', price: 1.99 }
    ],
    total: 38.89,
    status: 'delivered',
    paymentMethod: 'Credit Card',
  }
];

const OrderHistory: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState(orders);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filter));
    }
  }, [filter]);

  return (
    <div className="min-h-screen bg-black pb-20 max-w-md mx-auto text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-green-500 rounded-full h-10 w-10 mr-3">
            <ShoppingBag className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-xl font-bold">My Orders</h1>
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-black border border-gray-800">
          <Filter className="h-5 w-5" />
        </button>
      </div>
      
      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}
          >
            All Orders
          </button>
          <button 
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'processing' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}
          >
            Processing
          </button>
          <button 
            onClick={() => setFilter('in-transit')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'in-transit' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}
          >
            In Transit
          </button>
          <button 
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'delivered' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}
          >
            Delivered
          </button>
        </div>
      </div>
      
      {/* Orders List */}
      <div className="px-4 space-y-4">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 rounded-xl p-4 border border-gray-800"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{order.id}</h3>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{order.time}</span>
                </div>
              </div>
              <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-medium">
                {order.status === 'delivered' ? 'Delivered' : 
                 order.status === 'in-transit' ? 'In Transit' : 'Processing'}
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-3 pb-2">
              <p className="text-sm font-medium mb-2">{order.stationName}</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.quantity} {item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-800 pt-2 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-400">Total</span>
                <p className="font-semibold">${order.total.toFixed(2)}</p>
              </div>
              <Link 
                to={`/track?orderId=${order.id}`} 
                className="flex items-center text-green-500 text-sm font-medium"
              >
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </motion.div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-400">You don't have any {filter !== 'all' ? filter : ''} orders yet.</p>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default OrderHistory;
