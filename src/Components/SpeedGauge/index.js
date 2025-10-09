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

const SpeedGauge = ({ value = 0, max = 200, width = 260, children }) => {
  const cx = width / 2;
  const cy = width / 2;
  const outerR = 100;
  const trackR = 92;
  const progressR = 92;

  const START = 0;
  const END = 360;
  const span = END - START;

  const pct = Math.max(0, Math.min(value / max, 1));
  const progEnd = START + pct * span;

  return (
    <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
      <defs>
        <linearGradient id="g-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F57A0D" />
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
        d={arcPath(cx, cy, outerR, START, END)}
        stroke="#F57A0D"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter="url(#softGlow)"
        opacity="0.9"
      />

      {/* Track */}
      <path
        d={arcPath(cx, cy, trackR, START, END)}
        stroke="#222"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Progress */}
      {pct < 1 ? (
        <path
          d={arcPath(cx, cy, progressR, START, progEnd)}
          stroke="url(#g-cyan)"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 6px rgba(242,125,9,1))" }}
        />
      ) : (
        <>
          <path
            d={arcPath(cx, cy, progressR, 0, 180)}
            stroke="url(#g-cyan)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
            style={{ filter: "drop-shadow(0 0 6px rgba(242,125,9,1))" }}
          />
          <path
            d={arcPath(cx, cy, progressR, 180, 360)}
            stroke="url(#g-cyan)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
            style={{ filter: "drop-shadow(0 0 6px rgba(242,125,9,1))" }}
          />
        </>
      )}

      {/* Children (custom overlay text) */}
      <foreignObject x={cx - 60} y={cy - 40} width="120" height="100">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="flex flex-col items-center justify-center text-white"
          style={{ fontFamily: "sans-serif" }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>

    
  );
};

export default SpeedGauge;
