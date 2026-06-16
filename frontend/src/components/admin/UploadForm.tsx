import React, { useState, useEffect } from "react";
import type { Memory, MemoryFormData, MediaItem, MemoryType } from "../../types";
import "./UploadForm.css";

interface UploadFormProps {
  memory: Memory | null;
  onSubmit: (data: Partial<MemoryFormData>) => Promise<boolean>;
  onCancel: () => void;
  uploadMedia: (files: File[]) => Promise<MediaItem[]>;
  isUploading: boolean;
  uploadProgress: number;
  fileProgresses: Record<number, number>;
  deleteMedia: (publicId: string, resourceType: "image" | "video") => Promise<void>;
}

export default function UploadForm({
  memory,
  onSubmit,
  onCancel,
  uploadMedia,
  isUploading,
  uploadProgress,
  fileProgresses,
  deleteMedia,
}: UploadFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MemoryType>("photos");
  const [tags, setTags] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (memory) {
      setCode(memory.code ? String(memory.code) : "");
      setName(memory.name || "");
      setTitle(memory.title || "");
      setDescription(memory.description || "");
      setType(memory.type || "photos");
      setTags(memory.tags ? memory.tags.join(", ") : "");
      setMediaItems(memory.mediaItems || []);
    } else {
      setCode("");
      setName("");
      setTitle("");
      setDescription("");
      setType("photos");
      setTags("");
      setMediaItems([]);
    }
    setError(null);
  }, [memory]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(files);
    try {
      const uploaded = await uploadMedia(files);
      if (uploaded.length > 0) {
        // Append and set correct ordering
        setMediaItems((prev) => {
          const nextOrder = prev.length;
          const newItems = uploaded.map((item, idx) => ({
            ...item,
            order: nextOrder + idx,
          }));
          return [...prev, ...newItems];
        });
      }
    } finally {
      setUploadingFiles([]);
    }
  };

  const handleRemoveMedia = async (index: number) => {
    const item = mediaItems[index];
    const confirmRemove = window.confirm("Are you sure you want to delete this media item from Cloudinary?");
    if (!confirmRemove) return;

    try {
      await deleteMedia(item.publicId, item.resourceType);
      setMediaItems((prev) => {
        const remaining = prev.filter((_, idx) => idx !== index);
        // Reset orders
        return remaining.map((m, idx) => ({ ...m, order: idx }));
      });
    } catch {
      setError("Failed to delete media from Cloudinary.");
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= mediaItems.length) return;

    const updated = [...mediaItems];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;

    // Recalculate orders
    const reordered = updated.map((item, idx) => ({ ...item, order: idx }));
    setMediaItems(reordered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code && !name) {
      setError("You must provide either a search Code or a search Name.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (mediaItems.length === 0) {
      setError("At least one media item must be uploaded.");
      return;
    }

    setIsSubmitting(true);
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const formData: Partial<MemoryFormData> = {
      code: code ? String(Number(code)) : "",
      name: name.trim(),
      title: title.trim(),
      description: description.trim(),
      type,
      tags: parsedTags.join(","),
      mediaItems,
    };

    const success = await onSubmit(formData);
    setIsSubmitting(false);

    if (success) {
      onCancel();
    }
  };

  return (
    <div className="upload-form-overlay">
      <div className="upload-form-modal glass-strong">
        <div className="upload-form-header">
          <h2>{memory ? "Edit Memory" : "Create New Memory"}</h2>
          <button className="btn-close" onClick={onCancel} aria-label="Close modal">
            ✕
          </button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group col-span-1">
            <label htmlFor="form-code">Search Code (Number)</label>
            <input
              type="number"
              id="form-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 42"
            />
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="form-name">Search Name (Text)</label>
            <input
              type="text"
              id="form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. vinayak"
            />
          </div>

          <div className="form-group col-span-2">
            <label htmlFor="form-title">Memory Title</label>
            <input
              type="text"
              id="form-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this memory a catchy title"
              required
            />
          </div>

          <div className="form-group col-span-2">
            <label htmlFor="form-desc">Description</label>
            <textarea
              id="form-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this memory special?"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="form-type">Memory Type</label>
            <select
              id="form-type"
              value={type}
              onChange={(e) => setType(e.target.value as MemoryType)}
            >
              <option value="photos">Photos Only</option>
              <option value="video">Video Only</option>
              <option value="mixed">Mixed Media</option>
            </select>
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="form-tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="form-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. roadtrip, birthday, 2026"
            />
          </div>

          <div className="form-group col-span-2 media-upload-section">
            <label>Media Items ({mediaItems.length})</label>
            
            <div className="file-dropzone">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={isUploading}
                id="file-input"
              />
              {!isUploading ? (
                <label htmlFor="file-input" className="file-dropzone-label">
                  <span>Click to select photos or videos to upload</span>
                </label>
              ) : (
                <div className="uploading-files-container">
                  <div className="upload-header-row">
                    <span className="upload-status-text">Uploading {uploadingFiles.length} file(s)...</span>
                    <span className="upload-total-pct">{uploadProgress}%</span>
                  </div>
                  <div className="overall-progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <div className="individual-files-list">
                    {uploadingFiles.map((file, idx) => {
                      const pct = fileProgresses[idx] ?? 0;
                      return (
                        <div key={idx} className="individual-file-row">
                          <span className="file-name">{file.name}</span>
                          <div className="file-progress-bar-wrapper">
                            <div className="file-progress-bar">
                              <div className="file-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="file-progress-pct">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {mediaItems.length > 0 && (
              <div className="media-preview-list">
                {mediaItems.map((item, index) => (
                  <div key={item.publicId} className="media-preview-card glass">
                    <div className="media-preview-thumbnail">
                      {item.resourceType === "video" ? (
                        <div className="video-thumbnail-placeholder">
                          {item.thumbnail ? <img src={item.thumbnail} alt="" /> : <span>📹 Video</span>}
                        </div>
                      ) : (
                        <img src={item.url} alt="" />
                      )}
                    </div>

                    <div className="media-preview-info">
                      <span className="media-preview-type">
                        {item.resourceType === "video" ? "Video" : "Image"}
                      </span>
                      <span className="media-preview-order">Order: {item.order}</span>
                    </div>

                    <div className="media-preview-reorder">
                      <button
                        type="button"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === mediaItems.length - 1}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-remove-media"
                      onClick={() => handleRemoveMedia(index)}
                      title="Delete media"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions col-span-2">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Saving..." : memory ? "Update Memory" : "Create Memory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
