import { useSyncExternalStore, useCallback, useState } from 'react';

class StorageManager {
  constructor() {
    this.cache = {};
    this.listeners = new Set();
    this.timeouts = {};
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (let listener of this.listeners) {
      listener();
    }
  }

  init(namespace) {
    if (!this.cache[namespace]) {
      try {
        const stored = window.localStorage.getItem(`sh_${namespace}_master`);
        if (stored) {
          this.cache[namespace] = JSON.parse(stored);
        } else {
          // Migration from old flat state
          const oldState = window.localStorage.getItem(`sh_${namespace}`);
          this.cache[namespace] = {
            activeProfile: 'Default',
            profiles: ['Default'],
            data: {
              Default: oldState ? JSON.parse(oldState) : {}
            }
          };
        }
      } catch (e) {
        this.cache[namespace] = { activeProfile: 'Default', profiles: ['Default'], data: { Default: {} } };
      }
    }
  }

  save(namespace) {
    if (this.timeouts[namespace]) clearTimeout(this.timeouts[namespace]);
    this.timeouts[namespace] = setTimeout(() => {
      try {
        window.localStorage.setItem(`sh_${namespace}_master`, JSON.stringify(this.cache[namespace]));
      } catch (error) {
        console.warn(`Error setting localStorage for ${namespace}`, error);
      }
    }, 500);
  }

  get(namespace, key, initialValue) {
    this.init(namespace);
    const state = this.cache[namespace];
    const val = state.data[state.activeProfile]?.[key];
    return val !== undefined ? val : initialValue;
  }

  set(namespace, key, value) {
    this.init(namespace);
    const state = this.cache[namespace];
    const newData = {
      ...state.data,
      [state.activeProfile]: {
        ...(state.data[state.activeProfile] || {}),
        [key]: value
      }
    };
    this.cache[namespace] = { ...state, data: newData };
    this.save(namespace);
    this.notify();
  }

  getProfiles(namespace) {
    this.init(namespace);
    return this.cache[namespace];
  }

  switchProfile(namespace, profileName) {
    this.init(namespace);
    const state = this.cache[namespace];
    if (!state.profiles.includes(profileName)) return;
    this.cache[namespace] = { ...state, activeProfile: profileName };
    this.save(namespace);
    this.notify();
  }

  createProfile(namespace, profileName) {
    this.init(namespace);
    const state = this.cache[namespace];
    if (state.profiles.includes(profileName)) return;

    // Start by cloning the current profile's data
    const newData = {
      ...state.data,
      [profileName]: { ...(state.data[state.activeProfile] || {}) }
    };

    this.cache[namespace] = {
      ...state,
      profiles: [...state.profiles, profileName],
      data: newData,
      activeProfile: profileName
    };
    this.save(namespace);
    this.notify();
  }

  deleteProfile(namespace, profileName) {
    this.init(namespace);
    const state = this.cache[namespace];
    if (state.profiles.length <= 1) return; // Cannot delete last profile

    const newProfiles = state.profiles.filter((p) => p !== profileName);
    const newData = { ...state.data };
    delete newData[profileName];

    let newActive = state.activeProfile;
    if (state.activeProfile === profileName) {
      newActive = newProfiles[0];
    }

    this.cache[namespace] = {
      ...state,
      profiles: newProfiles,
      data: newData,
      activeProfile: newActive
    };
    this.save(namespace);
    this.notify();
  }

  reset(namespace) {
    this.init(namespace);
    const state = this.cache[namespace];
    const currentData = state.data[state.activeProfile] || {};
    const profileData = {};

    // Preserve derived output values so they don't reset to 0/empty on state reset
    // when inputs are already at default values.
    const keysToPreserve = ['results', 'schedule'];
    for (const key of keysToPreserve) {
      if (currentData[key] !== undefined) {
        profileData[key] = currentData[key];
      }
    }

    const newData = {
      ...state.data,
      [state.activeProfile]: profileData
    };
    this.cache[namespace] = { ...state, data: newData };
    this.save(namespace);
    this.notify();
  }
}

const store = new StorageManager();

export function usePersistedState(namespace, key, initialValue) {
  // Memoize initialValue so it doesn't change on every render, preventing infinite loops in useSyncExternalStore
  const [stableInitialValue] = useState(() => initialValue);

  const value = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.get(namespace, key, stableInitialValue)
  );

  const setValue = useCallback(
    (newValue) => {
      // If it's a function update, we read from the store synchronously to apply it
      const currentValue = store.get(namespace, key, stableInitialValue);
      const valueToStore = newValue instanceof Function ? newValue(currentValue) : newValue;
      store.set(namespace, key, valueToStore);
    },
    [namespace, key, stableInitialValue]
  );

  return [value, setValue];
}

export function useProfiles(namespace) {
  const state = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getProfiles(namespace)
  );

  // Return stable functions so they don't break dependencies
  const switchProfile = useCallback((name) => store.switchProfile(namespace, name), [namespace]);
  const createProfile = useCallback((name) => store.createProfile(namespace, name), [namespace]);
  const deleteProfile = useCallback((name) => store.deleteProfile(namespace, name), [namespace]);

  return {
    activeProfile: state.activeProfile,
    profiles: state.profiles,
    switchProfile,
    createProfile,
    deleteProfile
  };
}

export function resetPersistedState(namespace) {
  store.reset(namespace);
}
