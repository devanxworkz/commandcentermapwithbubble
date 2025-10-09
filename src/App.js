import './App.css';
import RealTimeChart from './Components/RealTimeChart';
import Login from './Components/Login';

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(
    () => localStorage.getItem("isLoggedIn") === "true"  // load from storage
  );

  // save login state whenever it changes
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Login setIsLoggedIn={setIsLoggedIn} />} 
        />
       
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <RealTimeChart /> : <Navigate to="/" />} 
        />
      </Routes>
       
    </Router>
  );
}

export default App;
