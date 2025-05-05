
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hexagon, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Twilio credentials - in a production app, these should be stored securely
  const twilioApiKey = 'SK4473f756b7d91b57e760f7b7103b0054';
  const twilioAuthToken = 'c5530bf620dd9272236a8ef94ea9fedf';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Construct the Twilio API URL for sending email
      const twilioEmailUrl = 'https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json';
      
      // Store OTP in sessionStorage (for demo purposes only - in production use more secure methods)
      sessionStorage.setItem('verification_otp', otp);
      sessionStorage.setItem('verification_email', email);
      
      console.log(`Sending OTP: ${otp} to email: ${email}`);
      console.log(`Using Twilio credentials - API Key: ${twilioApiKey.substring(0, 5)}...`);
      
      // In a real implementation, you would make an API call to your backend
      // which would then use Twilio to send the email with OTP
      // For demo purposes, we're simulating success
      
      // Success toast
      toast({
        title: "Success",
        description: "A verification code has been sent to your email.",
        variant: "default"
      });
      
      // Navigate to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          email, 
          isSignUp: false 
        } 
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Status bar */}
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="text-sm">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        <div className="flex items-center space-x-2">
          <span className="h-4 w-4 flex items-center justify-center">●●●</span>
          <span className="h-4 w-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H7M7 12C7 13.6569 8.34315 15 10 15H14C15.6569 15 17 13.6569 17 12M7 12C7 10.3431 8.34315 9 10 9H14C15.6569 9 17 10.3431 17 12M17 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="h-4 w-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M11 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="font-bold">100</span>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/signin" 
              className="h-10 w-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-800"
            >
              <ArrowLeft size={20} />
            </Link>
            {/* Logo removed as requested */}
            <div className="w-10"></div>
          </div>
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={30} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Forgot Password</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter your email address and we'll send you a verification code to reset your password
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500 px-4 py-3"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Remember your password?{' '}
              <Link to="/signin" className="text-green-500 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Hexagon decoration at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-32 overflow-hidden opacity-10 pointer-events-none">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-wrap"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Hexagon 
              key={i}
              size={40} 
              className="text-green-500"
              fill="rgba(0,230,118,0.2)"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
