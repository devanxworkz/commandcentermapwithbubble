import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

const HistoryChart = ({ vin,  historyDatas  }) => {
  const [metricsSelected1, setMetricsSelected1] = useState([
    "currentconsumption",
  ]);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryChart, setShowHistoryChart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [autoMode, setAutoMode] = useState(true);
  const [startDateTime, setStartDateTime] = useState(
    getCurrentDateTimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000))
  );
  const [endDateTime, setEndDateTime] = useState(
    getCurrentDateTimeLocal(new Date())
  );
  const [showMetrics1, setShowMetrics1] = useState(false);

// For start & end time (already in your code)


  const metricOptions1 = [
    { key: "currentPositive", label: "Current generation (A)", color: "#13ff13" },
    { key: "currentNegative", label: "Current consumption (A)", color: "#ff0000" },
    { key: "speed_kmph", label: "Speed (km/h)", color: "#0ea5e9" },
    { key: "motortemp", label: "Motor temp (°C)", color: "#facc15" },
    { key: "controllermostemp", label: "Controller temp (°C)", color: "#fc6d07ff" },
    { key: "batvoltage", label: "Battery voltage (%)", color: "#FFF293" },
    { key: "soc", label: "Soc (%)", color: "rgba(251, 236, 252, 1)" },
    { key: "ntc1", label: "Positive terminal temp(°C)", color: "#8b5cf6" },
    { key: "ntc2", label: "Cell no 20 temp (°C)", color: "#bf06d4ff" },
    { key: "ntc3", label: "Cell no 50 temp (°C)", color: "#120befff" },
    { key: "ntc4", label: "Negative terminal temp(°C)", color: "#10b981" },
  ];

  // ✅ Metric selection handler
  const handleMetricChange1 = (key) => {
    setMetricsSelected1((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ✅ Local date conversion
  function getCurrentDateTimeLocal(date) {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  // ✅ Convert to UTC for API
  const toUTC = (date) => {
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  };

  // ✅ Handlers
  const handleStartChange = (val) => {
    setStartDateTime(val);
    setAutoMode(false);
  };
  const handleEndChange = (val) => {
    setEndDateTime(val);
    setAutoMode(false);
  };

  const resetToAuto = () => {
    setAutoMode(true);
    setStartDateTime(
      getCurrentDateTimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000))
    );
    setEndDateTime(getCurrentDateTimeLocal(new Date()));
  };

  // ✅ Auto-refresh effect
  useEffect(() => {
    if (!autoMode) return;
    const updateRange = () => {
      setStartDateTime(
        getCurrentDateTimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000))
      );
      setEndDateTime(getCurrentDateTimeLocal(new Date()));
    };
    updateRange();
    const timer = setInterval(updateRange, 60000);
    return () => clearInterval(timer);
  }, [autoMode]);

  // ✅ Fetch history API
  const fetchHistoricalData = async () => {
    if (!vin || !startDateTime || !endDateTime) {
      setAlertMessage("Please select VIN Number and dates.");
      return;
    }

    setLoading(true);
    setShowHistoryChart(false);

    try {
      const url = `https://ble.nerdherdlab.com/backtimedatfetch.php?vin=${encodeURIComponent(
        vin
      )}&start=${encodeURIComponent(toUTC(startDateTime))}&end=${encodeURIComponent(
        toUTC(endDateTime)
      )}`;

      console.log("Fetching:", url);
      const res = await fetch(url);
      const text = await res.text();
      const json = JSON.parse(text);
      const data = json.data || json;

      if (Array.isArray(data) && data.length > 0) {
        setHistoryData(data.reverse());
        setShowHistoryChart(true);
      } else {
        setHistoryData([]);
        setShowHistoryChart(false);
        setAlertMessage("No data available in this range.");
      }
    } catch (err) {
      console.error("Error loading history:", err);
      setAlertMessage("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Transform for recharts
  const processedData1 = historyData.map((item) => {
    const ntc = Array.isArray(item.ntc) ? item.ntc : [];
    return {
      time: item.time,
      currentPositive: item.currentconsumption > 0 ? item.currentconsumption : 0,
      currentNegative:
        item.currentconsumption < 0 ? Math.abs(item.currentconsumption) : 0,
      speed_kmph: item.speed_kmph,
      motortemp: item.motortemp,
      controllermostemp: item.controllermostemp,
      batvoltage: item.batvoltage,
      soc: item.soc,
      ntc1: ntc[0] ?? null,
      ntc2: ntc[1] ?? null,
      ntc3: ntc[2] ?? null,
      ntc4: ntc[3] ?? null,
    };
  });

  return (
    <>

<div className="mt-3">     
        {showHistoryChart && historyData.length > 0 && (
          <div
            className="relative mt-3 h-[500px] rounded-3xl bg-black
                          border border-[#FF9913]/30 shadow-[0_0_25px_rgba(255,153,19,0.3)]
                          backdrop-blur-xl overflow-hidden"
          >
            {/* --- Glow Background --- */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#FF991322,transparent_60%),
                                                radial-gradient(circle_at_bottom_right,#FF991322,transparent_60%)] animate-pulse"></div>
            {/* --- 📱 Mobile: Dropdown --- */}
            <div className="md:hidden p-3 relative z-20">
              <div
                onClick={() => setShowMetrics1(!showMetrics1)}
                className="w-full flex items-center justify-between px-3 py-2 
                          bg-black text-white rounded-lg shadow-md 
                          border border-[#FF9913]/30 text-sm font-medium cursor-pointer"
              >
                Select parameters to be shown on graph.
                <span>{showMetrics1 ? "▲" : "▼"}</span>
              </div>

              {showMetrics1 && (
                <div className="mt-2 bg-black border border-[#FF9913]/30 
                                rounded-xl p-3 space-y-2 shadow-lg max-h-60 overflow-y-auto">
                  {metricOptions1.map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-[#FF9913] transition"
                    >
                      <input
                        type="checkbox"
                        checked={metricsSelected1.includes(opt.key)}
                        onChange={() => handleMetricChange1(opt.key)}
                        className="accent-[#FF9913]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* --- Main Layout --- */}
            <div className="grid md:grid-cols-[1fr_220px] h-full relative z-10">
              {/* --- Chart --- */}
              <div className="p-4 mt-6 md:mt-0">
                <ResponsiveContainer
                  width="100%"
                  height={window.innerWidth < 768 ? 360 : 420}
                >
                  <LineChart
                    data={processedData1}
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
                      axisLine={{ stroke: "#fffbf7ff" }}
                      padding={{ left: 5, right: 5 }}
                      interval="preserveStartEnd"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date
                          .getHours()
                          .toString()
                          .padStart(2, "0")}:${date
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
                      axisLine={{ stroke: "#fcfffcff" }}
                      domain={["auto", "auto"]}
                    />

                    <ReferenceLine
                      y={0}
                      stroke="#ffffffff"
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

                    {/* --- Dynamic Lines --- */}
                    {metricOptions1
                      .filter((opt) => metricsSelected1.includes(opt.key))
                      .map((opt) => (
                        <Line
                          key={opt.key}
                          type="monotone"
                          dataKey={opt.key}
                          name={opt.label}
                          stroke={opt.color}
                          strokeWidth={1.8}
                          dot={false}
                          isAnimationActive={false}
                          connectNulls
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* --- 💻 Desktop: Sidebar --- */}
              <div className="hidden md:flex border-l border-[#FF9913]/20 bg-black backdrop-blur-md p-4 flex-col">
                <h3 className="text-sm font-Kanit text-white mb-2 border-b border-[#FF9913]/30 pb-1">
                  Select parameters to be shown on graph.
                </h3>
                <div className="flex flex-col gap-2">
                  {metricOptions1.map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-[#FF9913] transition"
                    >
                      <input
                        type="checkbox"
                        checked={metricsSelected1.includes(opt.key)}
                        onChange={() => handleMetricChange1(opt.key)}
                        className="accent-[#FF9913]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* --- Close Button --- */}
            <button
              onClick={() => setShowHistoryChart(false)}
              className="absolute bottom-6 right-8 z-20 px-5 py-2
                        bg-[#F61111] hover:bg-[#FF4500] 
                        text-white text-sm font-Kanit 
                        rounded-lg shadow-md border border-[#F61111]
                        backdrop-blur-sm
                        transition-all duration-300 ease-in-out
                        hover:scale-105"
            >
              Close
            </button>
          </div>
        )}
  </div>
</>



  );
};

export default HistoryChart;
