
import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Target, Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/layout/BottomNav';

interface Order {
  id: string;
  date: string;
  pickupLocation: string;
  dropoffLocation: string;
  orderType: string;
  status: 'pending' | 'active' | 'cancelled' | 'completed';
}

const initialOrderRequests: Order[] = [
  {
    id: '1',
    date: '25/03/2025',
    pickupLocation: 'Shell Station- Abc Town',
    dropoffLocation: 'Shell Station- Abc Town',
    orderType: 'Fuel delivery',
    status: 'pending',
  },
  {
    id: '2',
    date: '25/03/2025',
    pickupLocation: 'Shell Station- Abc Town',
    dropoffLocation: 'Shell Station- Abc Town',
    orderType: 'Fuel delivery',
    status: 'pending',
  },
];

const initialCurrentOrders: Order[] = [
  {
    id: '123',
    date: '25/03/2025',
    pickupLocation: 'Shell Station- Tennessee',
    dropoffLocation: 'Shell Station- Tennessee',
    orderType: 'Fuel',
    status: 'active',
  },
  {
    id: '124',
    date: '25/03/2025',
    pickupLocation: 'Shell Station- Tennessee',
    dropoffLocation: 'Shell Station- Tennessee',
    orderType: 'Fuel',
    status: 'active',
  },
];

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();

  const [orderRequests, setOrderRequests] = useState<Order[]>(initialOrderRequests);
  const [currentOrders, setCurrentOrders] = useState<Order[]>(initialCurrentOrders);

  const handleCancelJob = (orderId: string) => {
    setOrderRequests((prev) => prev.filter((order) => order.id !== orderId));
    alert(`Order #${orderId} cancelled.`);
  };

  const handleAcceptJob = (orderId: string) => {
    const acceptedOrder = orderRequests.find((order) => order.id === orderId);
    if (!acceptedOrder) return;
    setOrderRequests((prev) => prev.filter((order) => order.id !== orderId));
    setCurrentOrders((prev) => [...prev, { ...acceptedOrder, status: 'active' }]);
    alert(`Order #${orderId} accepted.`);
  };

  const handleCall = (orderId: string) => {
    alert(`Calling customer for order #${orderId}...`);
  };

  const handleMessage = (orderId: string) => {
    alert(`Messaging customer for order #${orderId}...`);
  };

  const handleTrack = (orderId: string) => {
    navigate(`/track?orderId=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white max-w-md mx-auto pb-20 px-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <h1 className="text-2xl font-bold">Order Requests</h1>
        <button
          onClick={() => alert('See all order requests - Not implemented')}
          className="text-green-500 hover:underline"
        >
          See all
        </button>
      </div>

      {/* Order Requests */}
      {orderRequests.length === 0 ? (
        <p className="text-gray-400 mb-6">No pending order requests.</p>
      ) : (
        orderRequests.map((order) => (
          <div
            key={order.id}
            className="bg-gray-900 rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                <p className="text-sm text-gray-400">{order.date}</p>
              </div>
              <span className="bg-yellow-600 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
                Pending
              </span>
            </div>
            <div className="space-y-1 mb-4 text-sm text-gray-300">
              <p className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-red-500" /> Pickup: {order.pickupLocation}</p>
              <p className="flex items-center"><Target className="h-4 w-4 mr-1 text-red-400" /> Drop off: {order.dropoffLocation}</p>
              <p className="flex items-center"><Scissors className="h-4 w-4 mr-1 text-green-500" /> Order type: {order.orderType}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleCancelJob(order.id)}
                className="flex-1 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition text-center text-gray-300"
              >
                Cancel Job
              </button>
              <button
                onClick={() => handleAcceptJob(order.id)}
                className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition text-black font-semibold"
              >
                Accept Job
              </button>
            </div>
          </div>
        ))
      )}

      {/* Current Orders */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h1 className="text-2xl font-bold">Current orders</h1>
        <button
          onClick={() => alert('See all current orders - Not implemented')}
          className="text-green-500 hover:underline"
        >
          See all
        </button>
      </div>

      {currentOrders.length === 0 ? (
        <p className="text-gray-400">No current orders.</p>
      ) : (
        currentOrders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-900 rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                <p className="text-sm text-gray-400">{order.date}</p>
              </div>
              <span className="bg-blue-400 text-blue-900 text-xs font-semibold px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-1 mb-4 text-sm text-gray-300">
              <p className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-red-500" /> Pickup: {order.pickupLocation}</p>
              <p className="flex items-center"><Target className="h-4 w-4 mr-1 text-red-400" /> Drop off: {order.dropoffLocation}</p>
              <p className="flex items-center"><Scissors className="h-4 w-4 mr-1 text-green-500" /> Order type: {order.orderType}</p>
            </div>
            <div className="flex justify-between items-center space-x-4 text-green-500 text-sm font-semibold">
              <button
                onClick={() => handleCall(order.id)}
                className="flex items-center space-x-1 hover:underline"
                aria-label={`Call customer for order ${order.id}`}
              >
                <Phone className="h-5 w-5" />
                <span>Call</span>
              </button>
              <button
                onClick={() => handleMessage(order.id)}
                className="flex items-center space-x-1 hover:underline"
                aria-label={`Message customer for order ${order.id}`}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Message</span>
              </button>
              <button
                onClick={() => handleTrack(order.id)}
                className="py-2 px-4 bg-green-500 hover:bg-green-600 rounded-lg text-black font-semibold transition"
              >
                Track Customer
              </button>
            </div>
          </div>
        ))
      )}

      <BottomNav />
    </div>
  );
};

export default OrderHistory;
