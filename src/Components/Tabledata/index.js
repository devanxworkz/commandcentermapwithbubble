import React, { useEffect, useState, useRef } from "react";

export default function Tabledata({ vin }) {
  const [loading, setLoading] = useState(true);
  const [allvin, setAllvin] = useState(null);
  const [realtimeData, setRealtimeData] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [columns, setColumns] = useState([]); // all column names
  const [selectedColumns, setSelectedColumns] = useState([]); // selected columns
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const limit = 500;

  const fetchData = async (currentPage = 0, s = start, e = end) => {
    if (!vin) return;
    setLoading(true);
    setError(null);

    try {
      const offset = currentPage * limit;
      let url = `https://commandcenter.rivotmotors.com/tabledata.php?vin=${vin}&limit=${limit}&offset=${offset}`;
      if (s && e) {
        url += `&start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "success") {
        setAllvin(data.allvin);
        setRealtimeData(data.realtimedata);

        if (data.realtimedata.length > 0) {
          const cols = Object.keys(data.realtimedata[0]);
          setColumns(cols);
          if (selectedColumns.length === 0) setSelectedColumns(cols); // default show all
        }
      } else {
        setError(data.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const handleClickOutside = (event) => {
    // If the dropdown is open AND the click target is outside the dropdown and button
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


 useEffect(() => {
  if (!vin) return;
  setPage((prev) => (prev === 0 ? 0 : prev)); // keep same page
  fetchData(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // only run once, not every time vin changes


  const handleNext = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const handlePrev = () => {
    if (page === 0) return;
    const prevPage = page - 1;
    setPage(prevPage);
    fetchData(prevPage);
  };

  const handleFilter = () => {
    setPage(0);
    fetchData(0, start, end);
  };

  const handleColumnSelect = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!vin) return <p className="text-orange-400">Please enter a VIN number.</p>;
  if (loading) return <p className="text-orange-400">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (

<div className="px-5 py-4 w-full max-w-[95vw] mx-auto text-white  min-h-screen overflow-x-hidden">
      {/* ==== Vehicle Info Card ==== */}
      {allvin && (
        <div className="p-6 border border-[#FF9913]/40 bg-[#141414] rounded-2xl shadow-[0_0_20px_rgba(255,153,19,0.15)] transition-all hover:shadow-[0_0_25px_rgba(255,153,19,0.25)]">
          <h2 className="text-2xl font-Kanit mb-4 text-[#FF9913] tracking-wide">
            Allvin table
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(allvin).map(([key, value]) => (
              <p
                key={key}
                className="flex justify-between bg-[#1C1C1C] px-3 py-2 rounded-md border border-[#FF9913]/20"
              >
                <span className="text-[#FF9913]  capitalize">
                  {key}
                </span>
                <span className="text-gray-300 truncate">
                  {Array.isArray(value) ? value.join(", ") : value}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

{/* ==== Filter & Controls Section (Redesigned Layout) ==== */}
<div className="flex flex-col gap-3 mt-4 mb-4 p-2">

  {/* === Date + Time + Filter (same line) === */}
  <div className="flex flex-wrap items-end gap-4">
    {/* Start Time */}
    <div>
      <label className="block text-[#FF9913] text-sm mb-1 font-Kanit">
        Start Time
      </label>
      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="bg-[#1C1C1C] text-white border border-[#FF9913]/40 rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-[#FF9913]/70"
      />
    </div>

    {/* End Time */}
    <div>
      <label className="block text-[#FF9913] text-sm mb-1 font-Kanit">
        End Time
      </label>
      <input
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="bg-[#1C1C1C] text-white border border-[#FF9913]/40 rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-[#FF9913]/70"
      />
    </div>

    {/* Filter Button Beside Date Inputs */}
    <button
      type="button"
      onClick={handleFilter}
      className="bg-gradient-to-r from-[#FF9913] to-[#FFB347] text-black font-Kanit px-6 py-2.5 rounded-lg hover:scale-105 transition-transform shadow-md mt-[22px]"
    >
      Filter
    </button>
  </div>

  {/* === Second Row: Select Columns + Pagination === */}
  <div className="flex flex-wrap items-center justify-between gap-4">
    {/* Left: Select Columns Button */}
  <div className="relative" ref={dropdownRef}>
  <button
    type="button"
    onClick={() => setShowDropdown((prev) => !prev)}
    className="flex items-center gap-2 bg-[#1C1C1C] text-[#FF9913] font-Kanit px-2 py-2 rounded-lg border border-[#FF9913]/40 hover:bg-[#2A2A2A] transition-all"
  >
    <span>Select Columns</span>

    {/* Dropdown Arrow Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-4 h-4 transition-transform duration-300 ${
        showDropdown ? "rotate-180" : "rotate-0"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {/* Dropdown Menu */}
  {showDropdown && (
    <div className="absolute mt-2 bg-[#141414] border border-[#FF9913]/50 rounded-xl shadow-[0_0_20px_rgba(255,153,19,0.2)] max-h-64 overflow-y-auto w-72 p-4 z-50">
      {columns.map((col) => (
        <label
          key={col}
          className="flex items-center gap-2 text-sm text-[#FFB347] py-1 hover:bg-[#1F1F1F] rounded px-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedColumns.includes(col)}
            onChange={() => handleColumnSelect(col)}
            className="accent-[#FF9913] scale-110"
          />
          {col}
        </label>
      ))}
    </div>
  )}
</div>


    {/* Right: Pagination Buttons beside Select Columns */}
 <div className="flex justify-end items-center gap-3">
  {/* === Previous Button === */}
  <button
    type="button"
    onClick={handlePrev}
    disabled={page === 0}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-Kanit transition-all ${
      page === 0
        ? "bg-gray-700 cursor-not-allowed text-gray-400"
        : "bg-[#1C1C1C] border border-[#FF9913]/40 hover:bg-[#2A2A2A] text-[#FF9913]"
    }`}
  >
    {/* Left Arrow Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    <span>Previous</span>
  </button>

  {/* === Next Button === */}
  <button
    type="button"
    onClick={handleNext}
    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-Kanit bg-gradient-to-r from-[#FF9913] to-[#FFB347] text-black hover:scale-105 transition-transform shadow-md"
  >
    <span>Next</span>
    {/* Right Arrow Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>
  </div>
</div>



    {/* ==== Comfortable Modern Table ==== */}
  <div className="border border-[#FF9913]/20 rounded-2xl shadow-[0_0_20px_rgba(255,153,19,0.1)] bg-[#0E0E0E] max-h-[500px] overflow-y-auto">
  <table className="min-w-full border-collapse text-sm">
    <thead className="bg-[#1A1A1A] sticky top-0">
      <tr>
        {selectedColumns.map((col) => (
          <th
            key={col}
            className="px-5 py-3 text-left text-[#FF9913] font-Kanit text-xs  tracking-wide border-b border-[#FF9913]/20"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {realtimeData.length === 0 ? (
        <tr>
          <td
            colSpan={selectedColumns.length}
            className="text-center py-10 text-gray-500"
          >
            No Data Available
          </td>
        </tr>
      ) : (
        realtimeData.map((row, index) => (
          <tr
            key={index}
            className={`transition-all duration-200 ${
              index % 2 === 0 ? "bg-[#121212]" : "bg-[#171717]"
            } hover:bg-[#202020]/80`}
          >
            {selectedColumns.map((key) => (
              <td
                key={key}
                className="px-5 py-3 text-gray-200 text-sm border-b border-[#FF9913]/10 whitespace-nowrap"
              >
                {Array.isArray(row[key])
                  ? row[key].join(", ")
                  : row[key] ?? "-"}
              </td>
            ))}
          </tr>
        ))
      )}
    </tbody>
    </table>
    </div>
    </div>
  );
}
