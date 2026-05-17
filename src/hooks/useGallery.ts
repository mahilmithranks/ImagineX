/**
 * useGallery.ts — Hook for fetching and managing the gallery list.
 *
 * Responsibilities:
 *   - Fetch GET /api/gallery
 *   - Expose addGeneration (optimistic prepend) and removeGeneration
 *   - Handle loading and error states
 *
 * Does NOT: know about rendering, routing, or image generation.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Generation } from "@/types/generation";

interface GalleryState {
  generations: Generation[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export function useGallery() {
  const [state, setState] = useState<GalleryState>({
    generations: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const fetchGallery = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to load gallery");

      const { generations, total } = await res.json();
      setState({ generations, total, isLoading: false, error: null });
    } catch {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Could not load gallery. Please refresh.",
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  /** Optimistically prepend a new generation without re-fetching */
  const addGeneration = useCallback((generation: Generation) => {
    setState((s) => ({
      ...s,
      generations: [generation, ...s.generations],
      total: s.total + 1,
    }));
  }, []);

  /** Remove a generation optimistically, then confirm via API */
  const removeGeneration = useCallback(async (id: string) => {
    // Optimistic remove
    setState((s) => ({
      ...s,
      generations: s.generations.filter((g) => g.id !== id),
      total: Math.max(s.total - 1, 0),
    }));

    try {
      await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    } catch {
      // Silently re-fetch to restore state on failure
      fetchGallery();
    }
  }, [fetchGallery]);

  return { ...state, refresh: fetchGallery, addGeneration, removeGeneration };
}
