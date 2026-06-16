import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminScene from "../components/three/AdminScene";
import { useAuth } from "../hooks/useAuth";
import { recoveryApi } from "../services/api";
import toast from "react-hot-toast";
import "./AdminLoginPage.css";

type AdminView = "login" | "forgot-answer" | "forgot-reset" | "forgot-success";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin, isAdminLoggedIn, isLoggingIn } = useAuth();

  // ── Login state ────────────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // ── View ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState<AdminView>("login");

  // ── Forgot credentials state ──────────────────────────────────────────────
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [credResetToken, setCredResetToken] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPw, setConfirmAdminPw] = useState("");
  const [recoveredUsername, setRecoveredUsername] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) navigate("/echoes-admin/dashboard");
  }, [isAdminLoggedIn, navigate]);

  // ── Login submit ────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!username.trim() || !password.trim()) {
      setLoginError("Please fill in all fields.");
      return;
    }
    const success = await loginAdmin(username.trim(), password);
    if (success) {
      navigate("/echoes-admin/dashboard");
    } else {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  // ── Forgot: Step 1 — verify security answer ─────────────────────────────────
  const handleVerifyAnswer = async () => {
    setForgotError("");
    if (!securityAnswer.trim()) {
      setForgotError("Please enter the security answer.");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await recoveryApi.verifySecurityForAdmin(securityAnswer.trim());
      if (res.success && res.data?.credResetToken) {
        setCredResetToken(res.data.credResetToken);
        setView("forgot-reset");
        setSecurityAnswer("");
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || "Incorrect security answer.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // ── Forgot: Step 2 — reset admin password ──────────────────────────────────
  const handleResetAdminCreds = async () => {
    setForgotError("");
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (newAdminPassword !== confirmAdminPw) {
      setForgotError("Passwords do not match.");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await recoveryApi.resetAdminCredentials(newAdminPassword, credResetToken);
      if (res.success) {
        setRecoveredUsername(res.data?.username || "");
        setView("forgot-success");
        toast.success("Admin password reset! 🔐");
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || "Failed to reset password. Please start over.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setView("login");
    setSecurityAnswer("");
    setCredResetToken("");
    setNewAdminPassword("");
    setConfirmAdminPw("");
    setForgotError("");
    setRecoveredUsername("");
  };

  return (
    <div className="full-page admin-login-page">
      <div className="canvas-container">
        <AdminScene />
      </div>

      <div className="page-content admin-login-content">
        <div className="admin-login-card glass-strong glow-purple">

          {/* ── Login Form ──────────────────────────────────────────────── */}
          {view === "login" && (
            <>
              <div className="admin-login-badge">⚙️ Admin</div>
              <h2 className="admin-login-title">Admin Console</h2>
              <p className="admin-login-subtitle">Sign in to manage memories</p>

              {loginError && <div className="login-error-banner">⚠ {loginError}</div>}

              <form onSubmit={handleLogin} className="admin-login-form">
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
                    autoComplete="username"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="admin-pw-wrapper">
                    <input
                      type={showLoginPw ? "text" : "password"}
                      id="login-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      disabled={isLoggingIn}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn-admin-toggle-pw"
                      onClick={() => setShowLoginPw((s) => !s)}
                      tabIndex={-1}
                    >
                      {showLoginPw ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="admin-login-actions">
                  <button
                    type="button"
                    className="btn-back-home"
                    onClick={() => navigate("/search")}
                  >
                    ← Back
                  </button>
                  <button type="submit" className="btn-login" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <span className="btn-admin-loading">
                        <span className="spinner-sm-admin" /> Logging in...
                      </span>
                    ) : (
                      "Login →"
                    )}
                  </button>
                </div>
              </form>

              <button
                className="btn-forgot-admin-creds"
                onClick={() => { setView("forgot-answer"); setLoginError(null); }}
              >
                Forgot credentials?
              </button>
            </>
          )}

          {/* ── Forgot: Step 1 — Security Answer ──────────────────────── */}
          {view === "forgot-answer" && (
            <>
              <div className="admin-login-badge">🔒 Recovery</div>
              <h2 className="admin-login-title">Recover Access</h2>
              <p className="admin-login-subtitle">
                Enter your security answer to reset the admin password.
              </p>

              <div className="form-field">
                <label>Security Answer</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Your security answer"
                  autoComplete="off"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyAnswer()}
                />
              </div>

              {forgotError && <div className="login-error-banner">⚠ {forgotError}</div>}

              <div className="admin-login-actions">
                <button className="btn-back-home" onClick={resetForgotFlow}>← Back</button>
                <button
                  className="btn-login"
                  onClick={handleVerifyAnswer}
                  disabled={isForgotLoading}
                >
                  {isForgotLoading ? "Verifying..." : "Verify →"}
                </button>
              </div>
            </>
          )}

          {/* ── Forgot: Step 2 — New Admin Password ───────────────────── */}
          {view === "forgot-reset" && (
            <>
              <div className="admin-login-badge">🔑 Reset</div>
              <h2 className="admin-login-title">New Password</h2>
              <p className="admin-login-subtitle">Set a new admin password.</p>

              <div className="form-field">
                <label>New Password</label>
                <div className="admin-pw-wrapper">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn-admin-toggle-pw"
                    onClick={() => setShowNewPw((s) => !s)}
                    tabIndex={-1}
                  >
                    {showNewPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmAdminPw}
                  onChange={(e) => setConfirmAdminPw(e.target.value)}
                  placeholder="Re-enter password"
                  onKeyDown={(e) => e.key === "Enter" && handleResetAdminCreds()}
                />
              </div>

              {forgotError && <div className="login-error-banner">⚠ {forgotError}</div>}

              <div className="admin-login-actions">
                <button className="btn-back-home" onClick={() => { setView("forgot-answer"); setForgotError(""); }}>
                  ← Back
                </button>
                <button
                  className="btn-login"
                  onClick={handleResetAdminCreds}
                  disabled={isForgotLoading}
                >
                  {isForgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </>
          )}

          {/* ── Forgot: Success ────────────────────────────────────────── */}
          {view === "forgot-success" && (
            <div className="admin-recovery-success">
              <div className="recovery-success-icon">✅</div>
              <h2 className="admin-login-title">Password Reset!</h2>
              <p className="admin-login-subtitle">
                Your admin password has been updated.<br />
                Username: <strong className="recovery-username">{recoveredUsername}</strong>
              </p>
              <button className="btn-login" style={{ width: "100%", marginTop: "1rem" }} onClick={resetForgotFlow}>
                Back to Login →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
