
import React from 'react';

interface GasStationIconProps {
  size?: number;
}

const GasStationIcon: React.FC<GasStationIconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="22" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
      <path
        d="M31 14c0-2.21-1.79-4-4-4h-6c-2.21 0-4 1.79-4 4v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V14zm-10 0h6v6h-6v-6zm14-1l-3 3 1.5 1.5L37 14v15c0 1.1-.9 2-2 2s-2-.9-2-2v-8h-2v8c0 2.21 1.79 4 4 4s4-1.79 4-4V14l-4-4z"
        fill="white"
      />
      
      <foreignObject x="12" y="33" width="24" height="8">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            fontSize: "8px",
            fontWeight: "bold",
            color: "#ffffff",
            textShadow: "0px 0px 2px #000000"
          }}
        >
          FUEL
        </div>
      </foreignObject>
    </svg>
  );
};

export default GasStationIcon;
