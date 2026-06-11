const memoryStorage = new Map<string, string>();

function hasLocalStorage() {
  return typeof localStorage !== "undefined";
}

export const storage = {
  async getItem(key: string) {
    if (hasLocalStorage()) {
      return localStorage.getItem(key);
    }
    return memoryStorage.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    if (hasLocalStorage()) {
      localStorage.setItem(key, value);
      return;
    }
    memoryStorage.set(key, value);
  },
  async removeItem(key: string) {
    if (hasLocalStorage()) {
      localStorage.removeItem(key);
      return;
    }
    memoryStorage.delete(key);
  },
  async clear() {
    if (hasLocalStorage()) {
      localStorage.clear();
      return;
    }
    memoryStorage.clear();
  },
};
