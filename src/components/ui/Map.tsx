
import React, { useState, useEffect } from 'react';

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

    // Set mounted to true after component mounts
    useEffect(() => {
      setMounted(true);
      
      // Clean up function
      return () => setMounted(false);
    }, []);

    const handleMarkerClick = (index: number) => {
      setSelectedMarker(prev => prev === index ? null : index);
      if (onMarkerClick) onMarkerClick(index);
    };

    // Demo map image for visualization
    const mapImage = '/lovable-uploads/f7931378-76e5-4e0a-bc3c-1d7b4fff6f0d.png';

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-lg ${className}`}
        {...props}
      >
        {/* Map background */}
        <div className="w-full h-full">
          <img
            src={mapImage}
            alt="Map"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Optional route path */}
        {directions && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M100,350 C150,300 200,250 300,200 C400,150 500,100 600,100"
              fill="none"
              stroke="#4ade80"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="10,10"
              className="animate-dash"
            />
          </svg>
        )}

        {/* Markers */}
        {markers && markers.map((marker, index) => {
          const isSelected = selectedMarker === index;
          const isHovered = markerHover === index;
          
          // Calculate position based on coordinates
          // This is a simple placeholder calculation for demo
          // In a real app, you would use proper geo to pixel conversion
          const left = (marker.position.lng + 140) / 360 * 100; // More robust calculation
          const top = (90 - marker.position.lat) / 180 * 100;  // More robust calculation
          
          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(-50%, -50%)`,
                zIndex: isSelected ? 10 : 1
              }}
            >
              {/* Marker */}
              <div
                className={`cursor-pointer transition-transform duration-200 ${isSelected || isHovered ? 'scale-125' : 'scale-100'}`}
                onClick={() => handleMarkerClick(index)}
                onMouseEnter={() => setMarkerHover(index)}
                onMouseLeave={() => setMarkerHover(null)}
              >
                {marker.icon ? (
                  <img src={marker.icon} alt={marker.title || 'Marker'} className="w-8 h-8" />
                ) : (
                  <div className={`w-6 h-6 rounded-full bg-primary border-2 border-white ${isSelected ? 'ring-4 ring-primary/50' : ''}`} />
                )}
              </div>
              
              {/* Info popup when marker is selected */}
              {(isSelected || isHovered) && marker.title && (
                <div 
                  className="absolute z-20 bg-card shadow-lg rounded-md p-2 min-w-[120px] text-center -mt-2 transform -translate-y-full"
                  style={{
                    transform: "translateY(-100%)",
                    cursor: "default",
                    transition: "all 0.2s",
                    perspective: "1000px",
                    transformStyle: "preserve-3d" as const,
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(4px)",
                    color: "white",
                    borderBottom: "2px solid #4ade80"
                  }}
                >
                  <p className="text-sm font-medium">{marker.title}</p>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button className="h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <span className="text-xl font-bold">+</span>
          </button>
          <button className="h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <span className="text-xl font-bold">−</span>
          </button>
        </div>
      </div>
    );
  }
);

Map.displayName = 'Map';

export default Map;
