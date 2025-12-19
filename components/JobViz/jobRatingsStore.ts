import { useSyncExternalStore } from "react";

export type JobRatingValue = "love" | "like" | "dislike";
export type JobRatingsMap = Record<string, JobRatingValue>;

const STORAGE_KEY = "jobvizRatings";

let ratingsStore: JobRatingsMap = {};
let isHydrated = false;

const loadFromStorage = () => {
  if (isHydrated || typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        ratingsStore = parsed as JobRatingsMap;
      }
    }
  } catch (error) {
    console.error("Failed to parse JobViz ratings", error);
  }
  isHydrated = true;
};

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ratingsStore));
  } catch (error) {
    console.error("Failed to persist JobViz ratings", error);
  }
};

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => {
  if (typeof window !== "undefined") {
    loadFromStorage();
  }
  return ratingsStore;
};

export const ratingOptions: Array<{ value: JobRatingValue; label: string; emoji: string }> = [
  { value: "love", label: "Love", emoji: "💜" },
  { value: "like", label: "Like", emoji: "👍" },
  { value: "dislike", label: "Not for me", emoji: "👎" },
];

export const useJobRatings = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setRating = (socCode: string, rating: JobRatingValue | null) => {
    if (!socCode) return;
    loadFromStorage();
    ratingsStore = { ...ratingsStore };
    if (rating) {
      ratingsStore[socCode] = rating;
    } else {
      delete ratingsStore[socCode];
    }
    persist();
    notify();
  };

  const clearRatings = () => {
    ratingsStore = {};
    persist();
    notify();
  };

  return {
    ratings: snapshot,
    setRating,
    clearRatings,
  };
};

export const ratingEmoji = (rating?: JobRatingValue | null) => {
  if (!rating) return "?";
  const option = ratingOptions.find((o) => o.value === rating);
  return option?.emoji ?? "?";
};

export const countRatings = (
  socCodes?: string[] | null,
  map: JobRatingsMap = ratingsStore
) => {
  if (!socCodes || socCodes.length === 0) {
    return { rated: 0, total: 0 };
  }
  loadFromStorage();
  let rated = 0;
  for (const soc of socCodes) {
    if (soc && map[soc]) rated += 1;
  }
  return { rated, total: socCodes.length };
};
