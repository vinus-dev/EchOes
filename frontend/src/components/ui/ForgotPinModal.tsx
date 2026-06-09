import { useState } from "react";
import toast from "react-hot-toast";
import { recoveryApi } from "../../services/api";
import "./ForgotPinModal.css";

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (newPin: string) => Promise<boolean>;
}

export default function ForgotPinModal({ isOpen, onClose, onReset }: ForgotPinModalProps) {
  const [step, setStep] = useState<"question" | "password" | "reset">("question");
  const [answer, setAnswer] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleAnswerSubmit = async () => {
    setError("");
    if (!answer.trim()) {
      setError("Please enter an answer.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await recoveryApi.verifyQA(answer);
      if (res.success && res.recoveryToken) {
        setRecoveryToken(res.recoveryToken);
        setStep("password");
        setAnswer("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setError("");
    if (!adminPassword.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await recoveryApi.verifyPassword(adminPassword, recoveryToken);
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setStep("reset");
        setAdminPassword("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Password verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async () => {
    setError("");
    if (!newPin.trim() || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }

    setIsLoading(true);
    const success = await onReset(newPin);
    setIsLoading(false);

    if (success) {
      toast.success("PIN reset successfully!", { duration: 3000 });
      resetModal();
    } else {
      setError("Failed to reset PIN. Please try again.");
    }
  };

  const resetModal = () => {
    setStep("question");
    setAnswer("");
    setAdminPassword("");
    setNewPin("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-pin-modal-overlay" onClick={resetModal}>
      <div className="forgot-pin-modal glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={resetModal}>✕</button>

        {step === "question" && (
          <div className="modal-content">
            <h2>Recover Your PIN</h2>
            <p className="modal-subtitle">Answer the security question to proceed.</p>
            
            <div className="modal-question">
              <label>Q: Enter your database username</label>
              <input
                type="text"
                placeholder="Your DB username"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                autoComplete="off"
                className="modal-input"
              />
            </div>

            {error && <p className="modal-error">{error}</p>}

            <button
              className="modal-button glass"
              onClick={handleAnswerSubmit}
              disabled={isLoading}
            >
              Verify Answer
            </button>
          </div>
        )}

        {step === "password" && (
          <div className="modal-content">
            <h2>Verify Admin Password</h2>
            <p className="modal-subtitle">Enter the admin password to continue.</p>
            
            <div className="modal-question">
              <label>Admin Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoComplete="off"
                className="modal-input"
              />
            </div>

            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button
                className="modal-button glass"
                onClick={() => {
                  setStep("question");
                  setError("");
                }}
              >
                Back
              </button>
              <button
                className="modal-button glass"
                onClick={handlePasswordSubmit}
                disabled={isLoading}
              >
                Verify Password
              </button>
            </div>
          </div>
        )}

        {step === "reset" && (
          <div className="modal-content">
            <h2>Set New PIN</h2>
            <p className="modal-subtitle">Enter your new 4-digit PIN.</p>
            
            <div className="modal-question">
              <label>New PIN (4 digits)</label>
              <input
                type="password"
                placeholder="0000"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                autoComplete="off"
                className="modal-input"
              />
            </div>

            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button
                className="modal-button glass"
                onClick={resetModal}
              >
                Cancel
              </button>
              <button
                className="modal-button glass glow-purple"
                onClick={handleResetPin}
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset PIN"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
