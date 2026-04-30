export function readJsonStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJsonStorage<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeStorage(key: string): void {
  window.localStorage.removeItem(key)
}

