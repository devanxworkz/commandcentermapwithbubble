import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateTimeRangePicker({ onApply }) {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  return (
    <div className="flex gap-4 p-4 bg-[#0d0d0d]/60 border-b border-white/10">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Start Time</label>
        <DatePicker
          selected={startTime}
          onChange={(date) => setStartTime(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          placeholderText="Select start time"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">End Time</label>
        <DatePicker
          selected={endTime}
          onChange={(date) => setEndTime(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          placeholderText="Select end time"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
      </div>
      <button
        onClick={() => onApply({ start: startTime, end: endTime })}
        className="self-end px-4 py-2 rounded-lg bg-gradient-to-tr from-orange-500 to-yellow-400 text-black font-Kanit text-sm"
      >
        Apply
      </button>
    </div>
  );
}
