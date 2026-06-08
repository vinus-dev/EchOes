import axios from "axios";
import type {
  Memory,
  ApiResponse,
  PaginatedResponse,
  AdminLoginResponse,
  DashboardStats,
  MemoryFormData,
  MediaItem,
} from "../types";

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("echoes_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("echoes_admin_token");
      // Don't force redirect here — let the store handle it
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  verifyPin: async (pin: string): Promise<ApiResponse<null>> => {
    const res = await api.post("/auth/verify-pin", { pin });
    return res.data;
  },

  adminLogin: async (username: string, password: string): Promise<AdminLoginResponse> => {
    const res = await api.post("/auth/admin/login", { username, password });
    return res.data;
  },

  resetPin: async (newPin: string): Promise<ApiResponse<null>> => {
    const res = await api.put("/auth/admin/reset-pin", { newPin });
    return res.data;
  },
};

// ─── Memory API ───────────────────────────────────────────────────────────────

export const memoryApi = {
  search: async (q: string): Promise<ApiResponse<Memory>> => {
    const res = await api.get("/memories/search", { params: { q } });
    return res.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<PaginatedResponse<Memory>> => {
    const res = await api.get("/memories", { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Memory>> => {
    const res = await api.get(`/memories/${id}`);
    return res.data;
  },

  create: async (data: Partial<MemoryFormData>): Promise<ApiResponse<Memory>> => {
    const res = await api.post("/memories", data);
    return res.data;
  },

  update: async (id: string, data: Partial<MemoryFormData>): Promise<ApiResponse<Memory>> => {
    const res = await api.put(`/memories/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/memories/${id}`);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await api.get("/memories/stats");
    return res.data;
  },
};

// ─── Media API ────────────────────────────────────────────────────────────────

export const mediaApi = {
  upload: async (
    files: File[],
    onProgress?: (pct: number) => void
  ): Promise<ApiResponse<MediaItem[]>> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("media", f));

    const res = await api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data;
  },

  delete: async (
    publicId: string,
    resourceType: "image" | "video" = "image"
  ): Promise<ApiResponse<null>> => {
    const res = await api.delete(
      `/media/${encodeURIComponent(publicId)}`,
      { params: { resourceType } }
    );
    return res.data;
  },
};

export default api;
