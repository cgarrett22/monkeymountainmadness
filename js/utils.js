// utils.js

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getNearestNodeId(x, y, nodeMap, maxDist = 40) {
  let bestId = null;
  let bestDist = Infinity;

  for (const id in nodeMap) {
    const n = nodeMap[id];
    const d = Math.hypot(x - n.x, y - n.y);
    if (d < bestDist) {
      bestDist = d;
      bestId = id;
    }
  }

  return bestDist <= maxDist ? bestId : null;
}

export function getNodeIdsByTag(nodeMap, tag) {
    return Object.values(nodeMap)
        .filter(node => Array.isArray(node.tags) && node.tags.includes(tag))
        .map(node => node.id);
}
