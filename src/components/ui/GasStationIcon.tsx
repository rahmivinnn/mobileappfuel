import React from 'react';

interface GasStationIconProps {
  size?: number;
  color?: string;
  className?: string;
  brand?: string;
}

/**
 * Custom SVG icon for Gas Station with 3D effect
 */
const GasStationIcon: React.FC<GasStationIconProps> = ({
  size = 24,
  color = '#ef4444', // Red color
  className = '',
  brand,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Station Building */}
      <path
        d="M4 22H20V8H4V22Z"
        fill={color}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Roof */}
      <path
        d="M3 8H21L18 3H6L3 8Z"
        fill={color}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Door */}
      <rect x="8" y="14" width="8" height="8" fill="#ffffff" stroke="#000000" />
      
      {/* Gas Pump */}
      <rect x="10" y="9" width="4" height="3" fill="#ffffff" stroke="#000000" />
      
      {/* Brand Label */}
      {brand && (
        <foreignObject x="6" y="4" width="12" height="3">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: `${size / 6}px`,
              fontWeight: 'bold',
              color: '#ffffff',
              textShadow: '0px 0px 2px #000000',
            }}
          >
            {brand}
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default GasStationIcon;
