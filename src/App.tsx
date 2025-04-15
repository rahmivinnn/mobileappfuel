import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import SplashScreen from './components/ui/SplashScreen';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';

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
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/station/:id" element={<StationDetails />} />
      <Route path="/station/:id/fuel" element={<FuelSelection />} />
      <Route path="/station/:id/groceries" element={<GroceryList />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/chat" element={<ChatScreen />} />
      <Route path="/call" element={<CallScreen />} />
      
      {/* Auth routes */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  const handleSplashScreenFinish = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      {isLoading ? (
        <SplashScreen onFinish={handleSplashScreenFinish} />
      ) : (
        <>
          <AppRoutes />
          <Toaster />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
