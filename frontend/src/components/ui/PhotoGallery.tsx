import { useState, useEffect, useCallback } from "react";
import type { MediaItem } from "../../types";
import { getOptimizedImage } from "../../utils/helpers";
import "./PhotoGallery.css";

interface PhotoGalleryProps {
  items: MediaItem[];
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const openLightbox = (i: number) => { setLightboxIndex(i); setIsZoomed(false); };
  const closeLightbox = () => { setLightboxIndex(null); setIsZoomed(false); };

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

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Grid */}
      <div className={`gallery-grid gallery-grid--${Math.min(sorted.length, 4)}`}>
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            <button className="lightbox-nav lightbox-nav--prev" onClick={prev} aria-label="Previous">‹</button>
            <img
              className={`lightbox-img ${isZoomed ? "zoomed" : ""}`}
              src={getOptimizedImage(sorted[lightboxIndex].url, 1200)}
              alt={`Memory photo ${lightboxIndex + 1}`}
              onClick={() => setIsZoomed((z) => !z)}
            />
            <button className="lightbox-nav lightbox-nav--next" onClick={next} aria-label="Next">›</button>
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {sorted.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
