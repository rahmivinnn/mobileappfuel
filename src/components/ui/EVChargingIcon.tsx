import React from 'react';

interface EVChargingIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Custom SVG icon for EV Charging Station
 */
const EVChargingIcon: React.FC<EVChargingIconProps> = ({
  size = 24,
  color = '#3b82f6', // Blue color
  className = '',
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
      {/* Charging Station */}
      <rect x="6" y="3" width="12" height="18" rx="2" fill={color} stroke="#000000" strokeWidth="1" />
      
      {/* Screen */}
      <rect x="8" y="5" width="8" height="5" rx="1" fill="#ffffff" stroke="#000000" strokeWidth="0.5" />
      
      {/* Charging Cable */}
      <path
        d="M10 14H4C3.44772 14 3 14.4477 3 15V19C3 19.5523 3.44772 20 4 20H6"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Charging Connector */}
      <rect x="2" y="15" width="3" height="4" rx="1" fill="#333333" />
      
      {/* Lightning Bolt */}
      <path
        d="M12 10L10 14H14L12 18"
        stroke="#ffff00"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10L10 14H14L12 18"
        fill="#ffff00"
        fillOpacity="0.5"
      />
      
      {/* Charging Port */}
      <rect x="9" y="19" width="6" height="2" rx="1" fill="#333333" />
    </svg>
  );
};

export default EVChargingIcon;
