import { NODE_DEBUG } from "./config.js";

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

export function drawPathOverlay(ctx, nodeMap) {
  if (!NODE_DEBUG) return;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
  ctx.lineWidth = 4;

  const drawn = new Set();

  for (const id in nodeMap) {
    const node = nodeMap[id];

    for (const neighborId of node.neighbors) {
      const neighbor = nodeMap[neighborId];
      if (!neighbor) continue;

      const key = [id, neighborId].sort().join("|");
      if (drawn.has(key)) continue;

      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(neighbor.x, neighbor.y);
      ctx.stroke();

      drawn.add(key);
    }
  }

  ctx.restore();
}