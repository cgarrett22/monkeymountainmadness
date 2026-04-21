// leaderboard.js

const LEADERBOARD_KEY = "mmm_acceptance_top5";

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return getDefaultLeaderboard();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getDefaultLeaderboard();

    return parsed
      .filter(e => e && typeof e.initials === "string" && typeof e.score === "number")
      .slice(0, 5);
  } catch {
    return getDefaultLeaderboard();
  }
}

export function saveLeaderboard(entries) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 5)));
  } catch {
    // fail silently for now
  }
}

export function getDefaultLeaderboard() {
  return [
    { initials: "AAA", score: 300 },
    { initials: "BBB", score: 250 },
    { initials: "CCC", score: 200 },
    { initials: "DDD", score: 150 },
    { initials: "EEE", score: 100 }
  ];
}

export function isHighScore(score, entries) {
  if (!entries?.length) return true;
  if (entries.length < 5) return true;
  return score > entries[entries.length - 1].score;
}

export function normalizeInitials(value) {
  return (value || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);
}

export function insertHighScore(entries, initials, score) {
  const next = [...(entries || [])];
  next.push({
    initials: normalizeInitials(initials).padEnd(3, "A"),
    score
  });

  next.sort((a, b) => b.score - a.score);
  return next.slice(0, 5);
}