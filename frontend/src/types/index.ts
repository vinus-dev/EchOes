// ─── Memory Types ─────────────────────────────────────────────────────────────

export interface MediaItem {
  publicId: string;
  url: string;
  thumbnail: string | null;
  resourceType: "image" | "video";
  order: number;
}

export type MemoryType = "video" | "photos" | "mixed";

export interface Memory {
  _id: string;
  code?: number;
  name?: string;
  title: string;
  description: string;
  type: MemoryType;
  mediaItems: MediaItem[];
  tags: string[];
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface Admin {
  id: string;
  username: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  videos: number;
  photos: number;
  mixed: number;
  totalViews: number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface MemoryFormData {
  code: string;
  name: string;
  title: string;
  description: string;
  type: MemoryType;
  tags: string;
  mediaItems: MediaItem[];
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface AuthState {
  isPinUnlocked: boolean;
  adminToken: string | null;
  admin: Admin | null;
  unlockPin: () => void;
  lockPin: () => void;
  setAdminAuth: (token: string, admin: Admin) => void;
  logoutAdmin: () => void;
}

export interface MemoryState {
  currentMemory: Memory | null;
  isSearching: boolean;
  searchError: string | null;
  setMemory: (memory: Memory | null) => void;
  setSearching: (v: boolean) => void;
  setSearchError: (err: string | null) => void;
}
