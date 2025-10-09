import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import './index.css'

const MiniTempChart = ({
  data = [],
  dataKey = "motortemp",
  label = "Temp",
  color = "#60a5fa"
}) => {
  const latestValue = data.length > 0 ? data[data.length - 1][dataKey] : null;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-900/30 p-3">
      {/* Latest value top-left */}
      
      {latestValue !== null && (
        <div
         className="absolute top-2 right-3 text-lg font-bold , termo"
            style={{ color: color }}
        >
          {Math.round(latestValue)}°C
        
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-thermometer-half" viewBox="0 0 16 16">
  <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415"/>
  <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1"/>
</svg>
        </div> 
      )}

      {/* Chart label */}
      <div className="mb-2 text-xs text-white/70">{label}</div>

      {/* Chart */}
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#d1d5db", fontSize: 10 }}
              tickFormatter={(t) => {
                const d = new Date(t);
                return isNaN(d.getTime()) ? "" : d.toLocaleTimeString();
              }}
            />
            <YAxis
              width={30}
              tick={{ fill: "#d1d5db", fontSize: 10 }}
              tickFormatter={(v) => Math.round(v)}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(34,211,238,.25)"
              }}
              labelFormatter={(t) => {
                const d = new Date(t);
                return isNaN(d.getTime()) ? "" : d.toLocaleString();
              }}
              formatter={(v) => [Math.round(v), "°C"]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MiniTempChart;
