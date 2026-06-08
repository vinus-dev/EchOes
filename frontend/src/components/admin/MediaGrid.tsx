import type { MediaItem } from "../../types";
import "./MediaGrid.css";

interface MediaGridProps {
  items: MediaItem[];
}

export default function MediaGrid({ items }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="media-grid-empty">
        <p>No media files attached to this memory yet.</p>
      </div>
    );
  }

  return (
    <div className="media-grid-container">
      {items.map((item) => (
        <div key={item.publicId} className="media-grid-card glass">
          <div className="media-grid-preview">
            {item.resourceType === "video" ? (
              <div className="media-grid-video-preview">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" />
                ) : (
                  <div className="video-icon-placeholder">📹</div>
                )}
                <span className="video-badge">VIDEO</span>
              </div>
            ) : (
              <img src={item.url} alt="" loading="lazy" />
            )}
          </div>
          <div className="media-grid-info">
            <span className="media-grid-order">Order: {item.order}</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="media-grid-link"
            >
              Open Link ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
