// debug-utils.js

export function safeDebugString(value) {
  try {
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

export function debugLog(state, message, data = null) {
  const ts = (performance.now() / 1000).toFixed(2);
  const line =
    data == null
      ? `[${ts}] ${message}`
      : `[${ts}] ${message} ${safeDebugString(data)}`;

  state.debugLogs.push(line);

  if (state.debugLogs.length > 14) {
    state.debugLogs.shift();
  }
}

export async function copyDebugLogsToClipboard(state) {
  const text = (state.debugLogs || []).join("\n");

  if (!text.trim()) {
    debugLog(state, "[DEBUG] copy skipped - no logs");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    debugLog(state, "[DEBUG] logs copied to clipboard");
  } catch (err) {
    debugLog(state, "[DEBUG] clipboard copy failed", err?.message || String(err));
  }
}

export function clearDebugLogs(state) {
  state.debugLogs = [];
  debugLog(state, "[DEBUG] logs cleared");
}