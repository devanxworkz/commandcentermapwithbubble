import React from "react";

// Converts polar coordinates to cartesian
const polar = (cx, cy, r, deg) => {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

// Creates an SVG arc path between start and end degrees
const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
};

const OnlyForSpeed = ({
  label = "Gauge",
  value = 0,
  max = 100,
  unit = "%",
  width = 260,
  startAngle = 220,
  endAngle = 500
}) => {
  const cx = width / 2;
  const cy = width / 2;
  const outerR = 100;
  const trackR = 92;
  const progressR = 92;

  const span = endAngle - startAngle;
  const pct = Math.max(0, Math.min(value / max, 1));
  const progEnd = startAngle + pct * span;

  return (
    <div
    >
      <svg width={200} height={200} viewBox={`0 0 ${width} ${width}`}>
        <defs>
          <linearGradient id="g-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F57A0D" />
            <stop offset="60%" stopColor="#F57A0D" />
            <stop offset="100%" stopColor="#F57A0D" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer thin glow */}
        <path
          d={arcPath(cx, cy, outerR, startAngle, endAngle)}
          stroke="#ea8016ff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter="url(#softGlow)"
          opacity="0.9"
        />

        {/* Track */}
        <path
          d={arcPath(cx, cy, trackR, startAngle, endAngle)}
          stroke="#f5790d05"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Progress */}
        <path
          d={arcPath(cx, cy, progressR, startAngle, progEnd)}
          stroke="#F57A0D"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 6px #F57A0D" }}
        />

        Inner circle
        {/* <circle cx={cx} cy={cy} r={60} fill="#e6e9edff" />
        <circle cx={cx} cy={cy} r={65} fill="#1b72dd65" /> */}

        {/* Label */}
       {/* Value + Unit inline */}
<text
  x={cx}
  y={cy -4}
  textAnchor="middle"
  fontSize="35"
  fontWeight="700"
  fill="#FFFFFF"
>
  {Math.round(value)}
</text>

 <text
          x={cx}
          y={cy + 30}
          textAnchor="middle"
          fontSize="12"
          fill="#A9B6C4"
        >
          {label}
        </text>
    
      </svg>
    </div>
  );
};

export default OnlyForSpeed;
