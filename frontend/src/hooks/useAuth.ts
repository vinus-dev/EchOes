import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { unlockPin, setAdminAuth, logoutAdmin, isPinUnlocked, adminToken, admin } =
    useAuthStore();

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      setIsVerifying(true);
      try {
        const res = await authApi.verifyPin(pin);
        if (res.success) {
          unlockPin();
          return true;
        }
        return false;
      } catch (err: any) {
        const msg = err.response?.data?.message || "Incorrect PIN";
        toast.error(msg);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [unlockPin]
  );

  const loginAdmin = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoggingIn(true);
      try {
        const res = await authApi.adminLogin(username, password);
        if (res.success) {
          setAdminAuth(res.token, res.admin);
          toast.success(`Welcome back, ${res.admin.username}! 👋`);
          return true;
        }
        return false;
      } catch (err: any) {
        const msg = err.response?.data?.message || "Login failed";
        toast.error(msg);
        return false;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [setAdminAuth]
  );

  /**
   * Reset PIN from admin dashboard.
   * Requires both the current PIN (for verification) and the new PIN.
   */
  const resetPin = useCallback(
    async (newPin: string, currentPin: string): Promise<boolean> => {
      try {
        const res = await authApi.resetPin(newPin, currentPin);
        if (res.success) {
          toast.success("PIN updated successfully! 🔑");
          return true;
        }
        return false;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update PIN");
        return false;
      }
    },
    []
  );

  return {
    isPinUnlocked,
    isAdminLoggedIn: !!adminToken,
    admin,
    isVerifying,
    isLoggingIn,
    verifyPin,
    loginAdmin,
    logoutAdmin,
    resetPin,
  };
};
