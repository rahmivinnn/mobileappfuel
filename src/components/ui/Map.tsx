
import React, { useState, useEffect, useRef } from 'react';
import { Motion, AnimatePresence, motion } from 'framer-motion';

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

    // Set mounted to true after component mounts
    useEffect(() => {
      setMounted(true);
      
      // Clean up function
      return () => setMounted(false);
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
        className={`relative overflow-hidden rounded-lg shadow-lg ${className}`}
        {...props}
      >
        {/* Map background with overlay for realistic appearance */}
        <div className="w-full h-full relative">
          <img
            src={mapImage}
            alt="Map"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#151822]/5 via-transparent to-[#151822]/30 pointer-events-none"></div>
        </div>

        {/* Dynamic route path with animated dash effect */}
        {directions && showRoute && routePoints.length >= 2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#7E69AB" />
              </linearGradient>
            </defs>
            
            {/* Create a curve through the points */}
            <path
              d={`M ${routePoints[0].x} ${routePoints[0].y} 
                  Q ${parseInt(routePoints[0].x) + 10}% ${parseInt(routePoints[0].y) - 5}%,
                    ${(parseInt(routePoints[0].x) + parseInt(routePoints[1].x)) / 2}% 
                    ${(parseInt(routePoints[0].y) + parseInt(routePoints[1].y)) / 2}%
                  T ${routePoints[1].x} ${routePoints[1].y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-80"
            />
            
            {/* Animated dash overlay */}
            <path
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
              strokeDashoffset={-routeProgress} // animated dash effect
              className="opacity-60"
            />
            
            {/* Glow effect */}
            <path
              d={`M ${routePoints[0].x} ${routePoints[0].y} 
                  Q ${parseInt(routePoints[0].x) + 10}% ${parseInt(routePoints[0].y) - 5}%,
                    ${(parseInt(routePoints[0].x) + parseInt(routePoints[1].x)) / 2}% 
                    ${(parseInt(routePoints[0].y) + parseInt(routePoints[1].y)) / 2}%
                  T ${routePoints[1].x} ${routePoints[1].y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              filter="blur(6px)"
              className="opacity-20"
            />
          </svg>
        )}

        {/* Markers */}
        {markers && markers.map((marker, index) => {
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
                initial={{ scale: 1 }}
                animate={{ 
                  scale: isSelected || isHovered ? 1.25 : 1,
                  y: isSelected || isHovered ? -5 : 0 
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15 
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
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-20 bg-[#1A1F2C] shadow-xl rounded-lg p-2 min-w-[120px] text-center transform -translate-y-full -translate-x-1/2 left-1/2"
                    style={{
                      marginTop: "-15px",
                      backdropFilter: "blur(8px)",
                      borderBottom: "2px solid #9b87f5",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)"
                    }}
                  >
                    <p className="text-sm font-medium text-white">{marker.title}</p>
                    
                    {/* Add a small triangle for the popup */}
                    <div 
                      className="absolute w-3 h-3 bg-[#1A1F2C] transform rotate-45 left-1/2 -ml-1.5"
                      style={{ 
                        bottom: "-6px", 
                        borderRight: "1px solid #9b87f5",
                        borderBottom: "1px solid #9b87f5" 
                      }}
                    ></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        
        {/* Map controls with glass morphism effect */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button className="h-9 w-9 bg-[#1A1F2C]/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-[#262A34]/50">
            <span className="text-xl font-bold text-white">+</span>
          </button>
          <button className="h-9 w-9 bg-[#1A1F2C]/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-[#262A34]/50">
            <span className="text-xl font-bold text-white">−</span>
          </button>
        </div>

        {/* Map attribution */}
        <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-[#1A1F2C]/50 px-2 py-1 rounded-md backdrop-blur-sm">
          Map data © 2025
        </div>
      </div>
    );
  }
);

Map.displayName = 'Map';

export default Map;
