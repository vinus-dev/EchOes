import { useState } from "react";
import toast from "react-hot-toast";
import { recoveryApi } from "../../services/api";
import "./ForgotPinModal.css";

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPinModal({ isOpen, onClose }: ForgotPinModalProps) {
  const [step, setStep] = useState<"credentials" | "reset" | "success">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── Step 1: Verify admin credentials ───────────────────────────────────────
  const handleCredentialsSubmit = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in both username and password.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await recoveryApi.verifyAdmin(username.trim(), password);
      if (res.success && res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setStep("reset");
        setUsername("");
        setPassword("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid admin credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Set new PIN ─────────────────────────────────────────────────────
  const handleResetPin = async () => {
    setError("");
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await recoveryApi.recoveryResetPin(newPin, resetToken);
      if (res.success) {
        setStep("success");
        toast.success("PIN reset successfully! 🔑", { duration: 3000 });
        setTimeout(() => {
          resetModal();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep("credentials");
    setUsername("");
    setPassword("");
    setNewPin("");
    setConfirmPin("");
    setResetToken("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-modal-overlay" onClick={resetModal}>
      <div className="forgot-modal glass-strong" onClick={(e) => e.stopPropagation()}>
        <button className="forgot-modal-close" onClick={resetModal} aria-label="Close">✕</button>

        {/* Step indicator */}
        <div className="forgot-steps">
          <div className={`forgot-step ${step !== "success" ? "active" : "done"}`}>
            <span className="step-dot">{step === "credentials" ? "1" : "✓"}</span>
            <span className="step-label">Verify Identity</span>
          </div>
          <div className="step-connector" />
          <div className={`forgot-step ${step === "reset" ? "active" : step === "success" ? "done" : ""}`}>
            <span className="step-dot">{step === "success" ? "✓" : "2"}</span>
            <span className="step-label">New PIN</span>
          </div>
        </div>

        {/* ── Step 1: Admin Credentials ─────────────────────────────────── */}
        {step === "credentials" && (
          <div className="forgot-step-content">
            <div className="forgot-icon">🔐</div>
            <h2 className="forgot-title">Recover PIN</h2>
            <p className="forgot-subtitle">Enter admin credentials to reset the unlock PIN.</p>

            <div className="forgot-field">
              <label>Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="off"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCredentialsSubmit()}
              />
            </div>

            <div className="forgot-field">
              <label>Admin Password</label>
              <div className="forgot-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="off"
                  onKeyDown={(e) => e.key === "Enter" && handleCredentialsSubmit()}
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <p className="forgot-error">⚠ {error}</p>}

            <button
              className="btn-forgot-primary"
              onClick={handleCredentialsSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading"><span className="spinner-sm" /> Verifying...</span>
              ) : (
                "Verify & Continue →"
              )}
            </button>
          </div>
        )}

        {/* ── Step 2: Set New PIN ───────────────────────────────────────── */}
        {step === "reset" && (
          <div className="forgot-step-content">
            <div className="forgot-icon">🔑</div>
            <h2 className="forgot-title">Set New PIN</h2>
            <p className="forgot-subtitle">Choose a new 4-digit unlock PIN.</p>

            <div className="forgot-field">
              <label>New PIN (4 digits)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                autoFocus
                className="pin-input-large"
              />
            </div>

            <div className="forgot-field">
              <label>Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="pin-input-large"
                onKeyDown={(e) => e.key === "Enter" && handleResetPin()}
              />
            </div>

            {newPin.length === 4 && confirmPin.length === 4 && newPin === confirmPin && (
              <p className="forgot-match">✓ PINs match</p>
            )}

            {error && <p className="forgot-error">⚠ {error}</p>}

            <div className="forgot-actions">
              <button
                className="btn-forgot-secondary"
                onClick={() => { setStep("credentials"); setError(""); }}
              >
                ← Back
              </button>
              <button
                className="btn-forgot-primary"
                onClick={handleResetPin}
                disabled={isLoading || newPin.length !== 4}
              >
                {isLoading ? (
                  <span className="btn-loading"><span className="spinner-sm" /> Resetting...</span>
                ) : (
                  "Reset PIN 🔑"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Success ──────────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="forgot-step-content forgot-success">
            <div className="forgot-icon success-icon">✅</div>
            <h2 className="forgot-title">PIN Reset!</h2>
            <p className="forgot-subtitle">Your unlock PIN has been updated. You can now use the new PIN.</p>
          </div>
        )}
      </div>
    </div>
  );
}
