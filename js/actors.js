/**
 * MAIN.JS - Game Controller
 * Organized by: Imports, State/Config, Graph Data, Utilities, Scene Logic, Input/Movement, Rendering
 */

// ======================================================
// 1. IMPORTS
// ======================================================
import { Player } from "./player.js";
import { Troop } from "./troop.js";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEBUG,
  NODE_DEBUG,
  HAT_TRICK_WINDOW,
  HAT_TRICK_COUNT,
  HAT_TRICK_BONUS,
  SWIPE_THRESHOLD,
  HOME_NODE,
  BANANA_NODE_IDS,
  MUTE_BUTTON
} from "./config.js";
import {
  createInitialState,
  createKeysState,
  createInputState,
  setQueuedDirection,
  clearQueuedDirection
} from "./state.js";
import {
  createBackgroundImage,
  loadSprites,
  loadSounds,
  applyMuteState,
  stopAllMusic,
  playSceneMusic,
  playMusicOnce
} from "./assets.js";

// ======================================================
// 2. INITIALIZATION & GLOBAL STATE
// ======================================================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const keys = createKeysState();
const state = createInitialState();
const inputState = createInputState();

const spriteStore = loadSprites();
const sounds = loadSounds(state);
const backgroundImage = createBackgroundImage();

state.mode = "start";
state.cardBackground = spriteStore.gameStartCard;

const muteButton = { ...MUTE_BUTTON };

// Window proxies for global input accessibility
Object.defineProperties(window, {
  queuedDirection: {
    get: () => inputState.queuedDirection,
    set: (v) => inputState.queuedDirection = v
  },
  queuedDirectionName: {
    get: () => inputState.queuedDirectionName,
    set: (v) => inputState.queuedDirectionName = v
  },
  touchStart: {
    get: () => inputState.touchStart,
    set: (v) => inputState.touchStart = v
  },
  swipeHandled: {
    get: () => inputState.swipeHandled,
    set: (v) => inputState.swipeHandled = v
  },
  musicStarted: {
    get: () => inputState.musicStarted,
    set: (v) => inputState.musicStarted = v
  }
});

// ======================================================
// 3. NODE GRAPHS & GAME DATA
// ======================================================

// Main Gameplay Nodes
const nodes = {
  A: { id: "A", x: 870, y: 230, neighbors: ["G", "AS1"], inputMap: { left: "AS1", down: "G" }, stopHere: true },
  B: { id: "B", x: 85, y: 230, neighbors: ["S", "C"], ladderExit: true },
  C: { id: "C", x: 85, y: 530, neighbors: ["B", "CR1", "H"], ladderExit: true },
  D: { id: "D", x: 360, y: 530, neighbors: ["CR1", "E"] },
  E: { id: "E", x: 500, y: 645, neighbors: ["D", "F", "G", "SE2"], inputMap: { up: "SE2", left: "D", right: "G", down: "F" } },
  F: { id: "F", x: 600, y: 720, neighbors: ["E", "CB1", "FK1"], inputMap: { up: "E", left: "E", right: "CB1", down: "FK1" } },
  G: { id: "G", x: 715, y: 440, neighbors: ["A", "E", "O"] },
  H: { id: "H", x: 85, y: 820, neighbors: ["I", "C", "CY1"], ladderExit: true },
  I: { id: "I", x: 85, y: 1220, neighbors: ["H", "R", "CB3"], ladderExit: true },
  J: { id: "J", x: 400, y: 820, neighbors: ["K", "CY1"] },
  K: { id: "K", x: 550, y: 990, neighbors: ["J", "M", "L", "FK2"], inputMap: { up: "FK3", down: "L", left: "J", right: "M" }, stopHere: true },
  L: { id: "L", x: 710, y: 1110, neighbors: ["K", "M", "P", "CR3"], inputMap: { up: "M", left: "K", right: "CR3", down: "P" }, ladderExit: true },
  M: { id: "M", x: 710, y: 850, neighbors: ["K", "MN1", "L"], ladderExit: true },
  N: { id: "N", x: 955, y: 720, neighbors: ["O", "CB1", "MN1"], ladderExit: true },
  O: { id: "O", x: 955, y: 440, neighbors: ["G", "N"], ladderExit: true },
  P: { id: "P", x: 530, y: 1220, neighbors: ["CB3", "L", "Q"], ladderExit: true },
  Q: { id: "Q", x: 530, y: 1450, neighbors: ["P", "CY3"], ladderExit: true },
  R: { id: "R", x: 85, y: 1450, neighbors: ["I", "CY3"] },
  S: { id: "S", x: 460, y: 230, neighbors: ["B", "AS2", "SE1"], inputMap: { left: "B", right: "AS2", down: "SE1" }, ropePassThrough: true },
  // ... Special path nodes (CR, CB, CY, AS, SE, FK) omitted for brevity but remain in the set
};

// Boss Mode Nodes
const bossNodes = {
  START: { id: "START", x: 170, y: 1310, neighbors: ["L1D"] },
  L1D: { id: "L1D", x: 340, y: 1290, neighbors: ["START", "S1D", "L1U"], ladderExit: true },
  L1U: { id: "L1U", x: 345, y: 965, neighbors: ["L1D", "L6D", "L3D"], ladderExit: true },
  L3D: { id: "L3D", x: 500, y: 985, neighbors: ["L1U", "L3U", "M0", "SC2"], inputMap: { up: "L3U", left: "L1U", right: "M0", DOWN: "SC2" }, ladderExit: true },
  TOP: { id: "TOP", x: 340, y: 0, neighbors: [] },
  GOAL: { id: "GOAL", x: 340, y: 300, neighbors: ["L5D"] },
  // ... Additional boss level nodes
};

const chillNodes = {
  CS: { id: "CS", x: 300, y: 1180, neighbors: ["CE"], surface: "ice" },
  CE: { id: "CE", x: 760, y: 1180, neighbors: ["CS", "CN"], surface: "ice" },
  CG: { id: "CG", x: 520, y: 540, neighbors: ["CW"], stopHere: true, surface: "ice" }
};

const portals = { CB2: "CR2", CB4: "CY4", CR2: "CB2", CR4: "CY2", CY2: "CR4", CY4: "CB4" };
const bossConfig = {
  startNode: "START",
  goalNode: "GOAL",
  motherStartNode: "L2D",
  roamingTroopStartNodes: ["R1T", "L4U"],
  coconutThrowerNode: "TOP",
  bananaNodes: ["R1T", "L3D", "L2D", "R2T", "L5D"]
};

// ======================================================
// 4. MATH & UTILITY HELPERS
// ======================================================
const rand = (min, max) => Math.random() * (max - min) + min;
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function getNearestNodeId(x, y, nodeMap, maxDist = 40) {
  let bestId = null, bestDist = Infinity;
  for (const id in nodeMap) {
    const d = Math.hypot(x - nodeMap[id].x, y - nodeMap[id].y);
    if (d < bestDist) { bestDist = d; bestId = id; }
  }
  return bestDist <= maxDist ? bestId : null;
}

// ======================================================
// 5. GAME STATE & SCENE MANAGEMENT
// ======================================================
function getCurrentNodeMap() {
  if (state.scene === "boss") return bossNodes;
  if (state.scene === "chill") return chillNodes;
  return nodes;
}

function startMainScene() {
  state.mode = "playing";
  state.scene = "main";
  state.cardBackground = backgroundImage;
  Object.assign(state, {
    hearts: [], fieldHearts: [], flyingHearts: [], particles: [],
    sceneWinAwarded: false, bananasCollectedThisScene: 0
  });
  resetActors();
  applyLevelConfig();
  resetScene();
  playSceneMusic({ sounds, isBossScene: false });
}

function startBossMode() {
  state.scene = "boss";
  state.mode = "playing";
  state.cardBackground = spriteStore.ckBackground;
  // Initialization for boss entities and player position
  if (!state.player) state.player = new Player(bossConfig.startNode, sharedDeps);
  const start = bossNodes[bossConfig.startNode];
  state.player.currentNode = bossConfig.startNode;
  state.player.x = start.x;
  state.player.y = start.y;
  spawnBossRoamers();
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  applyMuteState(sounds, state);
}

// ======================================================
// 6. MOVEMENT & INPUT LOGIC
// ======================================================
function getBestNeighbor(currentNodeId, inputVec, inputName) {
  const nodeMap = getCurrentNodeMap();
  const current = nodeMap[currentNodeId];
  if (!current) return null;

  if (inputName && current.inputMap?.[inputName]) {
    const forced = current.inputMap[inputName];
    if (current.neighbors.includes(forced)) return forced;
  }

  if (!inputVec) return null;

  let bestNeighbor = null, bestScore = -Infinity;
  for (const neighborId of current.neighbors) {
    const n = nodeMap[neighborId];
    const dx = n.x - current.x, dy = n.y - current.y;
    const len = Math.hypot(dx, dy);
    if (!len) continue;
    const score = (dx / len) * inputVec.x + (dy / len) * inputVec.y;
    if (score > bestScore) { bestScore = score; bestNeighbor = neighborId; }
  }
  return bestNeighbor;
}

function tryConsumeQueuedTurn(actor) {
  if (!window.queuedDirection || !window.queuedDirectionName) return false;
  const nextId = getBestNeighbor(actor.currentNode, window.queuedDirection, window.queuedDirectionName);
  if (!nextId) return false;
  actor.targetNode = nextId;
  window.queuedDirection = null;
  window.queuedDirectionName = null;
  return true;
}

// ======================================================
// 7. RENDERING & UI OVERLAYS
// ======================================================
function drawNodeDebugOverlay(nodeMap) {
  if (!NODE_DEBUG) return;
  ctx.save();
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  for (const id in nodeMap) {
    const n = nodeMap[id];
    ctx.fillStyle = n.ladderExit ? "#ffd54a" : (n.ropePassThrough ? "#7dd3fc" : "#ffffff");
    ctx.beginPath();
    ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeText(id, n.x, n.y - 18);
    ctx.fillText(id, n.x, n.y - 18);
  }
  ctx.restore();
}

function drawLevelIntroOverlay() {
  if (!state.levelIntro) return;
  const li = state.levelIntro;
  const alpha = Math.min(li.time / 0.2, 1) * (li.time > li.duration - 0.4 ? (li.duration - li.time) / 0.4 : 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(state.loadScreenImage || backgroundImage, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Text rendering for Level Intro
  ctx.restore();
}

// ... Compatibility and legacy functions
function setQueuedDirectionCompat(x, y, name) {
  setQueuedDirection(inputState, x, y, name);
}

// ======================================================
// 8. CORE GAME LOOP
// ======================================================
function loop(ts) {
  try {
    const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
    state.lastTime = ts;
    update(dt || 0);
    draw();
    requestAnimationFrame(loop);
  } catch (e) {
    console.error("Game Loop Error:", e);
  }
}