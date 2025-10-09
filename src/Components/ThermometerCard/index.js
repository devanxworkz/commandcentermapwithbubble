  const  ThermometerCard = ({
          label,
          value = 0,
          max = 120,
          min = 0,
          gradient = ["#06b6d4", "#3b82f6"],
          height = 160, // fixed height
        }) => {
          const safeMax = Math.max(min + 1, max);
          const clamped = Math.min(safeMax, Math.max(min, Number(value) || 0));
          const percent = ((clamped - min) / (safeMax - min)) * 100;

          const ticks = Array.from({ length: 6 }, (_, i) => {
            const frac = i / 5;
            return Math.round(min + (safeMax - min) * (1 - frac));
          });

          return (
            <div className="flex flex-col items-center w-[100px]"> 
              {/* 👆 fixed width so it doesn’t resize */}

              {/* Label + Value */}
              <div className="mb-2 text-center">
                <p className="text-xs  tracking-wide text-white/60 truncate">
                  {label}
                </p>
                <p className="text-lg font-Kaint text-white">
                  {clamped}°C
                </p>
              </div>

              {/* Thermometer column */}
              <div className="flex items-end gap-3">
                <div
                  className="relative w-8 overflow-hidden rounded-full border border-cyan-500/30 bg-0d0d0d flex-shrink-0"
                  style={{ height }} // fixed height
                >
                  <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-700"
                    style={{
                      height: `${percent}%`,
                      backgroundImage: `linear-gradient(to top, ${gradient[0]}, ${gradient[1]})`,
                      boxShadow: "0 -6px 20px rgba(56, 189, 248, 0.35) inset",
                    }}
                  />
                </div>
                {/* Ticks */}
                <div
                  className="flex flex-col justify-between text-[10px] text-white/60"
                  style={{ height }} // keep ticks same height
                >
                  {ticks.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-px w-3 bg-white/30" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

export default ThermometerCard;
