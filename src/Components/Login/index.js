import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./indexLogin.css";

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Hard-coded credentials
  const correctUsername = "admin";
  const correctPassword = "rivotmotors";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields!");
      return;
    }

    if (username === correctUsername && password === correctPassword) {
      // Set isLoggedIn to true
      setIsLoggedIn(true);
      // Navigate to dashboard
      navigate("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <img
          src="https://image2url.com/images/1755511837883-d480dc7d-7419-4341-acc6-decf0d6810b5.png"
          alt="Logo"
          className="logo"
        />
        <h2 className="hedif">RIVOT MOTORS COMMAND CENTER</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
