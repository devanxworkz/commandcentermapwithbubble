import { Home, BarChart2, CreditCard, User } from "lucide-react";
import React, { useState } from "react";



export default function Sidebar({ isOpen, toggleSidebar }) {
  
  const [activePage, setActivePage] = React.useState("home"); 

  return (

    
    <>

    
      {/* 🔹 Mobile Top Bar (only hamburger left side) */}
      <div className="md:hidden flex items-center bg-[] text-white px-4 py-3 fixed top-0 left-0 w-full z-50">
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition"
          onClick={toggleSidebar}
        >
          {/* Hamburger / Close Icon */}
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="currentColor"
              className="bi bi-x-lg"
              viewBox="0 0 16 16"
            >
              <path d="M2.146 2.854a.5.5 0 0 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="currentColor"
              className="bi bi-list"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 
                   0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 
                   0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 
                   0 0 1-.5-.5m0-4a.5.5 
                   0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 
                   0 0 1-.5-.5"
              />
            </svg>
          )}
        </button>
      </div>
      {/* 🔹 Sidebar */}
      <div className="w-48 bg-gray-900 text-white min-h-screen p-4">
  <h2 className="text-lg font-bold mb-6">Menu</h2>
  <ul className="space-y-3">
    <li>
      <button
        onClick={() => setActivePage("home")}
        className={`block w-full text-left px-3 py-2 rounded ${activePage === "home" ? "bg-gray-700" : ""}`}
      >
        Home
      </button>
    </li>
    <li>
      <button
        onClick={() => setActivePage("graph")}
        className={`block w-full text-left px-3 py-2 rounded ${activePage === "graph" ? "bg-gray-700" : ""}`}
      >
        Graph
      </button>
    </li>
    <li>
      <button
        onClick={() => setActivePage("table")}
        className={`block w-full text-left px-3 py-2 rounded ${activePage === "table" ? "bg-gray-700" : ""}`}
      >
        Table
      </button>
    </li>
  </ul>
</div>

    </>
  );
}
