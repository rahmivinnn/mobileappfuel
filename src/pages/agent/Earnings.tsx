
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, ChevronLeft, ChevronRight, Download, 
  TrendingUp, Package, Clock, ArrowUp, ArrowDown 
} from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Earnings: React.FC = () => {
  const { toast } = useToast();
  const [currentPeriod, setCurrentPeriod] = useState('This Week');
  const [selectedTab, setSelectedTab] = useState('summary');
  
  // Mock data for earnings
  const earningsData = {
    today: {
      total: 78.50,
      deliveries: 3,
      hours: 2.5,
      breakdown: [
        { id: 'ORD-7654', time: '3:15 PM', amount: 32.75 },
        { id: 'ORD-5432', time: '5:45 PM', amount: 24.50 },
        { id: 'ORD-3210', time: '7:30 PM', amount: 21.25 }
      ]
    },
    week: {
      total: 423.75,
      deliveries: 16,
      hours: 14.5,
      breakdown: [
        { day: 'Monday', amount: 75.25 },
        { day: 'Tuesday', amount: 58.50 },
        { day: 'Wednesday', amount: 97.25 },
        { day: 'Thursday', amount: 78.50 },
        { day: 'Friday', amount: 114.25 },
        { day: 'Saturday', amount: 0 },
        { day: 'Sunday', amount: 0 }
      ]
    },
    month: {
      total: 1825.50,
      deliveries: 67,
      hours: 62,
      breakdown: [
        { week: 'Week 1', amount: 432.75 },
        { week: 'Week 2', amount: 512.50 },
        { week: 'Week 3', amount: 423.75 },
        { week: 'Week 4', amount: 456.50 }
      ]
    }
  };

  // Helper function to determine the data to display based on current period
  const getDisplayData = () => {
    switch(currentPeriod) {
      case 'Today':
        return earningsData.today;
      case 'This Week':
        return earningsData.week;
      case 'This Month':
        return earningsData.month;
      default:
        return earningsData.week;
    }
  };

  const handlePeriodChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      switch(currentPeriod) {
        case 'Today':
          setCurrentPeriod('Yesterday');
          break;
        case 'This Week':
          setCurrentPeriod('Last Week');
          break;
        case 'This Month':
          setCurrentPeriod('Last Month');
          break;
        default:
          // Do nothing for now
          break;
      }
    } else {
      switch(currentPeriod) {
        case 'Yesterday':
          setCurrentPeriod('Today');
          break;
        case 'Last Week':
          setCurrentPeriod('This Week');
          break;
        case 'Last Month':
          setCurrentPeriod('This Month');
          break;
        default:
          // Do nothing for now
          break;
      }
    }
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: `Your ${currentPeriod.toLowerCase()} earnings report has been downloaded`,
    });
  };

  const displayData = getDisplayData();

  return (
    <div className="min-h-screen bg-background">
      <Header title="My Earnings" showBack={false} />
      
      {/* Period Selector */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <button 
            className="h-10 w-10 rounded-full bg-card flex items-center justify-center"
            onClick={() => handlePeriodChange('prev')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <span className="font-medium">{currentPeriod}</span>
          </div>
          
          <button 
            className="h-10 w-10 rounded-full bg-card flex items-center justify-center"
            onClick={() => handlePeriodChange('next')}
            disabled={['Today', 'This Week', 'This Month'].includes(currentPeriod)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Earnings Overview Card */}
      <div className="px-4">
        <motion.div 
          className="bg-card rounded-xl p-6 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Total Earnings</p>
            <h1 className="text-4xl font-bold text-green-500">
              ${displayData.total.toFixed(2)}
            </h1>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Deliveries</p>
              <div className="flex items-center justify-center gap-1">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-lg font-semibold">{displayData.deliveries}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Hours</p>
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-lg font-semibold">{displayData.hours}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              className="rounded-full flex items-center gap-2"
              onClick={handleDownloadReport}
            >
              <Download className="h-4 w-4" /> Download Report
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Tabs for Earnings Details */}
      <div className="px-4 mt-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="pt-2">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Earnings Breakdown</h3>
                <div className="space-y-3">
                  {currentPeriod.includes('Week') && displayData.breakdown.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.day}</span>
                      <span className="font-medium">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {currentPeriod.includes('Month') && displayData.breakdown.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.week}</span>
                      <span className="font-medium">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {currentPeriod.includes('Today') || currentPeriod.includes('Yesterday') ? (
                    displayData.breakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.id}</span>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                        <span className="font-medium">${item.amount.toFixed(2)}</span>
                      </div>
                    ))
                  ) : null}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-green-500">${displayData.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Performance Insights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg. Per Delivery</p>
                    <p className="font-medium">${(displayData.total / displayData.deliveries).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg. Per Hour</p>
                    <p className="font-medium">${(displayData.total / displayData.hours).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-2">
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {displayData.breakdown.map((item: any, index: number) => {
                const isDaily = 'time' in item;
                
                return (
                  <div key={index} className="bg-card p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        {isDaily ? (
                          <>
                            <h4 className="font-medium">{item.id}</h4>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </>
                        ) : (
                          <h4 className="font-medium">{item.day || item.week}</h4>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-green-500">${item.amount.toFixed(2)}</span>
                        <ArrowUp className="h-4 w-4 text-green-500 ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {displayData.breakdown.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transactions for this period</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="stats" className="pt-2">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Performance Metrics</h3>
                <div className="space-y-4">
                  {/* Acceptance Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm">Order Acceptance Rate</p>
                      <p className="text-sm font-medium">92%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  {/* On-Time Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm">On-Time Delivery Rate</p>
                      <p className="text-sm font-medium">98%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  
                  {/* Customer Rating */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm">Average Customer Rating</p>
                      <p className="text-sm font-medium">4.9/5.0</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Activity Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Hours</p>
                    <p className="font-medium">{displayData.hours}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Miles</p>
                    <p className="font-medium">124.5 mi</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Gallons Delivered</p>
                    <p className="font-medium">352 gal</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg. Time Per Order</p>
                    <p className="font-medium">25 mins</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Earnings Comparison</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>vs. Previous {currentPeriod.split(' ')[1]}</span>
                    <div className="flex items-center gap-1 text-green-500">
                      <ArrowUp className="h-4 w-4" />
                      <span>12.5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>vs. Platform Average</span>
                    <div className="flex items-center gap-1 text-green-500">
                      <ArrowUp className="h-4 w-4" />
                      <span>8.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="pb-24"></div>
      <BottomNav />
    </div>
  );
};

export default Earnings;
