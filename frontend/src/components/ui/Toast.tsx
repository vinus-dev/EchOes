import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: "glass-strong glow-purple",
        style: {
          background: "rgba(22, 22, 42, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          color: "#ffffff",
          fontFamily: "var(--font-primary)",
          fontSize: "var(--text-sm)",
          borderRadius: "var(--radius-md)",
          padding: "var(--sp-3) var(--sp-4)",
          boxShadow: "var(--shadow-card)",
        },
        success: {
          iconTheme: {
            primary: "var(--cyan-500)",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--rose-500)",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
