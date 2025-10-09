import React from "react";

const polar = (cx, cy, r, deg) => {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
};

const OnlyForsoc = ({ value = 0, max = 200, width = 260, unit = "", label = "" }) => {
  const cx = width / 2;
  const cy = width / 2;
  const outerR = 100;
  const trackR = 92;
  const progressR = 92;

  const START = 0;
  const END = 360; // adjust arc length
  const span = END - START;

  const pct = Math.max(0, Math.min(value / max, 1));
  const progEnd = START + pct * span;

  return (
    <svg width={200} height={200} viewBox={`0 0 ${width} ${width}`}>
      <defs>
        <linearGradient id="g-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f48106ff" />
          <stop offset="60%" stopColor="#f48106ff" />
          <stop offset="100%" stopColor="#f48106ff" />
          
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
        d={arcPath(cx, cy, outerR, START, END)}
        stroke="rgba(0, 240, 255, 0.9)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter="url(#softGlow)"
        opacity="0.9"
      />

      {/* Track */}
      <path
        d={arcPath(cx, cy, trackR, START, END)}
        stroke="#f48106ff"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Progress */}
      <path
        d={arcPath(cx, cy, progressR, START, progEnd)}
        stroke="#f48106ff"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
        style={{ filter: "drop-shadow(0 0 6px #f48106ff)" }}
      />

      {/* Inner circle
      <circle cx={cx} cy={cy} r={60} fill="#0B1622" />
      <circle cx={cx} cy={cy} r={65} fill="#0A141E" /> */}

      {/* Value */}
      <text
        x={cx}
        y={cy - (-15)}
        textAnchor="middle"
        fontSize="42"
        fontWeight="700"
        fill="#FFFFFF"
      >
        {Math.round(value)}
      </text>

      {/* Unit */}
      <text
        x={cx + 25}
        y={cy - (-15)}
        fontSize="18"
        fill="#A9B6C4"
      >
        {unit}
      </text>

      {/* Label */}
      <text
        x={cx}
        y={cy + 30}
        textAnchor="middle"
        fontSize="16"
        fill="#A9B6C4"
      >
        {label}
      </text>
    </svg>
  );
};

export default OnlyForsoc;
