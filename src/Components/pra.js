import React, { useEffect, useMemo, useState,useRef,inputRef } from "react";
import { Calendar } from "lucide-react";


import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine
} from "recharts";
// keep your existing gauges

import SpeedGauge from "../SpeedGauge";
import OnlyForSpeed from "../OnlyForSpeed";
import ThreeQuarterGauge from "../ThreeQuarterGauge";
import OnlyForsoc from '../OnlyForsoc'
import "./index.css"
// import ThermometerCard from '../ThermometerCard'



const fmt = {
  num(x, d = 2) {
    if (x === undefined || x === null || isNaN(Number(x))) return "N/A";
    const n = Number(x);
    return Math.abs(n) >= 1000 ? n.toFixed(0) : n.toFixed(d);
  },
  parseDate(t) {
    if (!t) return null;
    const d = new Date(t);
    return isNaN(d) ? null : d;
  },
  when(t) {
    const d = fmt.parseDate(t);
    return d ? `${d.toLocaleDateString()} ${d.toLocaleTimeString()}` : "";
  },
};
const SectionTitle = ({ left, right }) => (
  <div className="mb-3 flex items-center justify-between bg-transferent px-3 py-2 rounded-md">
    <h3 className="text-xs sm:text-sm tracking-widest text-white transition-colors duration-200 hover:text-[#FF9913]">
      {left}
    </h3>
    {right}
  </div>
);

const StatChip = ({ label, value }) => (
  <div className="rounded-xl bg-[#0d0d0d] px-3 py-2 transition-colors duration-200">
    <p className="text-[10px] tracking-wide text-white/70">{label}</p>
    <p className="break-all text-sm sm:text-base font-semibold text-white hover:text-[#FF9913]">
      {value}
    </p>
  </div>
);






// ✅ Utility function (outside your component)
async function getReadableLocation(lat_long) {
  if (!lat_long) return "N/A";

  let lat, lng;

  // If already object
  if (typeof lat_long === "object") {
    if (Array.isArray(lat_long)) {
      [lat, lng] = lat_long;
    } else {
      lat = lat_long.lat ?? lat_long.latitude;
      lng = lat_long.lng ?? lat_long.lon ?? lat_long.longitude;
    }
  }

  // If string like "15.88, 74.66"
  if (typeof lat_long === "string" && lat_long.includes(",")) {
    [lat, lng] = lat_long.split(",").map((n) => parseFloat(n.trim()));
  }

  lat = parseFloat(lat);
  lng = parseFloat(lng);

  if (isNaN(lat) || isNaN(lng)) return "N/A";

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}




const CARD_BASE_TRANSPARENT =
  "rounded-2xl border-2 border-white/20 bg-transparent p-4 transition-colors duration-300 hover:border-[#FF9913]";

const CARD_BASE = 
  "rounded-2xl border border-white/10 bg-black p-4 transition-colors duration-300 hover:border-[#FF9913]";

const CARD_BASE_GLOW  =
  "rounded-2xl border border-[#FF9913]/30 bg-black p-4 shadow-[0_0_20px_rgba(255,153,19,0.4)] hover:border-[#FF9913] hover:shadow-[0_0_30px_rgba(255,153,19,0.7)] transition-colors duration-300";

const CARD_BASE_FLAT =
  "rounded-2xl border border-white/30 bg-black p-4 transition-colors duration-300 hover:border-[#FF9913]";

const CARD_MIN_H = "min-h-[220px]"; // same height across the grid

const CARD_CLICK_OVERLAY =
  "absolute inset-0 rounded-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF9913]";



// Wrap any content so the WHOLE card opens a modal when clicked
function Svg({ title, children, minH = CARD_MIN_H, maxW = "max-w-5xl", glow = false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={`relative ${glow ? CARD_BASE_GLOW : CARD_BASE_FLAT} ${minH} 
                    transition-colors duration-300 hover:border-[#FF9913]`}
      >
        {/* Invisible overlay for click-to-expand */}
        <button
          type="button"
          className={CARD_CLICK_OVERLAY}
          aria-label={`Expand ${title || "card"}`}
          onClick={() => setOpen(true)}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
}

 const CustomAlert = ({ message, onClose }) => {
          if (!message) return null;

          return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
              ></div>

              {/* Alert Box */}
              <div className="relative z-10 w-[350px] rounded-2xl bg-black border border-[#FF9913]/40 shadow-[0_0_25px_rgba(255,153,19,0.6)] p-6 flex flex-col items-center">
                <img src={"https://image2url.com/images/1755511837883-d480dc7d-7419-4341-acc6-decf0d6810b5.png"} alt="Logo" className="w-16 h-16 mb-3" />
                <p className="text-center text-white text-base font-medium mb-4">
                  {message}
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold hover:opacity-90 transition"
                >
                  OK
                </button>
              </div>
            </div>
          );
        };

function ThermometerCard({
  label,
  value = 0,
  max = 120,
  min = 0,
  gradient = ["#06b6d4", "#3b82f6"],
  height = 160,
}) {
  const safeMax = Math.max(min + 1, max);
  const clamped = Math.min(safeMax, Math.max(min, Number(value) || 0));
  const percent = ((clamped - min) / (safeMax - min)) * 100;

  const ticks = Array.from({ length: 6 }, (_, i) => {
    const frac = i / 5;
    return Math.round(min + (safeMax - min) * (1 - frac));
  });

  return (
    <div className="flex flex-col items-center w-[100px]">
      {/* Label + Value */}
      <div className="mb-2 text-center">
        <p className="text-xs  tracking-wide text-white/60 truncate">
          {label}
        </p>
        <p className="text-lg font-semibold text-white">{clamped}°C</p>
      </div>

      {/* Thermometer column */}
      <div className="flex items-end gap-3">
        <div
          className="relative w-8 overflow-hidden rounded-full border border-cyan-500/30 bg-[#0d0d0d] flex-shrink-0"
          style={{ height }}
        >
          <div
            className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000"
            style={{
              height: `${percent}%`,
              backgroundImage: `linear-gradient(to top, ${gradient[0]}, ${gradient[1]})`,
              boxShadow:
                "0 -6px 20px rgba(56, 189, 248, 0.35) inset, 0 0 15px rgba(56,189,248,0.6)",
            }}
          >
            {/* Optional pulsing shine */}
            <div
              className="absolute top-0 left-0 w-full h-full rounded-full animate-pulse-slow"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
        </div>

        {/* Ticks */}
        <div
          className="flex flex-col justify-between text-[10px] text-white/60"
          style={{ height }}
        >
          {ticks.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-px w-3 bg-white/30" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s infinite;
        }
      `}</style>
    </div>
  );
}







/* =========================
   Main
========================= */
export default function RealTimeChart({ vin: initialVin }) {
  const [vin, setVin] = useState(initialVin || "");
  const [vinList, setVinList] = useState([]);
  const [data, setData] = useState([]);
  // const [startDateTime, setStartDateTime] = useState("");
  // const [endDateTime, setEndDateTime] = useState("");
  const [mode, setMode] = useState("realtime");
  const [details, setDetails] = useState([]);
  const [showInAHChart, setShowInAHChart] = useState(false);
  const [latestGauges, setLatestGauges] = useState(null);
  const [livedata, setLiveData] = useState([]); // ✅ start as empty array
  // const [showChart, setShowChart] = useState(false);
const [historyData, setHistoryData] = useState([]);
const [showHistoryChart, setShowHistoryChart] = useState(false);

const [ntcData, setNtcData] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isSelecting, setIsSelecting] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [showHistoryChart, setShowHistoryChart] = useState(false);
const [selectedVin, setSelectedVin] = useState(null);
const [showMetrics1, setShowMetrics1] = useState(false);
const [isSelected, setIsSelected] = useState(false); // ✅ new flag


        const [startDateTime, setStartDateTime] = useState(getCurrentDateTimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000)));
        const [endDateTime, setEndDateTime] = useState(getCurrentDateTimeLocal(new Date()));
        const [alertMessage, setAlertMessage] = useState("");
        const [userChanged, setUserChanged] = useState(false);
    const [autoMode, setAutoMode] = useState(true); // ✅ controls auto-update
  const intervalRef = useRef(null);

  const inputRef = useRef(null);


  const [locationMap, setLocationMap] = React.useState({});

const [tick, setTick] = React.useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setTick((prev) => prev + 1); // 🔄 refresh every second
  }, 1000);
  return () => clearInterval(interval);
}, []);


  

const [apiUrl, setApiUrl] = useState("");

const [locationName, setLocationName] = useState("Loading...");
const [coords, setCoords] = useState({ lat: null, lng: null });

const rawLatLong =  details?.lat_long || "";

useEffect(() => {
  if (!rawLatLong) return;

  const [lat, lng] = rawLatLong.split(",").map((n) => parseFloat(n.trim()));

  if (isNaN(lat) || isNaN(lng)) {
    console.error("Invalid lat/lng:", rawLatLong);
    setLocationName("Invalid location");
    setCoords({ lat: null, lng: null });
    return;
  }

  // ✅ Always show raw coords first
  setCoords({ lat, lng });
  setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

  // ✅ Debounce reverse lookup (avoid spamming API)
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.display_name) {
          setLocationName(data.display_name);
        }
      })
      .catch(() => {
        // fallback: keep coords
        setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      });
  }, 1500); // 👈 wait 1.5s before calling API

  return () => {
    clearTimeout(timeout);
    controller.abort();
  };
}, [rawLatLong]);// 👈 track changes



// ✅ Options for checkbox
// Graph States
const [livedatafor, setLivedatafor] = useState([]);
const [metricsSelected, setMetricsSelected] = useState(["currentconsumption"]);

const [metricsSelected1, setMetricsSelected1] = useState(["currentconsumption"]);


// const [metricsSelected, setMetricsSelected] = useState(["currentconsumption"]);
const [showMetrics, setShowMetrics] = useState(false); // mobile dropdown toggle


 const metricOptions = [
            { key: "currentPositive", label: "Current generation (A)", color: "#13ff23" },
            { key: "currentNegative", label: "Current consumption (A)", color: "#ff0000" },
            { key: "speed_kmph", label: "Speed (km/h)", color: "#0ea5e9" },            // Bright blue
          { key: "motortemp", label: "Motor temp (°C)", color: "#facc15" },          // Bright yellow
          { key: "controllermostemp", label: "Controller temp (°C)", color: "#fc6d07ff" },
          {key : "soc", label:"Soc (%)" , color:"#ffff"}, 
          {key : "inah", label:"Inah (Ah)" , color:"#f48cc7ff"},  
          {key : "outah", label:"Outah (Ah)" , color:"#e0f892ff"},  // Orange
          {key : "batvoltage", label:"Battery voltage (%)" , color:"#FFF293"},   // Orange
          // {key : "lat_long", label:"location" , color:"#93dad1ff"},   // Orange
          { key: "ntc1", label: "Positive terminal temp(°C)", color: "#8b5cf6" },                         // Violet
          { key: "ntc2", label: "Cell no 20 temp (°C)", color: "#bf06d4ff" },                         // Cyan
          { key: "ntc3", label: "Cell no 50 temp (°C)", color: "#120befff" },                         // Pinkish red
          { key: "ntc4", label: "Negative terminal temp(°C)", color: "#10b981" },
          
          // {key : "tripkm", label:"Tripkm (km/h)" , color:"#0000"},  
                           // Light yellow
        ];

 const metricOptions1 = [
          { key: "currentPositive", label: "Current generation (A)", color: "#13ff23" },
          { key: "currentNegative", label: "Current consumption (A)", color: "#ff0000" },
          { key: "speed_kmph", label: "Speed (km/h)", color: "#0ea5e9" },            // Bright blue
          { key: "motortemp", label: "Motor temp (°C)", color: "#facc15" },          // Bright yellow
          { key: "controllermostemp", label: "Controller temp (°C)", color: "#fc6d07ff" },
          {key : "soc", label:"Soc (%)" , color:"#ffff"},  
          {key : "inah", label:"Inah (Ah)" , color:"#f48cc7ff"},  
          {key : "outah", label:"Outah (Ah)" , color:"#e0f892ff"},  // Orange
          {key : "batvoltage", label:"Battery voltage (%)" , color:"#FFF293"},  
          // {key : "lat_long", label:"location" , color:"#93dad1ff"},   // Orange
          { key: "ntc1", label: "Positive terminal temp(°C)", color: "#8b5cf6" },                         // Violet
          { key: "ntc2", label: "Cell no 20 temp (°C)", color: "#bf06d4ff" },                         // Cyan
          { key: "ntc3", label: "Cell no 50 temp (°C)", color: "#120befff" },                         // Pinkish red
          { key: "ntc4", label: "Negative terminal temp(°C)", color: "#10b981" }, 
            // {key : "tripkm", label:"Tripkm (km/h)" , color:"#0000"},  
                          // Light yellow
        ];

   const handleMetricChange = (key) => {
    if (metricsSelected.includes(key)) {
      setMetricsSelected(metricsSelected.filter((m) => m !== key));
    } else {
      setMetricsSelected([...metricsSelected, key]);
    }
  };

  const handleMetricChange1 = (key) => {
    setMetricsSelected1((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Fetch live telemetry
  useEffect(() => {
    if (!vin) return;

    const apiUrl = `https://ble.nerdherdlab.com/telemery.php?vin=${vin}`;
    const fetchData = async () => {
  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    // console.log("API response:", json);

    if (Array.isArray(json)) {
      setLivedatafor(json);
    } else {
      setLivedatafor([]); // fallback if error object
    }
  } catch (err) {
    console.error("Fetch error:", err);
    setLivedatafor([]);
  }
};


    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 2 sec
    return () => clearInterval(interval);
  }, [vin]);

  // Preprocess data for chart
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
      inah: item.inah,
      outah: item.outah,
      // lat_long: item.lat_long,

      
      ntc1: item.ntc?.[0] ?? null,
      ntc2: item.ntc?.[1] ?? null,
      ntc3: item.ntc?.[2] ?? null,
      ntc4: item.ntc?.[3] ?? null,
      ntc5: item.ntc?.[4] ?? null,
      ntc6: item.ntc?.[5] ?? null,
      ntc7: item.ntc?.[6] ?? null,
      ntc8: item.ntc?.[7] ?? null,
      tripkm: item.tripkm
    }))
  : [];

const processedData1 = historyData.map((item) => {
  const ntc = Array.isArray(item.ntc) ? item.ntc : []; // safe fallback to empty array
  return {
    time: item.time,
    currentPositive: item.currentconsumption > 0 ? item.currentconsumption : 0,
    currentNegative: item.currentconsumption < 0 ? Math.abs(item.currentconsumption) : 0,
    speed_kmph: item.speed_kmph,
    motortemp: item.motortemp,
    controllermostemp: item.controllermostemp,
    batvoltage:item.batvoltage,
    soc:item.soc,
    inah: item.inah,
    outah: item.outah,
    // lat_long: item.lat_long,

    ntc1: ntc[0] ?? null,
    ntc2: ntc[1] ?? null,
    ntc3: ntc[2] ?? null,
    ntc4: ntc[3] ?? null,
    ntc5: ntc[4] ?? null,
    ntc6: ntc[5] ?? null,
    ntc7: ntc[6] ?? null,
    ntc8: ntc[7] ?? null,
    tripkm: item.tripkm
  };
});




useEffect(() => {
  processedData.forEach((row) => {
    if (row.lat_long && !locationMap[row.lat_long]) {
      getReadableLocation(row.lat_long).then((name) => {
        setLocationMap((prev) => ({ ...prev, [row.lat_long]: name }));
      });
    }
  });
}, [processedData]);


React.useEffect(() => {
    processedData.forEach((row) => {
      if (row.lat_long && !locationMap[row.lat_long]) {
        getReadableLocation(row.lat_long).then((name) => {
          setLocationMap((prev) => ({ ...prev, [row.lat_long]: name }));
        });
      }
    });
  }, [processedData]);




useEffect(() => {
  if (!vin) return;
  fetch(`https://ble.nerdherdlab.com/latest_ntc.php?vin=${vin}`)
    .then(res => res.json())
    .then(json => setNtcData(json))
    .catch(err => console.error("NTC fetch error:", err));
}, [vin]);


// Search API call
  useEffect(() => {
    if (isSelected) return; // don’t refetch once a VIN is chosen

    if (searchValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://ble.nerdherdlab.com/search_vehicle.php?q=${searchValue}`
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }

        setHighlightIndex(-1);
      } catch (err) {
        console.error("Error fetching suggestions", err);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [searchValue, isSelected]);

  // ✅ Central function to finalize selection + fetch
  const handleSelect = (vinNumber) => {
    setSearchValue(vinNumber);
    setVin(vinNumber); // 🚀 actual fetch triggered
    setIsSelected(true);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

async function fetchLatestByVin(v) {
  if (!v) return;
  try {
    const res = await fetch(`https://ble.nerdherdlab.com/socapulastdata.php?vin=${encodeURIComponent(v)}`);
    const json = await res.json();
    if (!json || json.error) return;
    setLatestGauges(json);
  } catch (e) {
    console.error("latest_by_vin error", e);
  }
}

useEffect(() => {

  const trimmedVin = vin?.trim();
  if (!trimmedVin) {
    setDetails(null);
    return;
  }
  if (!vin) return;

  // initial pull
  fetchLatestByVin(vin);

  // live refresh (every 2–3s feels snappy; match your backend insert rate)
  const id = setInterval(() => fetchLatestByVin(vin), 5000);

  return () => clearInterval(id);
}, [vin]);


  useEffect(() => {
  const trimmedVin = vin?.trim();

  // if no VIN → clear state and stop fetching
  if (!trimmedVin) {
    setDetails(null);
    setLiveData([]); // clear old data too
    return;
  }

  const fetchLiveData = async () => {
    try {
      const res = await fetch(
        `https://ble.nerdherdlab.com/selcectvinlastdata.php?vin=${trimmedVin}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      // normalize → always an array
      const arr = Array.isArray(json) ? json : json ? [json] : [];

      // reverse so newest is last
      setLiveData(arr.reverse());
    } catch (err) {
      console.error("Live telemetry fetch error:", err);
    }
  };

  // initial fetch
  fetchLiveData();

  // repeat fetch every 5s
  const interval = setInterval(fetchLiveData, 5000);

  // cleanup on unmount or vin change
  return () => clearInterval(interval);
}, [vin]);


    // const [vin, setVin] = useState(initialVin || "");
  // VIN list

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`https://ble.nerdherdlab.com/all_vinfetch.php`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setVinList(json);
          if (!initialVin) setVin(json[0]);
        } else {
          setVinList([]);
          setVin("");
        }
      } catch (e) {
        console.error("VIN list error", e);
      }
    })();
  }, [initialVin]);

  // // Date and time 

function getCurrentDateTimeLocal(date) {
  const offset = date.getTimezoneOffset(); 
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}




// batches messages so we don't block the UI
function setupMessageBatch(processBatch, interval = 300) {
  let queue = [];
  let timer = null;

  const handler = (e) => {
    queue.push(e.data);
    if (!timer) {
      timer = setTimeout(() => {
        const batch = queue;
        queue = [];
        timer = null;
        // Defer heavy work so we never block the "message" event
        setTimeout(() => processBatch(batch), 0);
      }, interval);
    }
  };

}

  // Vehicle details by VIN
useEffect(() => {
  const trimmedVin = vin?.trim();
  if (!trimmedVin) {
    setDetails(null);
    return;
  }

  let intervalId;

  const fetchDetails = async () => {
    try {
      const res = await fetch(
        `https://ble.nerdherdlab.com/fetch_allvinmodeldtat.php?vin=${encodeURIComponent(trimmedVin)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDetails(json?.data || {});
    } catch (e) {
      console.error("Vehicle details error", e);
    }
  };

  // 🔹 fetch immediately
  fetchDetails();

  // 🔹 then poll every 5s (or 1s if you need super live updates)
  intervalId = setInterval(fetchDetails, 5000);

  // cleanup
  return () => clearInterval(intervalId);
}, [vin]);




   const fetchLast200Data = async () => {
    if (!vin) return;
    try {
      const res = await fetch(
        `https://ble.nerdherdlab.com/selcectvinlastdata.php?vin=${vin}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : json ? [json] : [];
      setLiveData(arr.reverse()); // reverse so latest appears at the bottom/right
    } catch (e) {
      console.error("History error", e);
    }
  };

  // ✅ run once when VIN changes
  useEffect(() => {
    if (!vin) return;
    fetchLast200Data();
  }, [vin]);

  // Data fetching (realtime & historical)
  const fetchRealtimeData = async () => {
    if (!vin) return;
    try {
      const res = await fetch(`https://ble.nerdherdlab.com/real_timedata1.php`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : json ? [json] : [];
      setData(arr.reverse());
    } catch (e) {
      console.error("Realtime error", e);
    }
  };

  function getCurrentDateTimeLocal(date) {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }
// ✅ Convert to UTC string for API
  const toUTC = (date) => {
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  };

// ✅ Handlers (manual selection disables auto mode)
 const handleStartChange = (val) => {
    setStartDateTime(val);
    setAutoMode(false); // stop auto
  };
  const handleEndChange = (val) => {
    setEndDateTime(val);
    setAutoMode(false); // stop auto
  };

  const resetToAuto = () => {
    setAutoMode(true);
    setStartDateTime(getCurrentDateTimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000)));
    setEndDateTime(getCurrentDateTimeLocal(new Date()));
  };
// ✅ Auto-refresh effect (runs only when autoMode = true)
  useEffect(() => {
    if (!autoMode) return;

    const updateRange = () => {
      setStartDateTime(getCurrentDateTimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000)));
      setEndDateTime(getCurrentDateTimeLocal(new Date()));
    };

    updateRange(); // first run
    const timer = setInterval(updateRange, 60000);

    return () => clearInterval(timer);
  }, [autoMode]);

// ✅ Fetch data
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

  // Poll realtime every 5s
  useEffect(() => {
    if (!vin) return;
    let intv;
    if (mode === "realtime") {
      fetchRealtimeData();
      intv = setInterval(fetchRealtimeData, 2000);
    }
    return () => intv && clearInterval(intv);
  }, [vin, mode]);
  

  const latest = useMemo(() => (data?.length ? data[0] : {}), [data]);

  return (
<div className="min-h-screen bg-[radial-gradient(circle_at_top,_#000000_70%)] text-white">
  {/* Your content here */}
      {/* Header */}
   <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-4">
    
    {/* 🔹 Left side with Logo + Title */}
    <div className="flex items-center gap-3">
      <img
        src="https://image2url.com/images/1755511837883-d480dc7d-7419-4341-acc6-decf0d6810b5.png"   // <-- Replace with your logo URL or /public path
        alt="Rivot Motors"
        className="h-10"
      />
      <h1 className="text-white font-semibold tracking-wide sm:text-xl">
        RIVOT MOTORS <span className="text-white">COMMAND CENTER</span>
      </h1>
    </div>
  </div>
</header>

    <main className="mx-auto max-w-7xl px-4 py-6">
  {/* ✅ One Big Card */}
{/* 🔥 Big Card with Glow */}
<div className="relative rounded-xl border border-[#FF9913]/40 bg-black p-6 
     shadow-[0_0_25px_rgba(255,153,19,0.6)] transition-colors duration-300 hover:border-[#FF9913]">
  
  <div className="absolute -inset-1 rounded-2xl 
                  bg-[radial-gradient(circle_at_top_left,#FF9913,transparent_70%),
                      radial-gradient(circle_at_top_right,#22d3ee55,transparent_70%), 
                      radial-gradient(circle_at_bottom_left,#22d3ee55,transparent_70%), 
                      radial-gradient(circle_at_bottom_right,#22d3ee55,transparent_70%)] 
                  blur-2xl opacity-80 pointer-events-none"></div>


  {/* Content wrapper stays above */}
  <div className="relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Vehicle Card */}
<Svg title="Vehicle" minH={200} glow={false}>
      <SectionTitle left="Scooter details" />
 <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
   <div className="relative flex-1">
      <input
        id="searchInput"
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          setIsSelected(false); // reset when typing
        }}
        onKeyDown={(e) => {
          if (!showSuggestions || suggestions.length === 0) {
            if (e.key === "Enter" && searchValue.trim() !== "") {
              e.preventDefault();
              handleSelect(searchValue); // ✅ Enter fetches
            }
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0 && suggestions[highlightIndex]) {
              handleSelect(suggestions[highlightIndex].vinnumber);
            } else {
              handleSelect(searchValue); // fallback if typed only
            }
          } else if (e.key === "Escape") {
            setShowSuggestions(false);
            setHighlightIndex(-1);
          }
        }}
        placeholder="Search by VIN / Name / Phone"
        className="w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm outline-none 
           transition-colors duration-300 
           hover:border-[#FF9913] focus:border-[#FF9913] pr-8"
      />

      {/* ❌ Clear button */}
      {searchValue && (
        <button
          type="button"
          onClick={() => {
            setSearchValue("");
            setIsSelected(false);
            setHighlightIndex(-1);
            setShowSuggestions(false);

            // keep cursor active in input
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF9913] transition"
        >
          ✕
        </button>
      )}
    </div>


        {/* Go Button */}
        <button
          onClick={() => {
            if (searchValue.trim() !== "") {
              handleSelect(searchValue); // ✅ Go fetches
            }
          }}
        className="px-3 py-2 rounded-xl bg-[#FF9913] hover:bg-[#e67e00] text-white
         text-sm transition-colors duration-300"
        >
          Go
        </button>
      </div>

      {/* Suggestions Dropdown */}
     {showSuggestions && suggestions.length > 0 && (
  <ul className="absolute left-0 top-full mt-1 w-full rounded-lg bg-[#0d0d0d] border border-slate-600 max-h-60 overflow-y-auto shadow-lg z-20">
    {suggestions.map((s, i) => (
      <li
        key={i}
        onClick={() => handleSelect(s.vinnumber)}
        className={`px-3 py-2 cursor-pointer ${
          i === highlightIndex
            ? "bg-[#FF9913]/50 text-white"
            : "hover:bg-[#FF9913]/30 hover:text-white"
        }`}
      >
        <div className="font-medium text-white">{s.vinnumber}</div>
        <div className="text-xs text-slate-400">
          {s.ownername} • {s.phonenumber}
        </div>
      </li>
    ))}
  </ul>
)}
    </div>

      {/* VIN Dropdown (old one, optional) */}
      <div className="mt-3 grid grid-cols-2 gap-2">
<StatChip
                  label="VIN-Number"
                  value={(details?.vinnumber || details?.vinNumber || vin) || "N/A"}
                />
                <StatChip label="Model" value={details?.model || "N/A"} />
                <StatChip
                  label="Owner"
                  value={details?.ownerName || details?.ownername || "N/A"}
                />
              <StatChip
          label="Phone"
          value={
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="orange"
                viewBox="0 0 16 16"
                className="bi bi-telephone-fill"
              >
                <path
                  fillRule="evenodd"
                  d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 
                  2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 
                  0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 
                  .644.178l2.189-.547a1.75 1.75 0 0 1 
                  1.494.315l2.306 1.794c.829.645.905 
                  1.87.163 2.611l-1.034 1.034c-.74.74-1.846 
                  1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 
                  18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
                />
              </svg>
              <span>{details?.phoneNumber || details?.phonenumber || "N/A"}</span>
            </div>
          }
        />

        <StatChip
          label="Scooter Lock/Unlock state"
          value={
            <div className="flex justify-center mt-1">
              <div
                className={`text-xs font-Kanit px-4 py-1 rounded-full border transition-all duration-300
                  ${
                    latestGauges?.ev_power_state === "ON"
                      ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_1px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_5px_rgba(34,197,94,0.7)]"
                      : "bg-red-900/40 text-red-400 border-red-500/40 shadow-[0_0_10px_1px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_5px_rgba(239,68,68,0.7)]"
                  }`}
              >
                {latestGauges?.ev_power_state === "ON" ? "Unlocked" : "Locked"}
              </div>
            </div>
          }
        />
            <StatChip
          label="Current rider"
          value={
            <div className="flex items-center gap-2 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="orange"
                viewBox="0 0 16 16"
                className="bi bi-person-fill"
              >
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
              </svg>
              <span>{latestGauges?.currentrider || "N/A"}</span>
            </div>
          }
        />
      </div>
    </Svg>
      {/* Component Data */}
         <Svg title="Component Data" minH={CARD_MIN_H} glow={false}>
                <SectionTitle left="Component data" />
                <div className="grid grid-cols-2 gap-3">
                  <StatChip label="Controller serial No." value={details?.controllerid  || "N/A"} />
                  <StatChip label="Motor serial No." value={details?.motorid || "N/A"} />
                  <StatChip label="BMS serial No." value={details?.bmsid || "N/A"} />
                  <StatChip label="RideOS version" value={details?.rideosversion || "N/A"} />
                  <StatChip label="Smartkey ID" value={details?.smartkeyid || "N/A"} />
                  <StatChip label="Charger serial No." value={ details?.chargerid ?? "N/A"} />
                </div>
              </Svg>

      {/* Vehicle Info (remaining data only) */}
       <Svg title="Vehicle Info" minH="min-h-[160px]" glow={false}>
              <SectionTitle left="Scooter status" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "ODO meter", key: "odo", src: "allvin" },
                { label: "Bms life cycles", key: "bmslifecycles", src: "allvin" },
                { label: "Trip km", key: "tripkm", src: "realtime" },
                { label: "Charging state", key: "chargingstate", src: "allvin" },
                { label: "Handle lock state", key: "handlelockstate", src: "allvin" },
                { label: "Remaining capacity Ah ", key: "remainingcapacity_ah", src: "realtime" },
                { label: "Location", key: "lat_long", src: "allvin" },
                // { label: "Time", key: "time", src: "allvin" },
              ].map((t) => {
                const srcObj = t.src === "allvin" ? details : t.src === "realtime" ? latestGauges : {};
                const raw = srcObj?.[t.key];

                let val = raw === null || raw === undefined || raw === "" ? "N/A" : raw;
                let color = "text-white";
                let icon = "";

                // 👉 Replace only Location with human-readable value
if (t.key === "lat_long") {
  if (raw && typeof raw === "string") {
    const [lat, lng] = raw.split(",").map((n) => parseFloat(n.trim()));
    if (!isNaN(lat) && !isNaN(lng)) {
      const rawTime = details?.time;
      let formattedTime = "N/A";

      if (rawTime) {
        const d = new Date(rawTime);
        if (!isNaN(d.getTime())) {
          // 👉 format: DD:MM:YYYY HH:MM AM/PM
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          let hours = d.getHours();
          const minutes = String(d.getMinutes()).padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12 || 12;
          formattedTime = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        }
      }

      val = (
        <div
          className="flex flex-col items-center space-y-1"
          key={`loc-${tick}`}
        >
          {/* ✅ Inline Location */}
          <span className="text-xs md:text-sm text-blue-300">
            {locationName || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
          </span>

          {/* Map link */}
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-blue-500 underline hover:text-blue-400"
          >
            View on Map
          </a>

          {/* ✅ Raw coordinates with Lat_Long label */}
          <span className="text-[11px] text-white/70">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>

          {/* ✅ Inline Last Updated + Time */}
          <span className="text-[11px] text-orange-500 font-medium">
            <span className="text-gray-400 mr-1">Last updated:</span>
            {formattedTime}
          </span>
        </div>
      );
    }
  }
}


                if (t.key === "chargingstate") {
                  if (Number(raw) === 1) {
                    val = "Charging";
                    color = "text-blue-400 animate-pulse";
                    icon = "⚡";
                  } else if (Number(raw) === 0) {
                    val = "Not charging";
                    color = "text-gray-400";
                    icon = "🔋";
                  }
                }

              if (t.key === "handlelockstate") {
          if (Number(raw) === 1) {
            val = (
              <div
                className={`text-xs font-Kanit px-4 py-1 rounded-full border transition-all duration-300 
                  bg-red-900/40 text-red-400 border-red-500/40 
                  shadow-[0_0_10px_1px_rgba(239,68,68,0.3)] 
                  hover:shadow-[0_0_25px_5px_rgba(239,68,68,0.7)]`}
              >
                Locked
              </div>
            );
          } else if (Number(raw) === 0) {
            val = (
              <div
                className={`text-xs font-Kanit px-4 py-1 rounded-full border transition-all duration-300 
                  bg-emerald-900/40 text-emerald-400 border-emerald-500/40 
                  shadow-[0_0_10px_1px_rgba(34,197,94,0.3)] 
                  hover:shadow-[0_0_25px_5px_rgba(34,197,94,0.7)]`}
              >
                Unlocked
              </div>
            );
          }
        }
                return (
                <div
          key={t.key}
          className={`rounded-lg   bg-[#0d0d0d] p-3 shadow-sm flex flex-col items-center text-center
            ${t.key === "lat_long" ? "sm:col-span-2 md:col-span-3" : ""}`}
        >
          <p className="text-[11px] tracking-wide text-white/80 mb-1">{t.label}</p>
          <div className="flex flex-col items-center text-xs font-Kanit">
            {icon && <span className="text-base">{icon}</span>}
            <span
              className={`text-xs md:text-sm break-words whitespace-normal text-center max-w-[220px] ${color}`}
            >
              {val}
            </span>
          </div>
        </div>
                );
              })}
            </div>
        </Svg>
    </div>

    {/* Bottom Row inside same card */}
   {/* 🔹 Dashboard Section for NTC, MOS, and AH */}
<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

{/* 🔹 AH Values */}
<Svg title="AH Values" minH="min-h-[220px]" className="h-full">
  <div className="p-4 flex flex-col h-full">
    <SectionTitle left="Ah values" />

    <div className="flex-1 grid grid-cols-1 gap-1 text-sm text-gray-200">
      {(() => {
        if (!livedata || livedata.length === 0) {
          return (
            <div className="text-gray-400 text-sm p-3 text-center">
              No data available
            </div>
          );
        }
        const latest = livedata[livedata.length - 1];

        // Max values (adjust to actual capacity)
        const maxTotal = 100;
        const maxCharger = 100;
        const maxRegen = 100;
        const maxDischarge = 100;

        const bars = [
          {
            label: "In ah",
            value: latest.inah,
            max: maxTotal,
            barColor: "from-green-600 to-green-400",
            glow: "shadow-[0_0_10px_oklab(82.013% -0.19207 0.16626 / 0.92)",
            textColor: "text-green-400",
          },
          {
            label: "In ah by charger",
            value: latest.inah_by_charger,
            max: maxCharger,
            barColor: "from-yellow-500 to-yellow-300",
            glow: "shadow-[0_0_10px_rgba(234,179,8,0.7)]",
            textColor: "text-yellow-300",
          },
          {
            label: "In ah by regen",
            value: latest.inah_by_regen,
            max: maxRegen,
            barColor: "from-blue-500 to-blue-400",
            glow: "shadow-[0_0_10px_rgba(17, 95, 240, 0.7)]",
            textColor: "text-blue-400",
          },
         {
        label: "Out ah",
        value: latest.outah,
        max: maxDischarge,
        barColor: "from-red-600 to-red-500", // 🔵 gradient
        glow: "shadow-[0_0_10px_rgba(239,68,68,0.7)]", // blue glow
        textColor: "text-red-500", // text also blue
      },

        ];

        return bars.map((item, idx) => (
<div
  key={idx}
  className="group transition-all duration-300"
  style={{ fontFamily: "'Montserrat', sans-serif" }}
>
  {/* Label */}
  <div className="text-[11px] text-gray-400 mb-0">{item.label}</div>

  {/* Bar + Value */}
  <div className="flex items-center">
    <div className="flex-1 h-4 bg-[#0d0d0d] overflow-hidden relative rounded">
      <div
        className={`h-4 bg-gradient-to-r ${item.barColor} ${item.glow} transition-all duration-500`}
        style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
      ></div>
    </div>
    <span
      className={`ml-3 text-sm font-semibold ${item.textColor} group-hover:scale-110 transition-transform`}
    >
      {Number(item.value).toFixed(2)}
    </span>
  </div>
</div>


));

      })()}
    </div>
  </div>
</Svg>




  {/* 🔹 NTC Temperatures */}
   <Svg title="NTC Temperatures" minH="min-h-[220px]" className="h-full">
          <div className="p-3 flex flex-col h-full">
            <SectionTitle left="NTC temperatures" />
            <div className="flex-1 flex flex-col justify-center">
              {(() => {
                const raw = ntcData?.ntc ?? "";
                const arr = raw.split(",").map((v) => Number(v.trim()));

                if (arr.length < 8) {
                  return (
                    <p className="mt-4 text-base text-center text-white/70">N/A</p>
                  );
                }

                // Split NTCs
                const main = arr.slice(0, 4); // First 4 values
                const apu = arr.slice(-4);    // Last 4 values
                const apuAbsent = apu.every((v) => v === -40);

                // Custom labels for main battery NTCs
                const mainLabels = [
                  "Positive terminal temp",
                  "Cell no 20 temp",
                  "Cell no 50 temp",
                  "Negative terminal temp",
                ];

                // Renderer for NTC blocks
                const renderNTCs = (list, label, customLabels = []) => (
                  <div className="grid grid-cols-2 gap-2">
                    {list.map((val, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[#0d0d0d] border border-white/10 p-2 flex flex-col items-center shadow"
                      >
                        <span className="text-[11px] text-white/60">
                          {customLabels[i] || `${label} ${i + 1}`}
                        </span>
                        <span className="text-sm font-Kanit text-white">
                          {val}°C
                        </span>
                      </div>
                    ))}
                  </div>
                );

                return (
                  <div className="grid grid-cols-1 gap-3">
                    {/* Main Battery */}
                    <div className="rounded-lg bg-[#0d0d0d] border border-white/10 p-2 shadow-md">
                      <p className="text-xs text-cyan-400 font-Kanit mb-2 text-center">
                        Main battery
                      </p>
                      {renderNTCs(main, "NTC", mainLabels)}
                    </div>

                    {/* APU */}
                    <div className="rounded-lg bg-[#0d0d0d] border border-white/10 p-2 shadow-md">
                      <p className="text-xs  text-purple-400 font-Kanit mb-2 text-center">
                        APU
                      </p>
                      {apuAbsent ? (
                        <p className="text-sm text-red-400 font-medium text-center">
                          APU absent
                        </p>
                      ) : (
                        renderNTCs(apu, "NTC")
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </Svg>

  {/* 🔹 BMS MOSFET States */}
  <Svg title="BMS MOS States" minH="min-h-[220px]" className="h-full">
  <div className="p-3 flex flex-col h-full">
    <SectionTitle left="Bms Mosfet state" />
    <div className="flex-1 grid grid-cols-2 gap-2 place-items-center">
      {(() => {
        const flags = (details?.bmsmosstates ?? "")
          .split(",")
          .map((v) => parseInt(v.trim(), 10));

        const states = [
          { label: "Main charging MOS", value: flags[0] },
          { label: "Main discharging MOS", value: flags[1] },
          { label: "APU charging MOS", value: flags[2] },
          { label: "APU discharging MOS", value: flags[3] },
        ];

        return states.map((s, i) => (
          <div
            key={i}
            className="rounded-md bg-[#0d0d0d] border border-white/10 p-2 flex flex-col items-center shadow w-full"
          >
            <span className="text-[10px] text-white/60 text-center leading-tight mt-2">
              {s.label}
            </span>
            <span
              className={`mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all duration-300
                ${
                  s.value
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_3px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_5px_rgba(34,197,94,0.7)]"
                    : "bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_3px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_5px_rgba(239,68,68,0.7)]"
                }`}
            >
              {s.value ? "ON" : "OFF"}
            </span>
          </div>
        ));
      })()}
    </div>
  </div>
</Svg>


  
</div>
  </div>
</div>

     {/* 📊 Totals Summary (Calculated) */}
   

<div className=" mt-3 relative rounded-xl border border-[#FF9913]/40 bg-black p-6 
     shadow-[0_0_25px_rgba(255,153,19,0.6)]">
  {/* Glow overlay (only for the big card) */}
 <div className="absolute -inset-1 rounded-2xl 
                bg-[radial-gradient(circle_at_top_left,#22d3ee55,transparent_70%), 
                    radial-gradient(circle_at_top_right,#22d3ee55,transparent_70%), 
                    radial-gradient(circle_at_bottom_left,#22d3ee55,transparent_70%), 
                    radial-gradient(circle_at_bottom_right,#22d3ee55,transparent_70%)] 
                blur-2xl opacity-80 pointer-events-none"></div>

  {/* Inner content (no glow on inner cards) */}
  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* Battery Voltage */}
    <div className={CARD_BASE_TRANSPARENT}>
      <SectionTitle left="Battery voltage" />
      <div className="flex items-center justify-center">
        <OnlyForSpeed
          label="VOLTAGE"
          value={latestGauges?.batvoltage || 0}
          max={100}
          unit="V"
          width={240}
        />
      </div>
    </div>


     {/* SOC */}
    <div className={CARD_BASE_TRANSPARENT}>
      <SectionTitle left="Main SOC" />
      <div className="flex items-center justify-center">
        <SpeedGauge
          value={Number(latestGauges?.soc) || 0}
          max={100}
          unit="%"
          width={240}
        />
      </div>
    </div>

    {/* APUSOC */}
    <div className={CARD_BASE_TRANSPARENT}>
      <SectionTitle left="APU SOC" />
      <div className="flex items-center justify-center">
        <OnlyForsoc
          value={Number(latestGauges?.apusoc) || 0}
          max={100}
          unit="%"
          width={240}
        />
      </div>
    </div>

    {/* Speed */}
    <div className={CARD_BASE_TRANSPARENT}>
      <SectionTitle left="Speed" />
      <div className="flex items-center justify-center">
        <ThreeQuarterGauge
          value={Number(latestGauges?.speed_kmph) || 0}
          max={150}
          unit="km/h"
          width={240}
        />
      </div>
    </div>

    {/* Tire Pressure */}
    <div className={CARD_BASE_FLAT}>
      <SectionTitle left="Tire pressure" />
      <div className="flex items-center justify-center">
        <ThreeQuarterGauge
          value={Number(latestGauges?.tirepressure) || 0}
          min={0}
          max={100}
          unit="psi"
          width={220}
        />
      </div>
    </div>


    <div  className={CARD_BASE_TRANSPARENT}>
      <div className="mb-2 text-center">
       <SectionTitle left="Temperatures" />
      </div>
      <div className="flex justify-between items-center gap-3 overflow-x-auto">
        <ThermometerCard
          label="Ctrl MOS temp"
          value={Number(latestGauges?.controllermostemp) || 0}
          min={0}
          max={120}
          gradient={["#32ed0dff", "#e71414ff"]}
          height={160}   // ⬅️ smaller thermometer
        />
        <ThermometerCard
          label="Motor temp"
          value={Number(latestGauges?.motortemp) || 0}
          min={0}
          max={120}
          gradient={["#32ed0dff", "#e71414ff"]}
          height={160}
        />
        <ThermometerCard
          label="BMS MOS temp"
          value={Number(latestGauges?.bmsmostemp) || 0}
          min={0}
          max={120}
          gradient={["#32ed0dff", "#e71414ff"]}
          height={160}
        />
      </div>
      
  </div>

  </div>
</div>



{/* vehical live chart  */}

 <div
  className="relative mt-3 h-[500px] rounded-3xl bg-black
             border border-[#FF9913]/30 shadow-[0_0_25px_rgba(255,153,19,0.3)]
             backdrop-blur-xl overflow-hidden"
>
  {/* Glow background */}
  <div
    className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#FF991322,transparent_60%),
                                  radial-gradient(circle_at_bottom_right,#FF991322,transparent_60%)] animate-pulse"
  ></div>

  {/* --- 📱 Mobile: Dropdown --- */}
  <div className="md:hidden p-3 relative z-10">
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
                                rounded-xl p-2 space-y-2 shadow-lg max-h-60 overflow-y-auto">
        {metricOptions.map((opt) => (
          <label
            key={opt.key}
            className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-[#FF9913] transition"
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
    )}
  </div>

  <div className="grid md:grid-cols-[1fr_220px] h-full relative z-10">
    {/* --- Chart --- */}
    <div className="p-4">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#33415540" vertical={false} />
          
          <XAxis
            dataKey="time"
            tick={{
              fill: "#ffffff",
              fontSize: window.innerWidth < 768 ? 9 : 11,
              fontWeight: 500,
            }}
            tickLine={false}
            axisLine={{ stroke: "#FF9913" }}
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
            axisLine={{ stroke: "#FF9913" }}
            domain={["auto", "auto"]}
          />
          
          <ReferenceLine y={0} stroke="#FF9913" strokeDasharray="6 3" strokeWidth={1.2} />

         <Tooltip
  itemStyle={{ fontWeight: 500 }}
  contentStyle={{
    backgroundColor: "#000000",
    border: "1px solid #FF9913",
    borderRadius: "0.75rem",
    padding: "6px 10px",
    fontSize: window.innerWidth < 768 ? "10px" : "11px",
    boxShadow: "0 0 15px #FF991355",
  }}
  formatter={(value, name, props) => {
    const color = props.color || "#f1f5f9";
    return [
      <span style={{ color, fontWeight: 600 }}>{value}</span>,
      name,
    ];
  }}
labelFormatter={(label, payload) => {
  if (payload && payload.length > 0) {
    const { tripkm } = payload[0].payload;

    const date = new Date(label);
    const formatted =
      `${date.getFullYear()}:` +
      `${String(date.getMonth() + 1).padStart(2, "0")}:` +
      `${String(date.getDate()).padStart(2, "0")} ` +
      `${String(date.getHours()).padStart(2, "0")}:` +
      `${String(date.getMinutes()).padStart(2, "0")}:` +
      `${String(date.getSeconds()).padStart(2, "0")}`;

    return (
      <div>
        <div>{formatted}</div>
        <div style={{ color: "#FFD700", fontWeight: "bold" }}>
          Trip (km): {tripkm ?? "N/A"}
        </div>
       
      </div>
    );
  }
  return label;
}}



/>


 {/* <div style={{ color: "#00CED1", fontWeight: "bold" }}> */}
          {/* Location: {locationMap[lat_long] || "Loading..."} */}
        {/* </div>  */}

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
            .map((opt) => {
              if (opt.key === "currentconsumption") {
                return (
                  <React.Fragment key="currentconsumption">
                    <Line type="monotone" dataKey="currentPositive" name="Current + (A)"
                      stroke="#13ff23ff" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
                    <Line type="monotone" dataKey="currentNegative" name="Current - (A)"
                      stroke="#ff0000ff" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
                  </React.Fragment>
                );
              }
              return (
                <Line key={opt.key} type="monotone" dataKey={opt.key} name={opt.label}
                  stroke={opt.color} strokeWidth={1.8} dot={false} isAnimationActive={false} />
              );
            })}
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* --- 💻 Desktop: Side Metrics Card --- */}
    <div className="hidden md:flex border-l border-[#FF9913]/20 bg-black backdrop-blur-md p-4 flex-col h-[500px]">
  <h3 className="text-sm font-semibold text-white mb-4 tracking-wide border-b border-[#FF9913]/30 pb-1">
    Select parameters to be shown on graph.
  </h3>

    <div className="flex flex-col gap-2 overflow-y-auto pr-2">
        {metricOptions.map((opt) => (
          <label
            key={opt.key}
            className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-[#FF9913] transition"
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
  </div>
</div>




  <CustomAlert message={alertMessage} onClose={() => setAlertMessage("")} />


        <div className="mt-3">
        <Svg>
       <div className="mt-3">
      <h2 className="text-base font-Kanit tracking-wider text-[#FF9913] mb-3 border-b border-[#FF9913]/30 pb-1">
        Select data and time to view data: <span className="text-white">{vin}</span>
      </h2>

      <div className="flex flex-col gap-2 md:flex-row">
        {/* Start Date */}
        <div className="relative w-full">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white" />
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => handleStartChange(e.target.value)}
            className="w-full rounded-xl border border-[#FF9913]/30 bg-black pl-10 pr-3 py-2 text-sm text-white outline-none
                      hover:border-[#FF9913]/60 focus:border-[#FF9913]/90 focus:shadow-[0_0_12px_2px_rgba(255,153,19,0.4)] transition"
          />
        </div>

        {/* End Date */}
        <div className="relative w-full">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white" />
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => handleEndChange(e.target.value)}
            className="w-full rounded-xl border border-[#FF9913]/30 bg-black pl-10 pr-3 py-2 text-sm text-white outline-none
                      hover:border-[#FF9913]/60 focus:border-[#FF9913]/90 focus:shadow-[0_0_12px_2px_rgba(255,153,19,0.4)] transition"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={fetchHistoricalData}
          disabled={loading}
          className="rounded-xl border border-[#F5880D]/50 bg-[#F57A0D] px-5 py-2 text-sm text-black 
              hover:bg-[#FF7A00] hover:shadow-[0_0_15px_2px_rgba(255,153,19,0.5)] 
              transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Load history"}
        </button>

        {!autoMode && (
          <button
            onClick={resetToAuto}
            className="rounded-xl border border-[#F5880D]/50 bg-[#F57A0D] px-5 py-2 text-sm text-black 
                hover:bg-[#FF7A00] hover:shadow-[0_0_15px_2px_rgba(255,153,19,0.5)] 
                transition-all duration-300 ease-in-out"
          >
            Set default time
          </button>
        )}
      </div>
    </div>
        </Svg>
          {/* Chart Section */}
        {/* Chart Section */}
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
            itemStyle={{ fontWeight: 500, }}
            contentStyle={{
              backgroundColor: "#000000",
              border: "1px solid #FF9913",
              borderRadius: "0.75rem",
              padding: "6px 10px",
              fontSize: window.innerWidth < 768 ? "10px" : "11px",
              boxShadow: "0 0 15px #FF991355",
            }}
            formatter={(value, name, props) => {
              const color =  props.color || "#f1f5f9";
              return [
                <span style={{ color, fontWeight: 600 }}>{value}</span>,
                name,
              ];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                const tripkm = payload[0].payload.tripkm;

                // Format time as YYYY:MM:DD HH:MM:SS
                const date = new Date(label);
                const formatted =
                  `${date.getFullYear()}:` +
                  `${String(date.getMonth() + 1).padStart(2, "0")}:` +
                  `${String(date.getDate()).padStart(2, "0")} ` +
                  `${String(date.getHours()).padStart(2, "0")}:` +
                  `${String(date.getMinutes()).padStart(2, "0")}:` +
                  `${String(date.getSeconds()).padStart(2, "0")}`;

                return (
                  <div>
                    <div>{formatted}</div>
                    <div style={{ color: "#FFD700", fontWeight: "bold" }}>
                      Trip(km): {tripkm}
                    </div>
                  </div>
                );
              }
              return label;
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
               <div className="hidden md:flex border-l border-[#FF9913]/20 bg-black backdrop-blur-md p-4 flex-col h-[500px]">
  <h3 className="text-sm font-semibold text-white mb-4 tracking-wide border-b border-[#FF9913]/30 pb-1">
    Select parameters to be shown on graph.
  </h3>

    <div className="flex flex-col gap-2 overflow-y-auto pr-2">
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

        
      </main>
      <footer className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-white/50">
        VIN: {(latest?.vinnumber || latest?.vinNumber || vin) || "N/A"} •{" "}
        {mode === "realtime" ? "Live" : "History"}
      </footer>
    </div>
  );
}