
import React, { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Check, ChevronLeft, CreditCard, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreditCardForm from '@/components/ui/CreditCardForm';
import PaymentMethod from '@/components/ui/PaymentMethod';
import QrCodeDisplay from '@/components/ui/QrCodeLogin';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { fuelType, quantity, groceryCart, totalPrice } = location.state || {
    fuelType: { id: 'regular', name: 'Regular Unleaded', price: 3.29 },
    quantity: 2,
    groceryCart: [],
    totalPrice: 6.58
  };
  
  const [selectedPayment, setSelectedPayment] = useState('credit-card');
  const [showQrCode, setShowQrCode] = useState(false);

  // Generate a unique order ID
  const orderId = `FUEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const handlePayNow = () => {
    if (selectedPayment === 'qr-code') {
      setShowQrCode(true);
    } else {
      // In a real app, we would process the payment here
      navigate('/confirmation', { 
        state: { 
          fuelType, 
          quantity, 
          totalPrice, 
          paymentMethod: paymentMethods.find(m => m.id === selectedPayment) 
        }
      });
    }
  };
  
  const paymentMethods = [
    { 
      id: 'credit-card', 
      name: 'Credit card', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path d="M19.5 8.5h-2a2 2 0 0 0-2 2v.5h-2a2 2 0 0 0-2 2v.5h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Z" />
              <path d="M3 11v3a4 4 0 0 0 4 4h1" />
              <path d="M7 5.5v3" />
              <path d="M18 5.5v3" />
              <path d="M13.5 17h1" />
            </svg>
    },
    { 
      id: 'apple-pay', 
      name: 'Apple Pay', 
      icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path d="M12 17.5c-2.5 0-2.5-5-5-5" />
              <path d="M8 22c3.5 0 3.5-10 7-10" />
              <path d="M11 14.5c1.5 0 3-6.5 3-6.5" />
              <path d="M9 2h6" />
              <path d="M12 2v7" />
            </svg>
    },
    {
      id: 'qr-code',
      name: 'QR Code',
      description: 'Pay at the gas station',
      icon: <QrCode className="h-5 w-5" />
    }
  ];

  // Handle QR code close
  const handleQrCodeClose = () => {
    setShowQrCode(false);
  };
  
  return (
    <div className="min-h-screen bg-black text-white pb-8">
      {/* Header */}
      <div className="relative px-4 py-3 flex items-center justify-center">
        <Link to={`/station/${id}/fuel`} className="absolute left-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-800">
            <ChevronLeft className="h-6 w-6" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Checkout</h1>
      </div>
      
      {/* Progress steps */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <Check className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm">Order</span>
          </div>
          
          <div className="flex-1 h-1 bg-green-500 mx-2"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <Check className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm">Order summary</span>
          </div>
          
          <div className="flex-1 h-1 bg-green-500 mx-2"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-green-500 text-green-500 flex items-center justify-center mb-2">
              <span className="text-lg font-bold">3</span>
            </div>
            <span className="text-sm">Payment</span>
          </div>
        </div>
      </div>
      
      {showQrCode ? (
        <div className="px-4 mb-6">
          <QrCodeDisplay 
            isPayment={true}
            verificationCode={orderId}
            paymentData={{
              amount: totalPrice,
              orderId: orderId,
              stationId: id || '1'
            }}
            onClose={handleQrCodeClose}
          />
          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-4">
              After showing the QR code to the attendant and completing your payment, click below to continue.
            </p>
            <Button 
              className="w-full py-6 bg-green-500 hover:bg-green-600 text-black rounded-full text-lg font-medium"
              onClick={() => {
                navigate('/confirmation', { 
                  state: { 
                    fuelType, 
                    quantity, 
                    totalPrice,
                    paymentMethod: paymentMethods.find(m => m.id === 'qr-code')
                  }
                });
              }}
            >
              I've Completed Payment
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Payment methods */}
          <div className="px-4 mb-6">
            <PaymentMethod 
              methods={paymentMethods}
              selectedMethod={selectedPayment}
              onSelectMethod={setSelectedPayment}
            />
          </div>
          
          {/* Card Form Component */}
          <div className="px-4 mb-6">
            {selectedPayment === 'credit-card' && (
              <CreditCardForm onSubmit={handlePayNow} />
            )}
          </div>
          
          {selectedPayment !== 'credit-card' && (
            <div className="px-4 fixed bottom-8 left-0 right-0">
              <Button 
                className="w-full py-6 bg-green-500 hover:bg-green-600 text-black rounded-full text-lg font-medium"
                onClick={handlePayNow}
              >
                {selectedPayment === 'qr-code' ? 'Show QR Code' : 'Pay Now'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Payment;
