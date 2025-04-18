
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PhoneCall, MessageCircle, MapPin, History, Star,
  Clock, ChevronRight, ChevronLeft, Package, Repeat,
  DollarSign, Activity, ArrowLeft, Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Map from '@/components/ui/Map';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mapMarker, setMapMarker] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      // Find customer by ID
      const mockCustomer = {
        id: id || 'CUST-1234',
        name: 'John Smith',
        phone: '+1 (901) 555-3210',
        address: '123 Main St, Memphis, TN',
        coordinates: { lat: 35.146, lng: -90.052 },
        email: 'john.smith@example.com',
        lastOrder: '2 days ago',
        orderCount: 7,
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=John',
        status: 'active',
        rating: 4.8,
        joinedDate: '2023-01-15',
        preferredFuelType: 'Regular Unleaded',
        averageOrderValue: '$36.50',
        notes: 'Customer prefers delivery in the evening. Has a large driveway that can accommodate any size vehicle.',
        paymentMethods: ['Credit Card', 'Cash'],
        orders: [
          {
            id: 'ORD-7654',
            date: '2023-04-16',
            status: 'completed',
            items: ['10 gal Regular Unleaded', '2x Snacks'],
            total: '$39.85'
          },
          {
            id: 'ORD-5432',
            date: '2023-04-09',
            status: 'completed',
            items: ['12 gal Premium Unleaded'],
            total: '$52.75'
          },
          {
            id: 'ORD-3210',
            date: '2023-03-28',
            status: 'completed',
            items: ['8 gal Regular Unleaded', '1x Water Bottle'],
            total: '$31.20'
          }
        ]
      };
      
      setCustomer(mockCustomer);
      
      // Set map marker for customer location
      if (mockCustomer.coordinates) {
        setMapMarker([{
          position: mockCustomer.coordinates,
          title: mockCustomer.name,
          icon: '/lovable-uploads/bd7d3e2c-d8cc-4ae3-b3f6-e23f3527fa24.png'
        }]);
      }
      
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleCall = () => {
    if (customer) {
      window.location.href = `tel:${customer.phone}`;
    }
  };

  const handleMessage = () => {
    if (customer) {
      navigate(`/chat?customerName=${encodeURIComponent(customer.name)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading customer data...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="font-bold text-xl mb-2">Customer Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the customer you're looking for.</p>
          <Button onClick={() => navigate('/agent/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
          onClick={() => navigate('/agent/customers')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
      
      {/* Top Section */}
      <div className="h-[25vh] relative bg-gradient-to-b from-green-500/20 to-background">
        <div className="absolute bottom-0 left-0 w-full p-4 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-green-500/50">
              <AvatarImage src={customer.avatar} />
              <AvatarFallback className="bg-green-500/20">{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{customer.name}</h1>
              <div className="flex items-center gap-1 mt-1">
                <span className={`h-2 w-2 rounded-full ${customer.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="text-xs text-muted-foreground capitalize">{customer.status} Customer</span>
              </div>
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
      </div>
      
      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card p-3 rounded-lg text-center">
            <div className="text-muted-foreground text-xs mb-1">Orders</div>
            <div className="font-bold text-lg">{customer.orderCount}</div>
          </div>
          <div className="bg-card p-3 rounded-lg text-center">
            <div className="text-muted-foreground text-xs mb-1">Rating</div>
            <div className="font-bold text-lg flex items-center justify-center gap-1">
              {customer.rating}<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            </div>
          </div>
          <div className="bg-card p-3 rounded-lg text-center">
            <div className="text-muted-foreground text-xs mb-1">Avg. Order</div>
            <div className="font-bold text-lg">{customer.averageOrderValue}</div>
          </div>
        </div>
      </div>
      
      {/* Tabs with Customer Details */}
      <div className="px-4">
        <Tabs defaultValue="info">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="pt-4">
            <div className="space-y-4">
              {/* Contact Information */}
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span>{customer.address}</span>
                      <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-border">
                        <Map 
                          className="h-full w-full"
                          markers={mapMarker}
                          zoom={13}
                          interactive={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preferences */}
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Preferences</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Preferred Fuel</p>
                    <p>{customer.preferredFuelType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Methods</p>
                    <p>{customer.paymentMethods.join(', ')}</p>
                  </div>
                </div>
              </div>
              
              {/* Account Information */}
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Account Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
                    <p>{customer.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Joined Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p>{customer.joinedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="pt-4">
            <div className="space-y-3">
              {customer.orders.map((order: any) => (
                <motion.div
                  key={order.id}
                  className="bg-card p-4 rounded-lg"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/agent/order/${order.id}`)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-500" />
                      <h3 className="font-medium">{order.id}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      order.status === 'in-progress' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {order.items.map((item: string, index: number) => (
                      <div key={index} className="text-sm text-muted-foreground">• {item}</div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{order.date}</span>
                    </div>
                    <span className="font-semibold text-sm">{order.total}</span>
                  </div>
                </motion.div>
              ))}
              
              {customer.orders.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="pt-4">
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-3">Customer Notes</h3>
              {customer.notes ? (
                <p className="text-sm">{customer.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No notes available for this customer.</p>
              )}
              
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Add New Note
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Action Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <Button 
          className="w-full py-6 bg-green-500 hover:bg-green-600 text-black font-medium text-lg"
          onClick={() => navigate('/agent/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetail;
