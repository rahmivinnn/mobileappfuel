
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from './components/ui/PageTransition';

// Components
import SplashScreen from './components/ui/SplashScreen';
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from './components/ui/toaster';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Index from './pages/Index';
import Settings from './pages/Settings';
import StationDetails from './pages/StationDetails';
import FuelSelection from './pages/FuelSelection';
import GroceryList from './pages/GroceryList';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';
import ChatScreen from './pages/ChatScreen';
import CallScreen from './pages/CallScreen';
import NotFound from './pages/NotFound';
import MapView from './pages/MapView';

// Auth pages
import Welcome from './pages/auth/Welcome';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import ResetPassword from './pages/auth/ResetPassword';

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mock authentication handlers
  const handleLogin = (token: string) => {
    console.log("User logged in with token:", token);
    localStorage.setItem("auth-token", token);
    navigate('/'); // Ensure navigation to home on login
  };

  const handleLogout = () => {
    console.log("User logged out");
    localStorage.removeItem("auth-token");
    navigate("/signin");
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/map" element={<PageTransition><MapView /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings onLogout={handleLogout} /></PageTransition>} />
        <Route path="/station/:id" element={<PageTransition><StationDetails /></PageTransition>} />
        <Route path="/station/:id/fuel" element={<PageTransition><FuelSelection /></PageTransition>} />
        <Route path="/station/:id/groceries" element={<PageTransition><GroceryList /></PageTransition>} />
        <Route path="/payment" element={<PageTransition><Payment /></PageTransition>} />
        <Route path="/confirmation" element={<PageTransition><Confirmation /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><OrderHistory /></PageTransition>} />
        <Route path="/track" element={<PageTransition><TrackOrder /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><ChatScreen /></PageTransition>} />
        <Route path="/call" element={<PageTransition><CallScreen /></PageTransition>} />

        {/* Auth routes */}
        <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/signin" element={<PageTransition><SignIn onLogin={handleLogin} /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUp onLogin={handleLogin} /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/verify-otp" element={<PageTransition><VerifyOtp /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashScreenFinish = useCallback(() => {
    setIsLoading(false);
    navigate('/signin');
  }, [navigate]);

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SplashScreen onFinish={handleSplashScreenFinish} />
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <AppRoutes />
              <Toaster />
            </motion.div>
          )}
        </AnimatePresence>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
