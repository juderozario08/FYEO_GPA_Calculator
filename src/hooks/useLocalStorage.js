import { useState, useEffect } from 'react';

const resolve = (v) => (typeof v === 'function' ? v() : v);

function readStored(key, initialValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return resolve(initialValue);
    const parsed = JSON.parse(stored);
    // Guard against old or hand-edited data with the wrong shape.
    const fallback = resolve(initialValue);
    if (Array.isArray(fallback) !== Array.isArray(parsed)) return fallback;
    if (typeof fallback !== typeof parsed) return fallback;
    return parsed;
  } catch {
    // Corrupt JSON or storage blocked (private mode): start fresh instead of crashing.
    return resolve(initialValue);
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStored(key, initialValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable; the calculator still works for this visit.
    }
  }, [key, value]);

  return [value, setValue];
}
