import React from 'react';

interface FuelAgentIconProps {
  size?: number;
  color?: string;
  hatColor?: string;
  className?: string;
}

/**
 * Custom SVG icon for Fuel Agent with a person wearing a hat
 */
const FuelAgentIcon: React.FC<FuelAgentIconProps> = ({
  size = 24,
  color = '#22c55e', // Green color
  hatColor = '#15803d', // Darker green for hat
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
      {/* Hat */}
      <path
        d="M6 9C6 9 7 6 12 6C17 6 18 9 18 9"
        stroke={hatColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 9H16V11C16 11 14 12 12 12C10 12 8 11 8 11V9Z"
        fill={hatColor}
        stroke={hatColor}
        strokeWidth="1"
      />
      
      {/* Head */}
      <circle cx="12" cy="14" r="2.5" fill={color} stroke={color} />
      
      {/* Body */}
      <path
        d="M12 16.5V20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Arms */}
      <path
        d="M12 18L9 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 18L15 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Legs */}
      <path
        d="M12 20L10 23"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 20L14 23"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default FuelAgentIcon;
