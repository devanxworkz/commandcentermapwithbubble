import React from "react";

// Polar to Cartesian
const polar = (cx, cy, r, deg) => {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

// Arc path
const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
};

const ThreeQuarterGauge = ({
  label = "Gauge",
  value = 0,
  min = 0,
  max = 100,
  unit = "",
  width = 120, // fits card
}) => {
  const cx = width / 2;
  const cy = width / 2 ;
  const r = width / 2 - 30;

  // Gauge angles
  const START = 220;
  const END = 500;
  const span = (END - START + 360) % 360; // 270°

  const clamp = (v) => Math.max(min, Math.min(max, v));
  const norm = (clamp(value) - min) / (max - min);
  const needleDeg = START + norm * span;

  // Speed zones
  const zone1 = 60;
  const zone2 = 70;

  // Convert value to angle
  const toAngle = (val) => START + ((val - min) / (max - min)) * span;

  const zone1Angle = toAngle(zone1);
  const zone2Angle = toAngle(zone2);
  const currentAngle = toAngle(clamp(value));

  // Colors
  const colors = ["#FF9913", "#ffeb3b", "#ff4d4d"];

  return (
    <div>
      <svg width={width} height={width / 1.1}>
        {/* Glow arc */}
        <path
          d={arcPath(cx, cy, r + 6, START, END)}
          stroke="rgba(56,189,248,0.35)"
          strokeWidth="2"
          fill="none"
        />

        {/* Track */}
       {/* Track */}
<path
  d={arcPath(cx, cy, r, START, END)}
  stroke="#292626ff"
  strokeWidth="14"
  strokeLinecap="round"
  fill="none"
/>


        {/* Progress segments */}
        {/* Zone 1: min to zone1 */}
        {value > min && (
          <path
            d={arcPath(cx, cy, r, START, Math.min(zone1Angle, currentAngle))}
            stroke={colors[0]}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Zone 2: zone1 to zone2 */}
        {value > zone1 && (
          <path
            d={arcPath(cx, cy, r, zone1Angle, Math.min(zone2Angle, currentAngle))}
            stroke={colors[1]}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Zone 3: zone2 to current */}
        {value > zone2 && (
          <path
            d={arcPath(cx, cy, r, zone2Angle, currentAngle)}
            stroke={colors[2]}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Ticks & Labels */}
        {[...Array((max - min) / 10 + 1)].map((_, i) => {
          const val = min + i * 10;
          const angle = START + (val / (max - min)) * span;
          const p1 = polar(cx, cy, r + 2, angle);
          const p2 = polar(cx, cy, r - 10, angle);
          const labelPos = polar(cx, cy, r - 22, angle);
          return (
            <g key={i}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#fff"
                strokeWidth={val % 20 === 0 ? 2 : 1}
              />
              <text
                x={labelPos.x}
                y={labelPos.y }
                textAnchor="middle"
                fontSize="10"
                fill="#fff"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <g
          transform={`rotate(${needleDeg} ${cx} ${cy})`}
          style={{ transition: "transform 0.6s ease" }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r}
            stroke="#f83d3dff"
            strokeWidth="3"
          />
          <circle cx={cx} cy={cy} r="5" fill="#f53b3bff" />
        </g>
      </svg>

      {/* Value */}
      <div className="text-center text-white text-lg font-bold -mt-2">
        {Math.round(value)}
        {unit}
      </div>
      {/* <div className="text-center text-white/70 text-sm">{label}</div> */}
    </div>
  );
};

export default ThreeQuarterGauge;
