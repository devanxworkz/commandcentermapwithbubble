import React, { useEffect, useState } from "react";

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

const HalfArcGauge = ({ value = 0, max = 200, unit = "km/h", label = "Speed", width = 260 }) => {
  const cx = width / 2;
  const cy = width / 2;
  const outerR = 100;
  const trackR = 92;
  const progressR = 92;

  const START = 220;
  const END = 500;
  const span = END - START;

  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let frame;
    const animate = () => {
      setAnimatedValue((prev) => {
        const diff = value - prev;
        if (Math.abs(diff) < 0.5) return value;
        return prev + diff * 0.1;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const pct = Math.max(0, Math.min(animatedValue / max, 1));
  const progEnd = START + pct * span;

  return (
    <div
      style={{
        background: "#0B1622",
        borderRadius: 20,
        padding: "20px",
        boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "280px",
        height: "300px",
      }}
    >
      <svg width={width} height={140} viewBox={`0 0 ${width} 140`}>
        <defs>
          <linearGradient id="g-speed-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="60%" stopColor="#2AF6E6" />
            <stop offset="100%" stopColor="#00D0FF" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow */}
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
          stroke="#0E2230"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Progress */}
        <path
          d={arcPath(cx, cy, progressR, START, progEnd)}
          stroke="url(#g-speed-cyan)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 6px rgba(0, 240, 255, 0.6))" }}
        />

        {/* Value */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="32"
          fontWeight="700"
          fill="#FFFFFF"
        >
          {Math.round(animatedValue)}
        </text>
        {/* Unit */}
        <text
          x={cx + 35}
          y={cy - 6}
          fontSize="16"
          fill="#A9B6C4"
        >
          {unit}
        </text>

        {/* Label */}
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fontSize="14"
          fill="#A9B6C4"
        >
          {label}
        </text>
      </svg>
    </div>
  );
};

export default HalfArcGauge;
