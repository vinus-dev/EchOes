import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { memoryApi } from "../services/api";
import { useMemoryStore } from "../store/memoryStore";

export const useMemory = () => {
  const navigate = useNavigate();
  const { setMemory, setSearching, setSearchError, currentMemory, isSearching, searchError } =
    useMemoryStore();

  const searchMemory = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setSearching(true);
      setSearchError(null);

      try {
        const res = await memoryApi.search(query.trim());
        if (res.success && res.data) {
          setMemory(res.data);
          navigate("/memory");
        }
      } catch (err: any) {
        const msg =
          err.response?.status === 404
            ? "No memory found for this. Try a different number? 🤔"
            : err.response?.data?.message || "Something went wrong. Try again!";
        setSearchError(msg);
        toast.error(msg, { duration: 3000 });
      } finally {
        setSearching(false);
      }
    },
    [navigate, setMemory, setSearching, setSearchError]
  );

  const clearMemory = useCallback(() => {
    setMemory(null);
    setSearchError(null);
  }, [setMemory, setSearchError]);

  return {
    currentMemory,
    isSearching,
    searchError,
    searchMemory,
    clearMemory,
  };
};
