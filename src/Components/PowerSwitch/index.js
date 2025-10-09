import { useState } from "react";

export default function PowerSwitch() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-white/70 text-sm">Scooter ON/OFF State</span>

      <button
        onClick={() => setIsOn(!isOn)}
        className={`relative w-20 h-10 flex items-center rounded-full border shadow transition-all duration-300 
          ${isOn ? "bg-emerald-600/80 border-emerald-400" : "bg-red-600/80 border-red-400"}`}
      >
        {/* Circle knob */}
        <div
          className={`absolute w-8 h-8 rounded-full bg-white shadow-md transform transition-all duration-300
            ${isOn ? "translate-x-10" : "translate-x-1"}`}
        ></div>

        {/* Label */}
        <span
          className={`w-full text-center text-sm font-semibold transition-all duration-300 ${
            isOn ? "text-emerald-200" : "text-red-200"
          }`}
        >
          {isOn ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}
