import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashPage from "./pages/SplashPage";
import PinPage from "./pages/PinPage";
import SearchPage from "./pages/SearchPage";
import MemoryPage from "./pages/MemoryPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import Toast from "./components/ui/Toast";
import { useAuth } from "./hooks/useAuth";

// ─── PIN Protection Guard ───────────────────────────────────────────────────
function UserRouteGuard({ children }: { children: React.ReactNode }) {
  const { isPinUnlocked } = useAuth();
  
  if (!isPinUnlocked) {
    return <Navigate to="/pin" replace />;
  }
  return <>{children}</>;
}

// ─── Admin Auth Guard ────────────────────────────────────────────────────────
function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useAuth();
  
  if (!isAdminLoggedIn) {
    return <Navigate to="/echoes-admin" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Visual Toast Notification Container */}
      <Toast />

      <Routes>
        {/* Public Flow */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/pin" element={<PinPage />} />

        {/* Protected User Pages */}
        <Route
          path="/search"
          element={
            <UserRouteGuard>
              <SearchPage />
            </UserRouteGuard>
          }
        />
        <Route
          path="/memory"
          element={
            <UserRouteGuard>
              <MemoryPage />
            </UserRouteGuard>
          }
        />

        {/* Admin Flow */}
        <Route path="/echoes-admin" element={<AdminLoginPage />} />
        <Route
          path="/echoes-admin/dashboard"
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
