import { useState, useCallback, useRef, useEffect } from "react";
import "./PinPad.css";

interface PinPadProps {
  onSubmit: (pin: string) => Promise<boolean>;
  isLoading?: boolean;
  length?: number;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PinPad({ onSubmit, isLoading = false, length = 4 }: PinPadProps) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<"none" | "success" | "error">("none");
  const submitting = useRef(false);

  const handleKey = useCallback(
    async (key: string) => {
      if (isLoading || submitting.current) return;

      if (key === "⌫") {
        setPin((p) => p.slice(0, -1));
        return;
      }
      if (key === "") return;

      const newPin = pin + key;
      setPin(newPin);

      if (newPin.length === length) {
        submitting.current = true;
        const ok = await onSubmit(newPin);
        if (ok) {
          setFlash("success");
        } else {
          setFlash("error");
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setFlash("none");
            setPin("");
            submitting.current = false;
          }, 700);
        }
      }
    },
    [pin, length, onSubmit, isLoading]
  );

  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      if (e.key === "Backspace") handleKey("⌫");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  return (
    <div className="pinpad-wrapper">
      {/* Dots */}
      <div className={`pinpad-dots ${shake ? "anim-shake" : ""}`}>
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`pinpad-dot ${i < pin.length ? "filled" : ""} ${
              flash === "success" ? "dot-success" : flash === "error" ? "dot-error" : ""
            }`}
          />
        ))}
      </div>

      {/* Keys */}
      <div className="pinpad-grid">
        {KEYS.map((key, i) => (
          <button
            key={i}
            className={`pinpad-key ${key === "" ? "pinpad-key--empty" : ""} ${
              key === "⌫" ? "pinpad-key--back" : ""
            }`}
            onClick={() => handleKey(key)}
            disabled={isLoading || key === "" || pin.length >= length}
            aria-label={key === "⌫" ? "backspace" : key}
          >
            {isLoading && key === "0" ? (
              <span className="pinpad-spinner" />
            ) : (
              key
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
