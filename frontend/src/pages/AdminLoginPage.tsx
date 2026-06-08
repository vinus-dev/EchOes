import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminScene from "../components/three/AdminScene";
import { useAuth } from "../hooks/useAuth";
import "./AdminLoginPage.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin, isAdminLoggedIn, isLoggingIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate("/echoes-admin/dashboard");
    }
  }, [isAdminLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const success = await loginAdmin(username.trim(), password);
    if (success) {
      navigate("/echoes-admin/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="full-page admin-login-page">
      <div className="canvas-container">
        <AdminScene />
      </div>

      <div className="page-content admin-login-content">
        <div className="admin-login-card glass-strong glow-purple">
          <h2 className="admin-login-title">Admin Console</h2>
          <p className="admin-login-subtitle">Sign in to manage memories</p>
          
          {error && <div className="login-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-field">
              <label htmlFor="login-username">Username</label>
              <input
                type="text"
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className="form-field">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className="admin-login-actions">
              <button
                type="button"
                className="btn-back-home"
                onClick={() => navigate("/search")}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn-login"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
