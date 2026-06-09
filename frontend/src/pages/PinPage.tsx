import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PinScene from "../components/three/PinScene";
import PinPad from "../components/ui/PinPad";
import ForgotPinModal from "../components/ui/ForgotPinModal";
import { useAuth } from "../hooks/useAuth";
import "./PinPage.css";

export default function PinPage() {
  const navigate = useNavigate();
  const { verifyPin, isPinUnlocked, isVerifying, resetPin } = useAuth();
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  useEffect(() => {
    if (isPinUnlocked) {
      navigate("/search");
    }
  }, [isPinUnlocked, navigate]);

  const handleSubmit = async (pin: string) => {
    const success = await verifyPin(pin);
    if (success) {
      navigate("/search");
      return true;
    }
    return false;
  };

  const handleResetPin = async (newPin: string): Promise<boolean> => {
    try {
      const success = await resetPin(newPin);
      return success;
    } catch (error) {
      console.error("Error resetting PIN:", error);
      return false;
    }
  };

  return (
    <div className="full-page pin-page">
      <div className="canvas-container">
        <PinScene />
      </div>

      <div className="page-content pin-content">
        <div className="pin-card glass-strong glow-purple">
          <h2 className="pin-title">Unlock Memories</h2>
          <p className="pin-subtitle">Enter the access PIN to unlock memories</p>
          <PinPad onSubmit={handleSubmit} isLoading={isVerifying} length={4} />
          
          <button 
            className="btn-forgot-pin glass"
            onClick={() => setIsForgotModalOpen(true)}
          >
            Forgot PIN?
          </button>
        </div>
      </div>

      <ForgotPinModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onReset={handleResetPin}
      />
    </div>
  );
}
