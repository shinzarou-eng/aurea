import { MarketingSession } from "../types";

export interface SessionHistoryEntry {
  id: string;
  appName: string;
  createdAt: number;
  session: MarketingSession;
}

const STORAGE_KEY = "app_marketing_session_history";
const MAX_ENTRIES = 10;

export function loadSessionHistory(): SessionHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionToHistory(
  session: MarketingSession,
  appName: string
): SessionHistoryEntry[] {
  const entries = loadSessionHistory();
  const name =
    session.appOverview?.detectedName || appName || "Application sans nom";
  const entry: SessionHistoryEntry = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    appName: name,
    createdAt: Date.now(),
    session,
  };
  // Avoid duplicate consecutive saves of the exact same session
  const next = [entry, ...entries].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage quota exceeded: drop oldest entries and retry once
    try {
      const trimmed = next.slice(0, 3);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return trimmed;
    } catch {
      return next;
    }
  }
  return next;
}

export function deleteSessionFromHistory(id: string): SessionHistoryEntry[] {
  const next = loadSessionHistory().filter((e) => e.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function clearSessionHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function exportSessionAsJson(entry: SessionHistoryEntry) {
  const blob = new Blob([JSON.stringify(entry, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `session-${entry.appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${new Date(entry.createdAt)
    .toISOString()
    .slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
