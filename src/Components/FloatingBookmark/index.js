import React, { useState } from "react";
import { Bookmark, X } from "lucide-react";

const FloatingBookmark = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="fixed right-4 bottom-4 z-[9999] flex flex-col items-end"
    >
      {/* Bookmark Button (always visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 flex items-center justify-center 
          rounded-full bg-[#0d0d0d]/80 
          border border-[#FF9913]/40 
          shadow-[0_0_15px_rgba(255,153,19,0.4)] 
          backdrop-blur-md 
          text-[#FF9913] hover:text-white 
          transition-all duration-300 ease-in-out
          hover:shadow-[0_0_25px_rgba(255,153,19,0.7)]"
      >
        {isOpen ? <X size={22} /> : <Bookmark size={22} />}
      </button>

      {/* Dropdown panel (opens downward) */}
      <div
        className={`mt-2 bg-[#0d0d0d]/90 border border-[#FF9913]/40 
        shadow-[0_0_15px_rgba(255,153,19,0.4)] 
        backdrop-blur-md rounded-2xl 
        overflow-hidden transition-all duration-500 ease-in-out origin-top
        ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"} 
        w-60`}
      >
        <div className="p-4 text-center text-sm text-white">
          <p className="font-Kanit tracking-wide text-[#FF9913] font-semibold mb-2">
            Quick Actions
          </p>
          <div className="flex flex-col gap-2">
            <button className="w-full py-1.5 rounded-md bg-[#FF9913]/20 hover:bg-[#FF9913]/40 text-[#FF9913] transition text-xs">
              View Details
            </button>
            <button className="w-full py-1.5 rounded-md bg-[#FF9913]/20 hover:bg-[#FF9913]/40 text-[#FF9913] transition text-xs">
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingBookmark;
