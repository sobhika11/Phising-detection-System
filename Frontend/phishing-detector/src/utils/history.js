export const HISTORY_KEY = 'phishguard_scans';

export function loadScanHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to load history from local storage", err);
    return [];
  }
}

export function saveScanToHistory(scan) {
  try {
    const history = loadScanHistory();
    // Add new scan at the beginning, keeping a max of 10 items
    const newHistory = [scan, ...history].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (err) {
    console.error("Failed to save scan to local storage", err);
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error("Failed to clear local storage", err);
  }
}
