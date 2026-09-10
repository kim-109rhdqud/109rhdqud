const PREFIX = "trendbook:";

export function loadStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStored(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* localStorage 접근 불가 환경(프라이빗 모드 등)에서는 조용히 무시 */
  }
}
