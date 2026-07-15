import { useState, useCallback } from 'react';

// Central storage manager to prevent heavy I/O
class StorageManager {
  constructor() {
    this.cache = {}; // In-memory cache of parsed JSON
    this.timeouts = {}; // Debounce timeouts
  }

  // Read once from localStorage and populate cache
  init(namespace) {
    if (!this.cache[namespace]) {
      try {
        const stored = window.localStorage.getItem(`sh_${namespace}`);
        this.cache[namespace] = stored ? JSON.parse(stored) : {};
      } catch (error) {
        console.warn(`Error reading localStorage for ${namespace}`, error);
        this.cache[namespace] = {};
      }
    }
  }

  get(namespace, key, initialValue) {
    this.init(namespace);
    if (this.cache[namespace][key] !== undefined) {
      return this.cache[namespace][key];
    }
    return initialValue;
  }

  set(namespace, key, value) {
    this.init(namespace);
    this.cache[namespace][key] = value;

    // Debounce the physical write to localStorage by 500ms
    if (this.timeouts[namespace]) {
      clearTimeout(this.timeouts[namespace]);
    }

    this.timeouts[namespace] = setTimeout(() => {
      try {
        window.localStorage.setItem(`sh_${namespace}`, JSON.stringify(this.cache[namespace]));
      } catch (error) {
        console.warn(`Error setting localStorage for ${namespace}`, error);
      }
    }, 500);
  }

  reset(namespace) {
    if (this.timeouts[namespace]) {
      clearTimeout(this.timeouts[namespace]);
    }
    this.cache[namespace] = {};
    window.localStorage.removeItem(`sh_${namespace}`);
  }
}

const store = new StorageManager();

export function usePersistedState(namespace, key, initialValue) {
  // Pass a function to useState so store.get is only called on initial mount
  const [value, setValue] = useState(() => store.get(namespace, key, initialValue));

  const setPersistedValue = useCallback(
    (newValue) => {
      setValue((prev) => {
        // Handle functional updates (e.g., setCounter(c => c + 1))
        const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
        store.set(namespace, key, valueToStore);
        return valueToStore;
      });
    },
    [namespace, key]
  );

  return [value, setPersistedValue];
}

export function resetPersistedState(namespace) {
  store.reset(namespace);
}
