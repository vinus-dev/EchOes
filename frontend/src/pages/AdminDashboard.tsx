import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemoryCard from "../components/admin/MemoryCard";
import UploadForm from "../components/admin/UploadForm";
import AdminScene from "../components/three/AdminScene";
import { useAdmin } from "../hooks/useAdmin";
import { useAuth } from "../hooks/useAuth";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdminLoggedIn, logoutAdmin, resetPin } = useAuth();
  const {
    memories,
    stats,
    isLoading,
    pagination,
    isUploading,
    uploadProgress,
    fetchMemories,
    fetchStats,
    uploadMedia,
    createMemory,
    updateMemory,
    deleteMemory,
    deleteMedia,
  } = useAdmin();

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);

  // Search / Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // PIN reset state
  const [newPin, setNewPin] = useState("");
  const [isResettingPin, setIsResettingPin] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/echoes-admin");
      return;
    }
    fetchMemories({ page: currentPage, search: searchQuery, type: typeFilter });
    fetchStats();
  }, [isAdminLoggedIn, navigate, currentPage, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMemories({ page: 1, search: searchQuery, type: typeFilter });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setCurrentPage(newPage);
  };

  const handleEdit = (memory: any) => {
    setSelectedMemory(memory);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this memory? This cannot be undone.")) {
      const success = await deleteMemory(id);
      if (success) {
        fetchStats();
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedMemory(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    let success = false;
    if (selectedMemory) {
      success = await updateMemory(selectedMemory._id, formData);
    } else {
      success = await createMemory(formData);
    }
    if (success) {
      setIsFormOpen(false);
      fetchMemories({ page: currentPage, search: searchQuery, type: typeFilter });
      fetchStats();
    }
    return success;
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length !== 4) {
      alert("PIN must be exactly 4 digits.");
      return;
    }
    setIsResettingPin(true);
    const success = await resetPin(newPin.trim());
    setIsResettingPin(false);
    if (success) {
      setNewPin("");
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/echoes-admin");
  };

  return (
    <div className="admin-dashboard-page">
      <div className="canvas-container">
        <AdminScene />
      </div>

      <header className="dashboard-header glass">
        <div className="dashboard-header-left">
          <h1 className="dashboard-logo gradient-text">EchOes Admin</h1>
        </div>
        <div className="dashboard-header-right">
          <button className="btn-header glass" onClick={() => navigate("/search")}>
            View App 🔮
          </button>
          <button className="btn-header btn-logout" onClick={handleLogout}>
            Logout 🚪
          </button>
        </div>
      </header>

      <main className="dashboard-main-content">
        {/* Statistics Grid */}
        <section className="dashboard-stats-grid">
          <div className="stat-card glass glow-purple">
            <span className="stat-icon">🌌</span>
            <div className="stat-values">
              <span className="stat-number">{stats?.total ?? 0}</span>
              <span className="stat-label">Total Memories</span>
            </div>
          </div>
          <div className="stat-card glass">
            <span className="stat-icon">📹</span>
            <div className="stat-values">
              <span className="stat-number">{stats?.videos ?? 0}</span>
              <span className="stat-label">Videos</span>
            </div>
          </div>
          <div className="stat-card glass">
            <span className="stat-icon">🖼️</span>
            <div className="stat-values">
              <span className="stat-number">{stats?.photos ?? 0}</span>
              <span className="stat-label">Photo sets</span>
            </div>
          </div>
          <div className="stat-card glass">
            <span className="stat-icon">👁️</span>
            <div className="stat-values">
              <span className="stat-number">{stats?.totalViews ?? 0}</span>
              <span className="stat-label">Total views</span>
            </div>
          </div>
        </section>

        {/* Action Controls & Filters */}
        <section className="dashboard-controls-row">
          <form onSubmit={handleSearchSubmit} className="dashboard-filter-form">
            <input
              type="text"
              className="search-input glass"
              placeholder="Search by title, tags or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="type-select glass"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="photos">Photos Only</option>
              <option value="video">Video Only</option>
              <option value="mixed">Mixed Media</option>
            </select>
            <button type="submit" className="btn-search glass">
              Filter
            </button>
          </form>

          <button className="btn-create-memory glow-purple" onClick={handleCreateNew}>
            + Add New Memory
          </button>
        </section>

        {/* Memories Grid List */}
        <section className="dashboard-memories-section">
          {isLoading ? (
            <div className="dashboard-loading-placeholder">
              <p>Loading memories...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="dashboard-empty-placeholder glass">
              <p>No memories found. Click "+ Add New Memory" to get started!</p>
            </div>
          ) : (
            <div className="memories-grid">
              {memories.map((memory) => (
                <div key={memory._id} className="grid-item">
                  <MemoryCard
                    memory={memory}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="dashboard-pagination">
              <button
                className="btn-pagination glass"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ◀ Prev
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn-pagination glass"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Next ▶
              </button>
            </div>
          )}
        </section>

        {/* Configuration / Tools Section */}
        <section className="dashboard-tools-section glass">
          <h2>Security & System Settings</h2>
          <div className="tools-grid">
            <form onSubmit={handleResetPin} className="pin-reset-form">
              <h3>App Unlock PIN</h3>
              <p>Reset the numeric 4-digit code required to unlock memories.</p>
              <div className="pin-input-group">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="New 4-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  required
                />
                <button type="submit" className="btn-reset-pin" disabled={isResettingPin}>
                  {isResettingPin ? "Updating..." : "Reset PIN"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Upload/Edit Modal */}
      {isFormOpen && (
        <UploadForm
          memory={selectedMemory}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          uploadMedia={uploadMedia}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          deleteMedia={deleteMedia}
        />
      )}
    </div>
  );
}
