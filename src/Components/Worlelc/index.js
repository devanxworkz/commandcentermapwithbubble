import React, { useState, useEffect,useRef } from "react";
import Wapelement from "../Wapelement";
import { Calendar } from "lucide-react";
import LiveTracker from "../LiveTracker";
import { motion, AnimatePresence } from "framer-motion";

export default function Worlelc({ vin }) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fetchParams, setFetchParams] = useState(null);
  const [activeTab, setActiveTab] = useState("history");
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(["Speed", "Battery"]);

  const dropdownRef = useRef(null);


  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const formatDateTimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const setDefaultTimes = () => {
    const now = new Date();
    const past24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    setStartTime(formatDateTimeLocal(past24));
    setEndTime(formatDateTimeLocal(now));
    setAutoMode(true);
    setErrorMsg("");
  };

  useEffect(() => {
    setDefaultTimes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (autoMode) setDefaultTimes();
    }, 60000);
    return () => clearInterval(timer);
  }, [autoMode]);

  useEffect(() => {
    setFetchParams(null);
  }, [vin]);

  const handleLoadHistory = () => {
    if (!startTime || !endTime)
      return setErrorMsg("Please select both start and end times.");

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) return setErrorMsg("Start time must be earlier than end time.");

    setErrorMsg("");
    setFetchParams({ start: startTime, end: endTime });
    setActiveTab("history");
  };

  return (
    <div className="mt-2 w-full h-screen flex flex-col">
      <h2 className="text-base font-Kanit tracking-wider text-[#FF9913]  border-b border-[#FF9913]/30 pb-1">
        Select date and time
      </h2>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Time Pickers */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="relative w-full md:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setAutoMode(false); }}
              className="w-full rounded-xl border border-[#FF9913]/30 bg-black pl-10 pr-3 py-2 text-sm text-white outline-none hover:border-[#FF9913]/60 focus:border-[#FF9913]/90"
            />
          </div>

          <div className="relative w-full md:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setAutoMode(false); }}
              className="w-full rounded-xl border border-[#FF9913]/30 bg-black pl-10 pr-3 py-2 text-sm text-white outline-none hover:border-[#FF9913]/60 focus:border-[#FF9913]/90"
            />
          </div>

          {activeTab === "history" && (
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                onClick={handleLoadHistory}
                disabled={loading}
                className="rounded-xl px-6 py-2.5 text-sm font-Kanit text-black bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
              >
                {loading ? "Loading..." : "Load History"}
              </button>
              {!autoMode && (
                <button
                  onClick={setDefaultTimes}
                  className="rounded-xl px-6 py-2.5 text-sm font-Kanit text-black bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
                >
                  Set Default
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs + Dropdown */}
        <div className="flex flex-col items-end gap-2 relative mt-2">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("live"); setShowDropdown(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-Kanit ${activeTab === "live" ? "bg-green-500 text-black" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
            >
              Live
            </button>
            <button
              onClick={() => { setActiveTab("history"); setShowDropdown(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-Kanit ${activeTab === "history" ? "bg-orange-500 text-black" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
            >
              History
            </button>
          </div>

          {/* Parameter Selector */}
     <div className="mt-1 mb-2 relative" ref={dropdownRef}>
  <button
    onClick={() => setShowDropdown(!showDropdown)}
    className={`flex items-center gap-2 px-2 py-1 text-xs sm:text-sm md:text-base rounded-md border border-[#FF9913]/40
      transition-all duration-300
      ${showDropdown ? "bg-[#FF9913]/20 text-[#FF9913]" : "bg-white/10 text-gray-300 hover:bg-white/20"}
      w-full sm:w-auto justify-between
    `}
  >
    <span>Select Parameters</span>
    <svg
      className={`w-3 h-3 sm:w-3 sm:h-3 transition-transform duration-300 ${showDropdown ? "rotate-180" : "rotate-0"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 20 20"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <AnimatePresence>
    {showDropdown && (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="absolute z-[1000] mt-2 right-0 w-52 max-w-xs sm:max-w-sm md:max-w-md 
          bg-[#111]/90 border border-[#FF9913]/30 rounded-lg shadow-lg p-3 text-sm 
          backdrop-blur-md overflow-auto max-h-80"
      >
        {[
          "Current consumption (A)",
          "Current generation (A)",
          "Speed (km/h)",
          "Battery voltage (V)",
          "SOC (%)",
          "Trip (km)",
          "Motor temp (°C)",
          "Controller mosfet temp (°C)",
          "Inah (Ah)",
          "Outah (Ah)",
          "Positive terminal temp (°C)",
          "Cell No. 20 temp (°C)",
          "Cell No. 28 temp (°C)",
          "Negative terminal temp (°C)",
          "Main charge mosfet",
          "Main discharge mosfet",
          "APU charge mosfet",
          "APU discharge mosfet",
          "Lat-long",
        ].map((item) => (
          <motion.label
            key={item}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 mb-2 text-gray-200 hover:text-[#FF9913] cursor-pointer transition"
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(item)}
              onChange={() => handleCheckboxChange(item)}
              className="accent-[#FF9913] cursor-pointer"
            />
            {item}
          </motion.label>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
    </div>
      </div>
      </div>

      {errorMsg && <div className="text-red-400 text-sm mt-2 font-medium">{errorMsg}</div>}
      <div className="relative w-full" style={{ height: "calc(100vh - 92px)", overflow: "hidden" }}>
        {vin ? (
          activeTab === "live" ? (
            <LiveTracker vin={vin} />
          ) : fetchParams ? (
            <Wapelement
              vin={vin}
              start={fetchParams.start}
              end={fetchParams.end}
              applyFilter={fetchParams}
              selectedOptions={selectedOptions}
            />
          ) : (
            <div className="text-[#FF9913]">
              Select start & end time and click <b>Load History</b> to view map.
            </div>
          )
        ) : (
          <div className="text-white">Please select VIN in the header to load map...</div>
        )}
      </div>
    </div>
  );
}
