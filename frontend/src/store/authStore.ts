import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, Admin } from "../types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isPinUnlocked: false,
      adminToken: null,
      admin: null,

      unlockPin: () => set({ isPinUnlocked: true }),
      lockPin: () => set({ isPinUnlocked: false }),

      setAdminAuth: (token: string, admin: Admin) => {
        localStorage.setItem("echoes_admin_token", token);
        set({ adminToken: token, admin });
      },

      logoutAdmin: () => {
        localStorage.removeItem("echoes_admin_token");
        set({ adminToken: null, admin: null });
      },
    }),
    {
      name: "echoes-auth",
      partialize: (state) => ({
        // Only persist pin unlock state — tokens are in localStorage separately
        isPinUnlocked: state.isPinUnlocked,
      }),
    }
  )
);
