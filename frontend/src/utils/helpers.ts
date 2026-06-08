// ─── Format Utilities ─────────────────────────────────────────────────────────

/** Pad a number to fixed digits: 7 → "007" */
export const padCode = (code: number, digits = 3): string =>
  String(code).padStart(digits, "0");

/** Format seconds to MM:SS */
export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** Truncate long text */
export const truncate = (str: string, max = 60): string =>
  str.length > max ? str.slice(0, max) + "…" : str;

/** Capitalize first letter */
export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

// ─── Date Utilities ───────────────────────────────────────────────────────────

/** Format ISO date to human-readable: "Jun 8, 2026" */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Time ago: "2 hours ago" */
export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ─── Validation ───────────────────────────────────────────────────────────────

/** Check if a string is numeric */
export const isNumeric = (val: string): boolean => /^\d+$/.test(val.trim());

/** Validate PIN (4-6 digits) */
export const isValidPin = (pin: string): boolean =>
  /^\d{4,6}$/.test(pin.trim());

// ─── Cloudinary Helpers ───────────────────────────────────────────────────────

/** Get Cloudinary thumbnail URL from video URL */
export const getVideoThumbnail = (url: string, width = 400): string =>
  url
    .replace("/upload/", `/upload/w_${width},h_${Math.round(width * 0.5625)},c_fill,so_2/f_jpg/`)
    .replace(/\.\w+$/, ".jpg");

/** Get optimized image URL */
export const getOptimizedImage = (url: string, width = 800): string =>
  url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);

// ─── DOM Utilities ────────────────────────────────────────────────────────────

/** Lock body scroll */
export const lockScroll = () => {
  document.body.style.overflow = "hidden";
};

/** Unlock body scroll */
export const unlockScroll = () => {
  document.body.style.overflow = "";
};

/** Sleep utility */
export const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

// ─── Random Utilities ─────────────────────────────────────────────────────────

/** Random float between min and max */
export const randFloat = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

/** Random integer */
export const randInt = (min: number, max: number): number =>
  Math.floor(randFloat(min, max + 1));

/** Random item from array */
export const randFrom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
