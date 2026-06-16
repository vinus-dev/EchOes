import { useRef, useState, useEffect } from "react";
import type { MediaItem } from "../../types";
import { formatDuration } from "../../utils/helpers";
import "./MediaPlayer.css";

interface MediaPlayerProps {
  item: MediaItem;
  autoPlay?: boolean;
}

export default function MediaPlayer({ item, autoPlay = false }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<{ show: boolean; direction: "left" | "right" }>({
    show: false,
    direction: "left",
  });

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => {
      setCurrentTime(v.currentTime);
      setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(v.duration);
    const onEnd = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onSeeking = () => setIsBuffering(true);
    const onSeeked = () => setIsBuffering(false);

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("seeking", onSeeking);
    v.addEventListener("seeked", onSeeked);

    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("seeking", onSeeking);
      v.removeEventListener("seeked", onSeeked);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const seekDelta = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
    setSeekFeedback({ show: true, direction: delta < 0 ? "left" : "right" });
    
    // Clear and hide feedback after animation
    const timer = setTimeout(() => {
      setSeekFeedback((prev) => ({ ...prev, show: false }));
    }, 600);
    return () => clearTimeout(timer);
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickTimeoutRef.current) {
      // Double click detected -> Seek
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;

      if (clickX < width * 0.45) {
        seekDelta(-10);
      } else if (clickX > width * 0.55) {
        seekDelta(10);
      } else {
        // Toggle play if clicked in center
        togglePlay();
      }
    } else {
      // Set timeout for single click
      clickTimeoutRef.current = setTimeout(() => {
        togglePlay();
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
    resetHideTimer();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const vol = parseFloat(e.target.value);
    v.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="player-wrapper" onMouseMove={resetHideTimer} onTouchStart={resetHideTimer}>
      <div className="player-video-container">
        <video
          ref={videoRef}
          className="player-video"
          src={item.url}
          poster={item.thumbnail || undefined}
          autoPlay={autoPlay}
          playsInline
          onClick={handleVideoClick}
        />

        {/* Buffering Indicator Spinner */}
        {isBuffering && (
          <div className="player-buffering-overlay">
            <div className="player-spinner" />
          </div>
        )}

        {/* Double Tap Seek Feedback Overlay */}
        {seekFeedback.show && (
          <div className={`player-seek-feedback ${seekFeedback.direction}`}>
            <div className="feedback-ripple" />
            <div className="feedback-content">
              <span className="feedback-icon">
                {seekFeedback.direction === "left" ? "⏪" : "⏩"}
              </span>
              <span className="feedback-text">
                {seekFeedback.direction === "left" ? "-10s" : "+10s"}
              </span>
            </div>
          </div>
        )}

        {/* Big play overlay (hidden when playing or buffering) */}
        {!isPlaying && !isBuffering && (
          <button className="player-play-overlay" onClick={togglePlay} aria-label="Play">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {/* Controls */}
        <div className={`player-controls ${showControls || !isPlaying ? "visible" : ""}`}>
          {/* Progress bar */}
          <div className="player-progress" onClick={seek}>
            <div className="player-progress-fill" style={{ width: `${progress}%` }} />
            <div className="player-progress-thumb" style={{ left: `${progress}%` }} />
          </div>

          <div className="player-bottom">
            <button className="player-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? "⏸" : "▶️"}
            </button>

            <div className="player-volume">
              <button className="player-btn" onClick={toggleMute}>
                {isMuted || volume === 0 ? "🔇" : "🔊"}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="player-volume-slider"
                aria-label="Volume"
              />
            </div>

            <span className="player-time">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>

            <button className="player-btn player-fs-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
              {isFullscreen ? "⊡" : "⛶"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
