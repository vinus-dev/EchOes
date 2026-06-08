import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchScene from "../components/three/SearchScene";
import SearchBar from "../components/ui/SearchBar";
import { useMemory } from "../hooks/useMemory";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";
import "./SearchPage.css";

export default function SearchPage() {
  const navigate = useNavigate();
  const { searchMemory, isSearching, searchError, clearMemory } = useMemory();
  const { isPinUnlocked, isAdminLoggedIn } = useAuth();
  const lockPin = useAuthStore((state) => state.lockPin);

  useEffect(() => {
    // Clear any previous memory state when entering search
    clearMemory();
    
    if (!isPinUnlocked) {
      navigate("/pin");
    }
  }, [isPinUnlocked, navigate, clearMemory]);

  const handleLock = () => {
    lockPin();
    navigate("/pin");
  };

  return (
    <div className="full-page search-page">
      <div className="canvas-container">
        <SearchScene />
      </div>

      <header className="search-header">
        <h1 className="search-logo gradient-text">EchOes</h1>
        <div className="header-actions">
          {isAdminLoggedIn && (
            <button className="btn-header glass" onClick={() => navigate("/echoes-admin")}>
              Dashboard 🛠️
            </button>
          )}
          <button
            className="btn-header glass"
            onClick={handleLock}
          >
            Lock 🔒
          </button>
        </div>
      </header>

      <div className="page-content search-content">
        <div className="search-box">
          <p className="search-instructions">
            Enter a secret number or code name to retrieve its memory.
          </p>
          <SearchBar onSearch={searchMemory} isLoading={isSearching} />
          {searchError && <p className="search-error-msg">{searchError}</p>}
        </div>
      </div>

      <footer className="search-footer">
        <button className="admin-link-btn" onClick={() => navigate("/echoes-admin")}>
          Admin Area
        </button>
      </footer>
    </div>
  );
}
