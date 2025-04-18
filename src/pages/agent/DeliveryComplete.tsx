
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight, Home, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const DeliveryComplete: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orderId, setOrderId] = useState<string>('');
  const [earnings, setEarnings] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showPhoto, setShowPhoto] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Get order data from location state
    if (location.state) {
      const { orderId, earnings } = location.state as { orderId: string, earnings: string };
      setOrderId(orderId);
      setEarnings(earnings);
    } else {
      // Fallback values if navigating directly
      setOrderId('ORD-9012');
      setEarnings('$42.00');
    }
    
    // Confetti celebration effect
    const confetti = () => {
      const confettiElements = 100;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '1000';
      document.body.appendChild(container);
      
      for (let i = 0; i < confettiElements; i++) {
        const confetti = document.createElement('div');
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        
        confetti.style.position = 'absolute';
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 5 + 5}px`;
        confetti.style.backgroundColor = color;
        confetti.style.borderRadius = '50%';
        confetti.style.opacity = `${Math.random() * 0.7 + 0.3}`;
        confetti.style.top = '0';
        confetti.style.left = `${Math.random() * 100}vw`;
        
        container.appendChild(confetti);
        
        const animationTime = Math.random() * 3 + 2;
        const xMove = Math.random() * 30 - 15;
        
        confetti.animate(
          [
            { transform: 'translate3d(0, 0, 0) rotate(0)', opacity: 1 },
            { transform: `translate3d(${xMove}px, 100vh, 0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
          ],
          {
            duration: animationTime * 1000,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            fill: 'forwards'
          }
        );
        
        setTimeout(() => {
          confetti.remove();
          if (i === confettiElements - 1) {
            setTimeout(() => container.remove(), animationTime * 1000);
          }
        }, animationTime * 1000);
      }
    };
    
    confetti();
  }, [location.state]);

  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Delivery Confirmed",
        description: "Your delivery notes have been submitted",
      });
      
      navigate('/agent/dashboard');
    }, 1500);
  };

  const handleTakePhoto = () => {
    setShowPhoto(true);
    
    // Simulate photo capture
    setTimeout(() => {
      toast({
        title: "Photo Captured",
        description: "Fuel gauge photo has been saved",
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
        >
          <CheckCircle className="h-12 w-12 text-green-500" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-center">Delivery Complete!</h1>
        <p className="text-muted-foreground text-center mt-2">
          You've successfully completed order #{orderId}
        </p>
        
        <div className="w-full mt-6 p-4 bg-card rounded-xl border border-border">
          <h2 className="font-semibold mb-2">Earnings Summary</h2>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Delivery Payment</span>
            <span className="font-medium text-green-500">{earnings}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Bonus</span>
            <span className="font-medium">$5.00</span>
          </div>
          <div className="flex justify-between items-center py-3 mt-2">
            <span className="font-semibold">Total Earnings</span>
            <span className="font-bold text-lg text-green-500">
              ${(parseFloat(earnings.replace('$', '')) + 5).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="w-full mt-6">
          <h2 className="font-semibold mb-3">Delivery Notes (Optional)</h2>
          <Textarea 
            placeholder="Add any notes about this delivery..."
            className="w-full h-24"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-5 border-dashed"
              onClick={handleTakePhoto}
            >
              <Camera className="h-5 w-5" />
              {showPhoto ? "Retake Photo of Fuel Gauge" : "Take Photo of Fuel Gauge"}
            </Button>
          </div>
          
          {showPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-2 border border-border rounded-lg"
            >
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <img 
                  src="/lovable-uploads/9a88ef60-f4d0-4cc6-9714-c32a44453aea.png"
                  alt="Fuel gauge"
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                Fuel gauge photo saved
              </p>
            </motion.div>
          )}
        </div>
        
        <div className="w-full mt-8 space-y-4">
          <Button 
            type="button"
            className="w-full py-6 bg-green-500 hover:bg-green-600 text-black font-medium text-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit & Continue"}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full flex items-center justify-center gap-1"
            onClick={() => navigate('/agent/dashboard')}
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryComplete;
