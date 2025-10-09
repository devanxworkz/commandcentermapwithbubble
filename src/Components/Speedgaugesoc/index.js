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

const Speedgaugesoc = ({ value = 0, max = 200, width = 200, children }) => {
  const cx = width / 2;
  const cy = width / 2;
  const scale = width / 260;

  const outerR = 100 * scale;
  const trackR = 92 * scale;
  const progressR = 92 * scale;
  const strokeW = 18 * scale;

  const START = 0;
  const END = 360;
  const span = END - START;

  // Animate progress
  const pct = Math.max(0, Math.min(value / max, 1));
  const targetEnd = START + pct * span;

  const [animatedEnd, setAnimatedEnd] = useState(START);

  useEffect(() => {
    let frame;
    const duration = 800; // ms
    const start = animatedEnd;
    const delta = targetEnd - start;
    const startTime = performance.now();

    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      setAnimatedEnd(start + delta * t);
      if (t < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetEnd]);

  return (
    <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
      <defs>
        <linearGradient id="g-orange" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F57A0D" />
          <stop offset="100%" stopColor="#F57A0D" />
        </linearGradient>
      </defs>

      {/* Track */}
      <path
        d={arcPath(cx, cy, trackR, START, END)}
        stroke="#222"
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Progress (animated) */}
      <path
        d={arcPath(cx, cy, progressR, START, animatedEnd)}
        stroke="url(#g-orange)"
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
        style={{ filter: `drop-shadow(0 0 ${6 * scale}px rgba(242,125,9,1))` }}
      />

      {/* Children (center content) */}
       <foreignObject x="0" y="0" width={width} height={width}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="flex items-center justify-center w-full h-full text-white"
          style={{
            fontFamily: "sans-serif",
            fontSize: 14 * scale,
          }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
};

export default Speedgaugesoc;
