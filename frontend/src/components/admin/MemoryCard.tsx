import type { Memory } from "../../types";
import "./MemoryCard.css";

interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

export default function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const firstMedia = memory.mediaItems?.[0];
  const thumbnail = firstMedia?.thumbnail || firstMedia?.url;

  return (
    <div className="memory-card glass glow-purple">
      <div className="memory-card-media">
        {thumbnail ? (
          <img src={thumbnail} alt={memory.title} loading="lazy" />
        ) : (
          <div className="memory-card-no-media">
            <span>No Media</span>
          </div>
        )}
        <div className="memory-card-badge">
          {memory.type === "video" ? "📹 Video" : memory.type === "photos" ? "🖼️ Photos" : "🌌 Mixed"}
        </div>
      </div>

      <div className="memory-card-content">
        <div className="memory-card-header">
          <h3>{memory.title}</h3>
          <span className="memory-card-views">👁️ {memory.viewCount} views</span>
        </div>

        <p className="memory-card-desc">{memory.description || "No description provided."}</p>

        <div className="memory-card-details">
          <div className="memory-card-keys">
            {memory.code && <span className="key-badge">Code: {memory.code}</span>}
            {memory.name && <span className="key-badge">Name: {memory.name}</span>}
          </div>
          {memory.tags.length > 0 && (
            <div className="memory-card-tags">
              {memory.tags.map((t, idx) => (
                <span key={idx} className="tag">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="memory-card-actions">
          <button className="btn-edit" onClick={() => onEdit(memory)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(memory._id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
