import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemoryScene from "../components/three/MemoryScene";
import MediaPlayer from "../components/ui/MediaPlayer";
import PhotoGallery from "../components/ui/PhotoGallery";
import { useMemory } from "../hooks/useMemory";
import "./MemoryPage.css";

export default function MemoryPage() {
  const navigate = useNavigate();
  const { currentMemory } = useMemory();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!currentMemory) {
      navigate("/search");
    }
  }, [currentMemory, navigate]);

  if (!currentMemory) return null;

  const handleBack = () => {
    navigate("/search");
  };

  const videos = currentMemory.mediaItems.filter((item) => item.resourceType === "video");
  const photos = currentMemory.mediaItems.filter((item) => item.resourceType === "image");

  return (
    <div className="full-page memory-page">
      <div className="canvas-container">
        <MemoryScene />
      </div>

      <header className="memory-header">
        <button className="btn-back glass" onClick={handleBack}>
          ← Back
        </button>
        <button className="btn-toggle-details glass" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "Hide" : "Show"} Details
        </button>
      </header>

      <div className="memory-container">
        {/* Media Section - Primary Focus */}
        <div className="memory-media-section">
          {currentMemory.type === "video" && videos.length > 0 ? (
            <div className="video-player-container">
              <MediaPlayer item={videos[0]} autoPlay={true} />
            </div>
          ) : currentMemory.type === "photos" && photos.length > 0 ? (
            <div className="photo-gallery-container glass glow-purple">
              <PhotoGallery items={photos} />
            </div>
          ) : (
            <div className="mixed-media-container">
              {videos.length > 0 && (
                <div className="video-player-container">
                  <MediaPlayer item={videos[0]} autoPlay={false} />
                </div>
              )}
              {photos.length > 0 && (
                <div className="photo-gallery-container glass glow-purple">
                  <PhotoGallery items={photos} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details Section - Collapsible on Mobile */}
        {showDetails && (
          <div className="memory-details-section">
            <div className="memory-meta">
              {currentMemory.code && <span className="meta-badge">Code: {currentMemory.code}</span>}
              {currentMemory.name && <span className="meta-badge">Name: {currentMemory.name}</span>}
            </div>
            <h1 className="memory-title gradient-text-gold">{currentMemory.title}</h1>
            {currentMemory.description && <p className="memory-description">{currentMemory.description}</p>}
            
            {currentMemory.tags && currentMemory.tags.length > 0 && (
              <div className="memory-tags">
                {currentMemory.tags.map((tag, i) => (
                  <span key={i} className="memory-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
