import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { memoryApi, mediaApi } from "../services/api";
import type { Memory, MemoryFormData, MediaItem, DashboardStats } from "../types";

export const useAdmin = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMemories = useCallback(
    async (params?: { page?: number; search?: string; type?: string }) => {
      setIsLoading(true);
      try {
        const res = await memoryApi.getAll(params);
        setMemories(res.data ?? []);
        setPagination({
          page: res.pagination.page,
          pages: res.pagination.pages,
          total: res.pagination.total,
        });
      } catch {
        toast.error("Failed to load memories");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await memoryApi.getStats();
      if (res.success && res.data) setStats(res.data);
    } catch {
      toast.error("Failed to load stats");
    }
  }, []);

  const uploadMedia = useCallback(async (files: File[]): Promise<MediaItem[]> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const res = await mediaApi.upload(files, setUploadProgress);
      if (res.success && res.data) {
        toast.success(`${res.data.length} file(s) uploaded! ✅`);
        return res.data;
      }
      return [];
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const createMemory = useCallback(
    async (data: Partial<MemoryFormData>): Promise<boolean> => {
      setIsLoading(true);
      try {
        const res = await memoryApi.create(data);
        if (res.success) {
          toast.success("Memory created! 🎉");
          return true;
        }
        return false;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to create memory");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateMemory = useCallback(
    async (id: string, data: Partial<MemoryFormData>): Promise<boolean> => {
      setIsLoading(true);
      try {
        const res = await memoryApi.update(id, data);
        if (res.success) {
          toast.success("Memory updated! ✏️");
          setMemories((prev) =>
            prev.map((m) => (m._id === id && res.data ? res.data : m))
          );
          return true;
        }
        return false;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteMemory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await memoryApi.delete(id);
      if (res.success) {
        toast.success("Memory deleted 🗑️");
        setMemories((prev) => prev.filter((m) => m._id !== id));
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
      return false;
    }
  }, []);

  const deleteMedia = useCallback(
    async (publicId: string, resourceType: "image" | "video" = "image") => {
      try {
        await mediaApi.delete(publicId, resourceType);
        toast.success("Media removed from Cloudinary");
      } catch {
        toast.error("Failed to remove media from Cloudinary");
      }
    },
    []
  );

  return {
    memories,
    stats,
    isLoading,
    pagination,
    isUploading,
    uploadProgress,
    fetchMemories,
    fetchStats,
    uploadMedia,
    createMemory,
    updateMemory,
    deleteMemory,
    deleteMedia,
  };
};
