// import React from "react";

// const GaugeCard = ({ label, value, unit, color, max }) => {
//   const radius = 80;
//   const strokeWidth = 18;
//   const circumference = 2 * Math.PI * radius;
//   const percentage = Math.min(value / max, 1);
//   const dashOffset = circumference - percentage * circumference;

//   return (
//     <div
//       style={{
//         background: "#0b0f1a",
//         borderRadius: "16px",
//         padding: "20px",
//         textAlign: "center",
//         boxShadow: `0 0 20px ${color}55`,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       <svg width="200" height="200">
//         <circle
//           cx="100"
//           cy="100"
//           r={radius}
//           stroke="#1a2235"
//           strokeWidth={strokeWidth}
//           fill="none"
//         />
//         <circle
//           cx="100"
//           cy="100"
//           r={radius}
//           stroke={color}
//           strokeWidth={strokeWidth}
//           fill="none"
//           strokeDasharray={circumference}
//           strokeDashoffset={dashOffset}
//           strokeLinecap="round"
//           style={{ filter: `drop-shadow(0 0 6px ${color})` }}
//         />
//         <text
//           x="50%"
//           y="50%"
//           dominantBaseline="middle"
//           textAnchor="middle"
//           fontSize="28"
//           fontWeight="bold"
//           fill="#fff"
//         >
//           {value}
//           <tspan fontSize="18" dy="">{unit}</tspan>
//         </text>
//       </svg>
//       <div style={{ marginTop: "8px", fontSize: "14px", color: "#b89e9eff" }}>
//         {label}
//       </div>
//     </div>
//   );
// };

// export default GaugeCard;




