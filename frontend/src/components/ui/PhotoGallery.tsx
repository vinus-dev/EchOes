import { useState, useEffect, useCallback, useRef } from "react";
import type { MediaItem } from "../../types";
import { getOptimizedImage } from "../../utils/helpers";
import "./PhotoGallery.css";

interface PhotoGalleryProps {
  items: MediaItem[];
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Swipe gesture tracking
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setIsZoomed(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsZoomed(false);
  };

  const prev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + items.length) % items.length);
    setIsZoomed(false);
  }, [lightboxIndex, items.length]);

  const next = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % items.length);
    setIsZoomed(false);
  }, [lightboxIndex, items.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, prev, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartRef.current === null || touchEndRef.current === null) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }
  };

  // Helper to force direct file download from Cloudinary via attachment flags
  const getDownloadUrl = (url: string) => {
    if (url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
  };

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Masonry Layout Grid */}
      <div className="gallery-masonry">
        {sorted.map((item, i) => (
          <button
            key={item.publicId}
            className="gallery-thumb"
            onClick={() => openLightbox(i)}
            aria-label={`View photo ${i + 1}`}
          >
            <img
              src={getOptimizedImage(item.url, 400)}
              alt={`Memory photo ${i + 1}`}
              loading="lazy"
            />
            <div className="gallery-thumb-overlay">
              <span className="gallery-thumb-icon">🔍</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar Action Buttons */}
            <div className="lightbox-toolbar">
              <a
                href={getDownloadUrl(sorted[lightboxIndex].url)}
                download={`photo-${lightboxIndex + 1}.jpg`}
                className="lightbox-tool-btn lightbox-download"
                target="_blank"
                rel="noopener noreferrer"
                title="Download photo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
              <button
                className="lightbox-tool-btn lightbox-close"
                onClick={closeLightbox}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Navigation Controls */}
            <button
              className="lightbox-nav lightbox-nav--prev"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>

            {/* Main Image Frame */}
            <div className="lightbox-img-wrapper">
              <img
                className={`lightbox-img ${isZoomed ? "zoomed" : ""}`}
                src={getOptimizedImage(sorted[lightboxIndex].url, 1200)}
                alt={`Memory photo ${lightboxIndex + 1}`}
                onClick={() => setIsZoomed((z) => !z)}
              />
            </div>

            <button
              className="lightbox-nav lightbox-nav--next"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next photo"
            >
              ›
            </button>

            {/* Status indicators */}
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {sorted.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
