
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
  }>;
  directions?: boolean;
  interactive?: boolean;
  showRoute?: boolean;
  showBackButton?: boolean;
  onMarkerClick?: (index: number) => void;
}

const Map = React.forwardRef<HTMLDivElement, MapProps>(
  ({ className, center, zoom = 15, markers, directions, interactive, showRoute, showBackButton, onMarkerClick, ...props }, ref) => {
    // Use state to track if the component has mounted
    const [mounted, setMounted] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
    const [markerHover, setMarkerHover] = useState<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const [routeProgress, setRouteProgress] = useState(0);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Set mounted to true after component mounts
    useEffect(() => {
      setMounted(true);
      
      // Simulate map loading delay for better UX
      const timer = setTimeout(() => {
        setMapLoaded(true);
      }, 300);
      
      // Clean up function
      return () => {
        setMounted(false);
        clearTimeout(timer);
      };
    }, []);

    // Start route animation for direction line
    useEffect(() => {
      if (directions && showRoute) {
        let progress = 0;
        const animate = () => {
          progress += 0.5;
          if (progress > 100) progress = 0;
          setRouteProgress(progress);
          animationRef.current = requestAnimationFrame(animate);
        };
        
        animationRef.current = requestAnimationFrame(animate);
        
        return () => {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
      }
    }, [directions, showRoute]);

    const handleMarkerClick = (index: number) => {
      setSelectedMarker(prev => prev === index ? null : index);
      if (onMarkerClick) onMarkerClick(index);
    };

    // Map image from a real map service for better visualization
    const mapImage = '/lovable-uploads/f7931378-76e5-4e0a-bc3c-1d7b4fff6f0d.png';

    // Calculate positions based on markers if they exist
    const routePoints = markers && markers.length >= 2
      ? markers.map(marker => {
          const { lat, lng } = marker.position;
          // Convert lat/lng to x/y coordinates in the container
          const x = (lng + 140) / 360 * 100; // Simple conversion
          const y = (90 - lat) / 180 * 100;
          return { x: `${x}%`, y: `${y}%` };
        })
      : [];

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-lg shadow-xl ${className}`}
        {...props}
      >
        {/* Animated loading state */}
        <AnimatePresence>
          {!mapLoaded && (
            <motion.div 
              className="absolute inset-0 bg-[#151822] flex items-center justify-center z-20"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="w-12 h-12 border-4 border-[#9b87f5] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map background with overlay for realistic appearance */}
        <motion.div 
          className="w-full h-full relative"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ 
            scale: mapLoaded ? 1 : 1.05, 
            opacity: mapLoaded ? 1 : 0 
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <img
            src={mapImage}
            alt="Map"
            className="w-full h-full object-cover"
            onLoad={() => setMapLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#151822]/5 via-transparent to-[#151822]/30 pointer-events-none" />
          
          {/* Interactive overlay effect when hovering map */}
          {interactive && (
            <motion.div 
              className="absolute inset-0 bg-[#9b87f5]/5 opacity-0 transition-opacity duration-300"
              whileHover={{ opacity: 0.15 }}
            />
          )}
        </motion.div>

        {/* Dynamic route path with animated dash effect */}
        {directions && showRoute && routePoints.length >= 2 && mapLoaded && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#7E69AB" />
              </linearGradient>
              
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Glow effect beneath the route */}
            <motion.path
              d={`M ${routePoints[0].x} ${routePoints[0].y} 
                  Q ${parseInt(routePoints[0].x) + 10}% ${parseInt(routePoints[0].y) - 5}%,
                    ${(parseInt(routePoints[0].x) + parseInt(routePoints[1].x)) / 2}% 
                    ${(parseInt(routePoints[0].y) + parseInt(routePoints[1].y)) / 2}%
                  T ${routePoints[1].x} ${routePoints[1].y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              filter="url(#glow)"
              className="opacity-20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Main route path */}
            <motion.path
              d={`M ${routePoints[0].x} ${routePoints[0].y} 
                  Q ${parseInt(routePoints[0].x) + 10}% ${parseInt(routePoints[0].y) - 5}%,
                    ${(parseInt(routePoints[0].x) + parseInt(routePoints[1].x)) / 2}% 
                    ${(parseInt(routePoints[0].y) + parseInt(routePoints[1].y)) / 2}%
                  T ${routePoints[1].x} ${routePoints[1].y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-90"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Animated dash overlay */}
            <motion.path
              d={`M ${routePoints[0].x} ${routePoints[0].y} 
                  Q ${parseInt(routePoints[0].x) + 10}% ${parseInt(routePoints[0].y) - 5}%,
                    ${(parseInt(routePoints[0].x) + parseInt(routePoints[1].x)) / 2}% 
                    ${(parseInt(routePoints[0].y) + parseInt(routePoints[1].y)) / 2}%
                  T ${routePoints[1].x} ${routePoints[1].y}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="6,12"
              strokeDashoffset={-routeProgress}
              className="opacity-70"
            />
            
            {/* Animated travel indicator */}
            <motion.circle
              cx={routePoints[0].x}
              cy={routePoints[0].y}
              r="4"
              fill="#ffffff"
              animate={{
                cx: [
                  routePoints[0].x,
                  `${(parseInt(routePoints[0].x) + parseInt(routePoints[1].x)) / 2}%`,
                  routePoints[1].x
                ],
                cy: [
                  routePoints[0].y,
                  `${(parseInt(routePoints[0].y) + parseInt(routePoints[1].y)) / 2}%`,
                  routePoints[1].y
                ],
              }}
              transition={{
                duration: 10,
                ease: "linear",
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </motion.circle>
          </svg>
        )}

        {/* Markers */}
        {markers && mapLoaded && markers.map((marker, index) => {
          const isSelected = selectedMarker === index;
          const isHovered = markerHover === index;
          
          // Calculate position based on coordinates
          const left = (marker.position.lng + 140) / 360 * 100;
          const top = (90 - marker.position.lat) / 180 * 100;
          
          return (
            <div
              key={index}
              className="absolute transition-transform"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(-50%, -50%)`,
                zIndex: isSelected ? 10 : 1
              }}
            >
              {/* Marker */}
              <motion.div
                className="cursor-pointer"
                initial={{ scale: 0, y: 20, opacity: 0 }}
                animate={{ 
                  scale: isSelected || isHovered ? 1.25 : 1,
                  y: isSelected || isHovered ? -5 : 0,
                  opacity: 1
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15,
                  delay: index * 0.1
                }}
                onClick={() => handleMarkerClick(index)}
                onMouseEnter={() => setMarkerHover(index)}
                onMouseLeave={() => setMarkerHover(null)}
              >
                {marker.icon ? (
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-[#9b87f5] rounded-full"
                      style={{
                        filter: "blur(10px)",
                        zIndex: -1,
                      }}
                    />
                    <img 
                      src={marker.icon} 
                      alt={marker.title || 'Marker'} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-[#9b87f5] rounded-full"
                      style={{
                        filter: "blur(8px)",
                        zIndex: -1,
                      }}
                    />
                    <div 
                      className={`w-6 h-6 rounded-full bg-[#9b87f5] border-2 border-white shadow-lg 
                        ${isSelected ? 'ring-4 ring-[#9b87f5]/30' : ''}`}
                    />
                  </div>
                )}
              </motion.div>
              
              {/* Enhanced Info popup when marker is selected */}
              <AnimatePresence>
                {(isSelected || isHovered) && marker.title && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5, scale: 0.9 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-20 bg-[#1A1F2C]/90 backdrop-blur-md shadow-xl rounded-lg p-3 min-w-[120px] text-center transform -translate-y-full -translate-x-1/2 left-1/2 border border-[#9b87f5]/20"
                    style={{
                      marginTop: "-15px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35), 0 0 15px rgba(155, 135, 245, 0.2)"
                    }}
                  >
                    <p className="text-sm font-semibold text-white">{marker.title}</p>
                    
                    {/* Add a small triangle for the popup */}
                    <div 
                      className="absolute w-3 h-3 bg-[#1A1F2C]/90 backdrop-blur-md transform rotate-45 left-1/2 -ml-1.5 border-r border-b border-[#9b87f5]/20"
                      style={{ bottom: "-6px" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        
        {/* Map controls with glass morphism effect */}
        {interactive && mapLoaded && (
          <motion.div 
            className="absolute bottom-4 right-4 flex flex-col space-y-2"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.button 
              className="h-9 w-9 bg-[#1A1F2C]/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-[#9b87f5]/20"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(155, 135, 245, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl font-bold text-white">+</span>
            </motion.button>
            <motion.button 
              className="h-9 w-9 bg-[#1A1F2C]/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-[#9b87f5]/20"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(155, 135, 245, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl font-bold text-white">−</span>
            </motion.button>
          </motion.div>
        )}

        {/* Map attribution */}
        {mapLoaded && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-2 left-2 text-xs text-white/70 bg-[#1A1F2C]/70 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10"
          >
            Map data © 2025
          </motion.div>
        )}
      </div>
    );
  }
);

Map.displayName = 'Map';

export default Map;
