
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Clock, MapPin, Star, ChevronRight,
  Check, History, Phone, MessageSquare
} from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Customer mock data
const mockCustomers = [
  {
    id: 'CUST-1234',
    name: 'John Smith',
    phone: '+1 (901) 555-3210',
    address: '123 Main St, Memphis, TN',
    lastOrder: '2 days ago',
    orderCount: 7,
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=John',
    status: 'active',
    rating: 4.8
  },
  {
    id: 'CUST-5678',
    name: 'Sarah Johnson',
    phone: '+1 (901) 555-8742',
    address: '456 Oak Ave, Memphis, TN',
    lastOrder: '1 week ago',
    orderCount: 3,
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Sarah',
    status: 'pending',
    rating: 4.5
  },
  {
    id: 'CUST-9012',
    name: 'Michael Brown',
    phone: '+1 (901) 555-6321',
    address: '789 Pine Rd, Memphis, TN',
    lastOrder: '3 hours ago',
    orderCount: 12,
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Michael',
    status: 'active',
    rating: 5.0
  },
  {
    id: 'CUST-3456',
    name: 'Lisa Williams',
    phone: '+1 (901) 555-9874',
    address: '321 Elm St, Memphis, TN',
    lastOrder: 'Just now',
    orderCount: 1,
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Lisa',
    status: 'new',
    rating: 4.0
  }
];

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Filter customers based on search query and filter
  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      customer.address.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'active') return customer.status === 'active';
    if (filter === 'new') return customer.status === 'new';
    if (filter === 'pending') return customer.status === 'pending';
    
    return true;
  });

  const handleCustomerClick = (customerId: string) => {
    navigate(`/agent/customer/${customerId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="My Customers" showBack={false} />
      
      {/* Search and Filter */}
      <div className="px-4 pt-2 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search customers by name or address..."
            className="pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            className="rounded-full text-xs px-4"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'} 
            className="rounded-full text-xs px-4"
            onClick={() => setFilter('active')}
          >
            <Check className="h-3 w-3 mr-1" /> Active
          </Button>
          <Button 
            variant={filter === 'new' ? 'default' : 'outline'} 
            className="rounded-full text-xs px-4"
            onClick={() => setFilter('new')}
          >
            New
          </Button>
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'} 
            className="rounded-full text-xs px-4"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
        </div>
      </div>
      
      {/* Customer List */}
      <div className="px-4 pb-24">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No customers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                className="bg-card border border-border rounded-xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCustomerClick(customer.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{customer.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{customer.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <History className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{customer.orderCount} orders</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Last: {customer.lastOrder}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Customers;
