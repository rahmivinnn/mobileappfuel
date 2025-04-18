
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Truck, AtSign, Lock, Eye, EyeOff } from 'lucide-react';

interface SignInProps {
  onLogin: (token: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all agent credentials",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate agent-specific login
    setTimeout(() => {
      const token = "fuelfriendly-agent-token-" + Math.random();
      onLogin(token);
      setIsLoading(false);
      toast({
        title: "Welcome, FuelFriendly Agent!",
        description: "You're ready to start your deliveries",
      });
      navigate('/agent/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background animation */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ backgroundPosition: '0% 0%' }}
        animate={{ backgroundPosition: '100% 100%' }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          background: 'radial-gradient(circle at center, rgba(0,230,118,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Header */}
      <div className="pt-6 px-6 z-10">
        <Link to="/" className="inline-flex items-center text-green-500 hover:text-green-400">
          <Truck className="h-5 w-5 mr-2" />
          <span>Agent Portal</span>
        </Link>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-between z-10 px-6 py-8">
        <motion.div 
          className="w-full max-w-md mx-auto pt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Truck className="h-8 w-8 text-green-500" />
              Agent Login
            </motion.h1>
            <motion.p 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Deliver fuel, earn more with FuelFriendly
            </motion.p>
          </div>

          <motion.form 
            onSubmit={handleSignIn}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative">
              <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <Input
                type="email"
                placeholder="Agent email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Agent password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-green-500 hover:text-green-400 text-sm transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium text-base transition-all transform active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                  Signing in...
                </motion.div>
              ) : (
                'Agent Log In'
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                New agent?{' '}
                <Link to="/signup" className="text-green-500 hover:text-green-400 font-medium">
                  Apply to join FuelFriendly
                </Link>
              </p>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
