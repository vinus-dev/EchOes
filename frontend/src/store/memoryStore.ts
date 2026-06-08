import { create } from "zustand";
import type { Memory, MemoryState } from "../types";

export const useMemoryStore = create<MemoryState>()((set) => ({
  currentMemory: null,
  isSearching: false,
  searchError: null,

  setMemory: (memory: Memory | null) => set({ currentMemory: memory }),
  setSearching: (v: boolean) => set({ isSearching: v }),
  setSearchError: (err: string | null) => set({ searchError: err }),
}));
