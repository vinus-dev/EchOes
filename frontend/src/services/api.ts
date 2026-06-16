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
  // baseURL: import.meta.env.VITE_API_URL || "https://projectbeta-0tyr.onrender.com/api/v1",
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  timeout: 600000,
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

  /** Reset PIN from admin dashboard — requires the current PIN for verification */
  resetPin: async (newPin: string, currentPin: string): Promise<ApiResponse<null>> => {
    const res = await api.put("/auth/admin/reset-pin", { newPin, currentPin });
    return res.data;
  },
};

// ─── Recovery API ─────────────────────────────────────────────────────────────

export const recoveryApi = {
  // ── PIN Recovery (used by ForgotPinModal on the PIN page) ──────────────────
  /** Step 1: Verify admin username + password → get resetToken */
  verifyAdmin: async (
    username: string,
    password: string
  ): Promise<ApiResponse<{ resetToken: string }>> => {
    const res = await api.post("/recovery/verify-admin", { username, password });
    return res.data;
  },

  /** Step 2: Use resetToken to set a new app PIN (no JWT needed) */
  recoveryResetPin: async (
    newPin: string,
    resetToken: string
  ): Promise<ApiResponse<null>> => {
    const res = await api.post("/recovery/reset-pin", { newPin, resetToken });
    return res.data;
  },

  // ── Admin Credential Recovery (used by AdminLoginPage "Forgot credentials?") ─
  /** Step 1: Verify SECURITY_ANSWER → get credResetToken */
  verifySecurityForAdmin: async (
    answer: string
  ): Promise<ApiResponse<{ credResetToken: string }>> => {
    const res = await api.post("/recovery/verify-security-for-admin", { answer });
    return res.data;
  },

  /** Step 2: Use credResetToken to set a new admin password */
  resetAdminCredentials: async (
    newPassword: string,
    credResetToken: string
  ): Promise<ApiResponse<{ username: string }>> => {
    const res = await api.post("/recovery/reset-admin-creds", { newPassword, credResetToken });
    return res.data;
  },

  // ── Legacy endpoints (kept for backward compat) ────────────────────────────
  verifyQA: async (answer: string): Promise<ApiResponse<{ recoveryToken: string }>> => {
    const res = await api.post("/recovery/verify-qa", { answer });
    return res.data;
  },

  verifyPassword: async (
    password: string,
    recoveryToken: string
  ): Promise<ApiResponse<{ resetToken: string }>> => {
    const res = await api.post("/recovery/verify-password", { password, recoveryToken });
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

// ─── Media API (Direct Cloudinary Upload) ────────────────────────────────────

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  resourceType: "image" | "video";
  transformation?: string;
  eager?: string;
  eager_async?: string;
}

const CHUNK_SIZE = 20 * 1024 * 1024; // 20 MB per chunk

/** Get a signed upload signature from the backend */
const getSignature = async (resourceType: "image" | "video"): Promise<CloudinarySignature> => {
  const res = await api.get("/media/sign", { params: { resourceType } });
  return res.data.data as CloudinarySignature;
};

/** Upload a single file directly to Cloudinary using a signed signature */
const uploadSingleFile = async (
  file: File,
  sig: CloudinarySignature,
  onProgress?: (pct: number) => void
): Promise<MediaItem> => {
  const isVideo = sig.resourceType === "video";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${sig.resourceType}/upload`;

  if (isVideo && file.size > CHUNK_SIZE) {
    // ── Chunked upload for large videos ────────────────────────────────────
    const uniqueId = `echoes-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let lastResult: any = null;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("api_key", sig.api_key);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      if (sig.eager) formData.append("eager", sig.eager);
      if (sig.eager_async) formData.append("eager_async", sig.eager_async);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "X-Unique-Upload-Id": uniqueId,
          "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
        },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            // Weight progress across chunks
            const chunkProgress = (e.loaded / e.total) * (1 / totalChunks);
            const overall = (i / totalChunks + chunkProgress) * 100;
            onProgress(Math.round(overall));
          }
        },
      });
      lastResult = response.data;
    }

    const thumbnailUrl = lastResult.secure_url.replace(
      "/upload/",
      "/upload/so_1,w_400,h_300,c_fill/f_jpg/"
    );

    return {
      publicId: lastResult.public_id,
      url: lastResult.secure_url,
      thumbnail: thumbnailUrl,
      resourceType: "video",
      order: 0,
    };
  } else {
    // ── Single-request upload (images and small videos) ─────────────────────
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.api_key);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);
    if (sig.transformation) formData.append("transformation", sig.transformation);
    if (sig.eager) formData.append("eager", sig.eager);
    if (sig.eager_async) formData.append("eager_async", sig.eager_async);

    const response = await axios.post(uploadUrl, formData, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });

    const result = response.data;
    const isVid = result.resource_type === "video";
    const thumbnailUrl = isVid
      ? result.secure_url.replace("/upload/", "/upload/so_1,w_400,h_300,c_fill/f_jpg/")
      : null;

    return {
      publicId: result.public_id,
      url: result.secure_url,
      thumbnail: thumbnailUrl,
      resourceType: isVid ? "video" : "image",
      order: 0,
    };
  }
};

export const mediaApi = {
  /**
   * Upload files directly to Cloudinary (no Node buffering).
   * Images upload in parallel (up to 3), videos upload sequentially.
   * onProgress receives per-file progress: Record<fileIndex, pct>
   */
  upload: async (
    files: File[],
    onProgress?: (pct: number) => void,
    onFileProgress?: (index: number, pct: number) => void
  ): Promise<ApiResponse<MediaItem[]>> => {
    const results: MediaItem[] = [];
    const images = files.filter((f) => f.type.startsWith("image/"));
    const videos = files.filter((f) => f.type.startsWith("video/"));

    let completedFiles = 0;
    const totalFiles = files.length;

    const trackProgress = (fileIndex: number, pct: number) => {
      if (onFileProgress) onFileProgress(fileIndex, pct);
      // Overall progress = (completed files + current file fraction) / total
      const overall = ((completedFiles + pct / 100) / totalFiles) * 100;
      if (onProgress) onProgress(Math.round(overall));
    };

    // Upload images in parallel batches of 3
    const uploadImage = async (file: File, originalIndex: number): Promise<MediaItem> => {
      const sig = await getSignature("image");
      const item = await uploadSingleFile(file, sig, (pct) => trackProgress(originalIndex, pct));
      completedFiles++;
      return item;
    };

    const imageChunks: Promise<MediaItem>[] = [];
    for (let i = 0; i < images.length; i += 3) {
      const batch = images.slice(i, i + 3);
      const batchResults = await Promise.all(
        batch.map((img, bIdx) => uploadImage(img, files.indexOf(img)))
      );
      imageChunks.push(...batchResults.map((r) => Promise.resolve(r)));
    }
    results.push(...(await Promise.all(imageChunks)));

    // Upload videos sequentially (chunked)
    for (const video of videos) {
      const originalIndex = files.indexOf(video);
      const sig = await getSignature("video");
      const item = await uploadSingleFile(video, sig, (pct) => trackProgress(originalIndex, pct));
      completedFiles++;
      results.push(item);
    }

    // Restore order to match original file order
    const ordered = files.map((f) => {
      if (f.type.startsWith("image/")) {
        return results.find((r) => r.resourceType === "image" && results.indexOf(r) < images.length);
      }
      return results.find((r) => r.resourceType === "video");
    }).filter(Boolean) as MediaItem[];

    // Simpler: just set order by position in results
    const finalItems = results.map((item, idx) => ({ ...item, order: idx }));

    return {
      success: true,
      message: `${finalItems.length} file(s) uploaded successfully.`,
      data: finalItems,
    };
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
