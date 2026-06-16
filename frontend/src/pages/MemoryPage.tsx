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
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

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
        <button
          className="btn-toggle-details glass mobile-only-btn"
          onClick={() => setShowMobileDetails(!showMobileDetails)}
        >
          {showMobileDetails ? "Hide" : "Show"} Details
        </button>
      </header>

      <div className="memory-container">
        {/* Left / Primary Column: Media Display */}
        <div className="memory-media-section">
          {currentMemory.type === "video" && videos.length > 0 ? (
            <div className="video-section-wrapper">
              <div className="video-player-container">
                <MediaPlayer key={videos[activeVideoIndex].url} item={videos[activeVideoIndex]} autoPlay={true} />
              </div>
              
              {/* Carousel for multiple videos */}
              {videos.length > 1 && (
                <div className="video-carousel-container glass">
                  <h3 className="carousel-title">Select Video</h3>
                  <div className="video-carousel-list">
                    {videos.map((vid, idx) => (
                      <button
                        key={vid.url}
                        className={`video-carousel-item glass ${idx === activeVideoIndex ? "active" : ""}`}
                        onClick={() => setActiveVideoIndex(idx)}
                        aria-label={`Play Video ${idx + 1}`}
                      >
                        <div className="video-thumbnail-wrapper">
                          {vid.thumbnail ? (
                            <img src={vid.thumbnail} alt={`Video ${idx + 1}`} />
                          ) : (
                            <div className="video-icon-placeholder">🎥</div>
                          )}
                          <span className="video-number">Video {idx + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentMemory.type === "photos" && photos.length > 0 ? (
            <div className="photo-gallery-container glass glow-purple">
              <PhotoGallery items={photos} />
            </div>
          ) : (
            // Mixed Media type
            <div className="mixed-media-container">
              {videos.length > 0 && (
                <div className="video-section-wrapper">
                  <div className="video-player-container">
                    <MediaPlayer key={videos[activeVideoIndex].url} item={videos[activeVideoIndex]} autoPlay={false} />
                  </div>
                  {videos.length > 1 && (
                    <div className="video-carousel-container glass">
                      <h3 className="carousel-title">Select Video</h3>
                      <div className="video-carousel-list">
                        {videos.map((vid, idx) => (
                          <button
                            key={vid.url}
                            className={`video-carousel-item glass ${idx === activeVideoIndex ? "active" : ""}`}
                            onClick={() => setActiveVideoIndex(idx)}
                          >
                            <div className="video-thumbnail-wrapper">
                              {vid.thumbnail ? (
                                <img src={vid.thumbnail} alt={`Video ${idx + 1}`} />
                              ) : (
                                <div className="video-icon-placeholder">🎥</div>
                              )}
                              <span className="video-number">Video {idx + 1}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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

        {/* Right Column / Sidebar: Details section (always visible on desktop, toggled on mobile) */}
        <div className={`memory-details-section ${showMobileDetails ? "mobile-visible" : "mobile-hidden"}`}>
          <div className="memory-details-card glass glow-gold">
            <div className="memory-meta">
              {currentMemory.code && <span className="meta-badge code-badge">Code: {currentMemory.code}</span>}
              {currentMemory.name && <span className="meta-badge name-badge">Name: {currentMemory.name}</span>}
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
        </div>
      </div>
    </div>
  );
}
