
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Car, Award, Star, Shield, 
  Settings, LogOut, ChevronRight, Bell, Moon, Sun,
  HelpCircle, FileText, Smartphone, Camera, BadgeCheck
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import AgentBottomNav from '@/components/layout/AgentBottomNav';
import { Button } from '@/components/ui/button';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  // Mock agent data
  const agentData = {
    name: "Christopher Dastin",
    id: "AGENT-1234",
    email: "christopher.d@fuelfriendly.com",
    phone: "+1 (901) 555-3478",
    address: "Memphis, TN",
    vehicleType: "Toyota Camry",
    licensePlate: "TN-56A782",
    rating: 4.8,
    completedDeliveries: 241,
    joinDate: "January 15, 2023",
    verificationStatus: "verified"
  };

  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You're being signed out of your account",
    });
    
    setTimeout(() => {
      navigate('/signin');
    }, 1500);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    
    toast({
      title: isDarkMode ? "Light Mode Activated" : "Dark Mode Activated",
      description: isDarkMode ? "Switching to light mode" : "Switching to dark mode",
    });
  };

  const handleVerificationClick = () => {
    toast({
      title: "Verification Status",
      description: "Your account is fully verified",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Agent Profile" showBack={false} />
      
      {/* Profile Card */}
      <div className="px-4 pt-2 pb-6">
        <div className="bg-card rounded-xl p-4 border border-border relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mt-2 -mr-2">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="#4ade80" fillOpacity="0.05" />
              <circle cx="50" cy="50" r="35" fill="#4ade80" fillOpacity="0.08" />
              <circle cx="50" cy="50" r="20" fill="#4ade80" fillOpacity="0.15" />
            </svg>
          </div>
          
          <div className="relative flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-green-500">
              <AvatarImage src="/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png" />
              <AvatarFallback className="bg-green-500/20">CD</AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">{agentData.name}</h2>
                {agentData.verificationStatus === "verified" && (
                  <BadgeCheck className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{agentData.id}</p>
              
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm">{agentData.rating}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                <div className="text-sm">{agentData.completedDeliveries} Deliveries</div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-0 right-0 text-xs"
              onClick={() => navigate('/agent/edit-profile')}
            >
              Edit
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Vehicle</p>
                <div className="flex items-center gap-1">
                  <Car className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm">{agentData.vehicleType}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">License Plate</p>
                <p className="text-sm">{agentData.licensePlate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Agent Status and Quick Actions */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-medium mb-3">Agent Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Account Status</p>
                  <p className="text-xs text-muted-foreground">Active agent since {agentData.joinDate}</p>
                </div>
              </div>
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={handleVerificationClick}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Verification</p>
                  <p className="text-xs text-muted-foreground">Background check & documents</p>
                </div>
              </div>
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings */}
      <div className="px-4 space-y-6">
        {/* Account Settings */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">ACCOUNT SETTINGS</h3>
          <div className="bg-card rounded-xl overflow-hidden border border-border">
            <motion.div
              className="flex items-center justify-between p-4 cursor-pointer"
              whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              onClick={() => navigate('/agent/personal-info')}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span>Personal Information</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
            
            <div className="h-[1px] bg-border mx-4"></div>
            
            <motion.div
              className="flex items-center justify-between p-4 cursor-pointer"
              whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              onClick={() => navigate('/agent/vehicle-info')}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Car className="h-4 w-4" />
                </div>
                <span>Vehicle Information</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
            
            <div className="h-[1px] bg-border mx-4"></div>
            
            <motion.div
              className="flex items-center justify-between p-4 cursor-pointer"
              whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              onClick={() => navigate('/agent/documents')}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <span>Documents & Licenses</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
        
        {/* App Settings */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">APP SETTINGS</h3>
          <div className="bg-card rounded-xl overflow-hidden border border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-500/20 text-gray-500 flex items-center justify-center">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </div>
                <span>Dark Mode</span>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
            
            <div className="h-[1px] bg-border mx-4"></div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <span>Notifications</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            
            <div className="h-[1px] bg-border mx-4"></div>
            
            <motion.div
              className="flex items-center justify-between p-4 cursor-pointer"
              whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              onClick={() => navigate('/agent/app-settings')}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <Settings className="h-4 w-4" />
                </div>
                <span>App Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
        
        {/* Support */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">SUPPORT</h3>
          <div className="bg-card rounded-xl overflow-hidden border border-border">
            <motion.div
              className="flex items-center justify-between p-4 cursor-pointer"
              whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              onClick={() => navigate('/agent/help')}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span>Help & Support</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
            
            <div className="h-[1px] bg-border mx-4"></div>
            
            <motion.div
              className="flex items-center justify-between p-4 cursor-pointer"
              whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              onClick={() => navigate('/agent/contact')}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span>Contact Us</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="px-4 mt-10 mb-24">
        <Button 
          variant="destructive"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </div>
      
      <AgentBottomNav />
    </div>
  );
};

export default Profile;
