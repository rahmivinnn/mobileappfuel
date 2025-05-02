
import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface QrCodeProps {
  clientId?: string;
  onClose?: () => void;
  verificationCode?: string;
  paymentData?: {
    amount: number;
    orderId: string;
    stationId: string;
  };
  isPayment?: boolean;
}

const QrCodeDisplay: React.FC<QrCodeProps> = ({ 
  clientId, 
  onClose, 
  verificationCode: propVerificationCode,
  paymentData,
  isPayment = false
}) => {
  const [isExpanded, setIsExpanded] = useState(isPayment ? true : false);

  // Generate a random verification code for this QR code session
  const verificationCode = propVerificationCode || Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Generate QR code content based on the use case
  const qrCodeContent = isPayment 
    ? `fuelfriendly://payment/${paymentData?.orderId || 'order'}?amount=${paymentData?.amount || 0}&stationId=${paymentData?.stationId || ''}&verify=${verificationCode}`
    : `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=email+profile&redirect_uri=storagerelay://https/localhost&verification_code=${verificationCode}`;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      {!isExpanded && !isPayment ? (
        <div className="flex items-center justify-center">
          <Button
            onClick={() => setIsExpanded(true)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            <QrCode size={18} />
            <span>Login with QR Code</span>
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-center"
        >
          <div className="mb-3 text-gray-400 text-sm">
            {isPayment ? "Show this to the gas station attendant" : "Scan with your mobile device"}
          </div>
          <div className="bg-white p-4 rounded-lg mb-4 inline-block">
            {/* Here we use a simple visual QR code representation */}
            <div className="w-48 h-48 mx-auto relative">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full"
              >
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <rect x="10" y="10" width="20" height="20" fill="black" />
                <rect x="70" y="10" width="20" height="20" fill="black" />
                <rect x="10" y="70" width="20" height="20" fill="black" />
                <rect x="40" y="40" width="20" height="20" fill="black" />
                <rect x="10" y="40" width="10" height="10" fill="black" />
                <rect x="80" y="40" width="10" height="10" fill="black" />
                <rect x="30" y="10" width="5" height="5" fill="black" />
                <rect x="40" y="15" width="5" height="5" fill="black" />
                <rect x="65" y="35" width="5" height="5" fill="black" />
                <rect x="40" y="80" width="15" height="5" fill="black" />
                <rect x="70" y="70" width="5" height="5" fill="black" />
                <rect x="65" y="80" width="5" height="10" fill="black" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-1 rounded">
                  <QrCode className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4 text-sm">
            <div className="font-medium text-white mb-1">
              {isPayment ? "Payment Code" : "Verification Code"}
            </div>
            <div className="font-mono tracking-widest text-green-500 text-lg">{verificationCode}</div>
            {isPayment && (
              <div className="mt-2 font-medium text-white">
                Amount: <span className="text-green-500">${paymentData?.amount.toFixed(2)}</span>
              </div>
            )}
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              className="text-sm text-gray-400 hover:text-white" 
              onClick={onClose}
            >
              {isPayment ? "Back to payment options" : "Back to login"}
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default QrCodeDisplay;
