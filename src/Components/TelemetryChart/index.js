// src/Components/RealTimeChart.js
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

export default function TelemetryChart({ vin }) {
  const [livedatafor, setLivedatafor] = useState([]);
  const [metricsSelected, setMetricsSelected] = useState(["currentNegative"]);
  const [showMetrics, setShowMetrics] = useState(false);
  

  // ✅ Metric Options
  const metricOptions = [
    { key: "currentPositive", label: "Current generation (A)", color: "#13ff23" },
    { key: "currentNegative", label: "Current consumption (A)", color: "#ff0000" },
    { key: "speed_kmph", label: "Speed (km/h)", color: "#0ea5e9" },
    { key: "motortemp", label: "Motor temp (°C)", color: "#facc15" },
    { key: "controllermostemp", label: "Controller temp (°C)", color: "#fc6d07" },
    { key: "soc", label: "Soc (%)", color: "#ffffff" },
    { key: "batvoltage", label: "Battery voltage (V)", color: "#FFF293" },
    { key: "ntc1", label: "Positive terminal temp (°C)", color: "#8b5cf6" },
    { key: "ntc2", label: "Cell no 20 temp (°C)", color: "#bf06d4" },
    { key: "ntc3", label: "Cell no 50 temp (°C)", color: "#120bef" },
    { key: "ntc4", label: "Negative terminal temp (°C)", color: "#10b981" },
  ];

  // ✅ Fetch Live Data
  useEffect(() => {
    if (!vin) return;

    const apiUrl = `https://ble.nerdherdlab.com/telemery.php?vin=${vin}`;

    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl);
        const json = await res.json();
        if (Array.isArray(json)) {
          setLivedatafor(json);
        } else {
          setLivedatafor([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setLivedatafor([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, [vin]);

  // ✅ Process Data for Chart
  const processedData = Array.isArray(livedatafor)
    ? livedatafor.map((item) => ({
        time: item.time,
        currentPositive: item.currentconsumption > 0 ? item.currentconsumption : 0,
        currentNegative: item.currentconsumption < 0 ? Math.abs(item.currentconsumption) : 0,
        speed_kmph: item.speed_kmph,
        motortemp: item.motortemp,
        controllermostemp: item.controllermostemp,
        batvoltage: item.batvoltage,
        soc: item.soc,
        ntc1: item.ntc?.[0] ?? null,
        ntc2: item.ntc?.[1] ?? null,
        ntc3: item.ntc?.[2] ?? null,
        ntc4: item.ntc?.[3] ?? null,
        ntc5: item.ntc?.[4] ?? null,
        ntc6: item.ntc?.[5] ?? null,
        ntc7: item.ntc?.[6] ?? null,
        ntc8: item.ntc?.[7] ?? null,
      }))
    : [];

  // ✅ Handle Metric Selection
 
          const handleMetricChange = (key) => {
            if (metricsSelected.includes(key)) {
              setMetricsSelected(metricsSelected.filter((m) => m !== key));
            } else {
              setMetricsSelected([...metricsSelected, key]);
            }
          };

  return (
    <div className="relative h-full rounded-3xl bg-black border border-[#FF9913]/30 backdrop-blur-xl overflow-hidden">
     <div className="md:col-span-3 h-full">
             <div
               className="relative h-full rounded-3xl bg-black
                         border border-[#FF9913]/30 
                         backdrop-blur-xl overflow-hidden"
             >
               {/* --- Toggle Button --- */}
         <button
           onClick={() => setShowMetrics(true)}
           className="absolute top-3 right-3 z-20 px-3 py-1 text-xs md:text-sm
                     bg-[#0d0d0d] text-white border border-[#FF9913]/40 rounded-lg 
                     shadow hover:text-[#FF9913] transition mb-3"
         >
           Select parameters ▼
         </button>
     
     {/* --- Slide-out panel --- */}
         {showMetrics && (
           <div className="fixed top-0 right-0 h-full w-72 bg-black/95 border-l border-[#FF9913]/30 
                           shadow-xl p-5 z-50 flex flex-col">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-white">Select parameters</h3>
               <button
                 onClick={() => setShowMetrics(false)}
                 className="text-gray-400 hover:text-[#FF9913]"
           >
             ✕
           </button>
         </div>
     
         <div className="space-y-2">
           {metricOptions.map((opt) => (
             <label
               key={opt.key}
               className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-[#FF9913]"
             >
               <input
                 type="checkbox"
                 checked={metricsSelected.includes(opt.key)}
                 onChange={() => handleMetricChange(opt.key)}
                 className="accent-[#FF9913]"
               />
               {opt.label}
             </label>
           ))}
         </div>
       </div>
     )}
               {/* --- Chart --- */}
               <div className="p-4 relative z-10 h-full mt-5">
                 <ResponsiveContainer
                   width="100%"
                   height={window.innerWidth < 768 ? 360 : 450}
                 >
                   <LineChart
                     data={processedData}
                     margin={{
                       top: 10,
                       right: 10,
                       bottom: window.innerWidth < 768 ? 50 : 20,
                       left: 0,
                     }}
                   >
                     <CartesianGrid
                       strokeDasharray="3 3"
                       stroke="#33415540"
                       vertical={false}
                     />
                     <XAxis
                       dataKey="time"
                       tick={{
                         fill: "#ffffff",
                         fontSize: window.innerWidth < 768 ? 9 : 11,
                         fontWeight: 500,
                       }}
                       tickLine={false}
                       axisLine={{ stroke: "rgba(255, 254, 253, 1)" }}
                       padding={{ left: 5, right: 5 }}
                       interval="preserveStartEnd"
                       tickFormatter={(value) => {
                         const date = new Date(value);
                         return `${date.getHours().toString().padStart(2, "0")}:${date
                           .getMinutes()
                           .toString()
                           .padStart(2, "0")}`;
                       }}
                       angle={window.innerWidth < 768 ? -30 : 0}
                       textAnchor={window.innerWidth < 768 ? "end" : "middle"}
                       height={window.innerWidth < 768 ? 45 : 30}
                     />
                     <YAxis
                       tick={{
                         fill: "#ffffff",
                         fontSize: window.innerWidth < 768 ? 9 : 11,
                         fontWeight: 500,
                       }}
                       width={window.innerWidth < 768 ? 35 : 50}
                       tickLine={false}
                       axisLine={{ stroke: "#f5f2efff" }}
                       domain={["auto", "auto"]}
                     />
                     <ReferenceLine
                       y={0}
                       stroke="#f7f2ebff"
                       strokeDasharray="6 3"
                       strokeWidth={1.2}
                     />
                     <Tooltip
                       itemStyle={{ fontWeight: 500 }}
                       contentStyle={{
                         backgroundColor: "#0d0d0d",
                         border: "1px solid #3d3636ff",
                         borderRadius: "0.75rem",
                         padding: "6px 10px",
                         fontSize: window.innerWidth < 768 ? "10px" : "11px",
                       }}
                       formatter={(value, name, props) => {
                         const color = props.color || "#f1f5f9";
                         return [
                           <span style={{ color, fontWeight: 600 }}>{value}</span>,
                           name,
                         ];
                       }}
                     />
                     <Legend
                       wrapperStyle={{
                         color: "#ffffff",
                         fontSize: window.innerWidth < 768 ? 10 : 12,
                         fontWeight: 600,
                       }}
                       iconType="circle"
                     />
                     {metricOptions
                       .filter((opt) => metricsSelected.includes(opt.key))
                       .map((opt) => (
                         <Line
                           key={opt.key}
                           type="monotone"
                           dataKey={opt.key}
                           name={opt.label}
                           stroke={opt.color}
                           strokeWidth={2}
                           dot={false}
                           isAnimationActive={false}
                           connectNulls
                         />
                       ))}
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
    </div>
  );
}
