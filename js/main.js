// main.js

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEBUG,
  NODE_DEBUG,
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

// keep compatibility with the rest of the existing file for now
function drawStartCard(ctx) {
  if (!state.cardBackground) return;

  ctx.drawImage(
    state.cardBackground,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function setQueuedDirectionCompat(x, y, name) {
  setQueuedDirection(inputState, x, y, name);
}

function clearQueuedDirectionCompat() {
  clearQueuedDirection(inputState);
}

Object.defineProperties(window, {
  queuedDirection: {
    get: () => inputState.queuedDirection,
    set: (value) => {
      inputState.queuedDirection = value;
    }
  },
  queuedDirectionName: {
    get: () => inputState.queuedDirectionName,
    set: (value) => {
      inputState.queuedDirectionName = value;
    }
  },
  touchStart: {
    get: () => inputState.touchStart,
    set: (value) => {
      inputState.touchStart = value;
    }
  },
  swipeHandled: {
    get: () => inputState.swipeHandled,
    set: (value) => {
      inputState.swipeHandled = value;
    }
  },
  musicStarted: {
    get: () => inputState.musicStarted,
    set: (value) => {
      inputState.musicStarted = value;
    }
  }
});

// ======================================================
// NODE GRAPH
// ======================================================

const nodes = {
  A:   { id: "A",   x: 870, y: 230,  neighbors: ["G", "AS1"], inputMap: {left: "AS1", down: "G" }, stopHere: true },
  B: { id: "B", x: 85, y: 230, neighbors: ["S", "C"], ladderExit: true },


  C: { id: "C", x: 85, y: 530, neighbors: ["B", "CR1", "H"], ladderExit: true },
  D:   { id: "D",   x: 360, y: 530,  neighbors: ["CR1", "E"] },

  E:   { id: "E",   x: 500, y: 645,  neighbors: ["D", "F", "G", "SE2"], inputMap: { up: "SE2", left: "D", right: "G", down: "F" }},
  FK1:   { id: "FK1",   x: 585, y: 800,  neighbors: ["F", "FK2"], inputMap: { up: "F", down: "FK2" }, ropePassThrough: true },
  FK2:   { id: "FK2",   x: 610, y: 860,  neighbors: ["FK1", "FK3"], inputMap: { up: "FK1", down: "FK3" }, ropePassThrough: true },
  FK3:   { id: "FK3",   x: 570, y: 940,  neighbors: ["FK2", "K"], inputMap: { up: "FK2", down: "K" }, ropePassThrough: true },
  F:   { id: "F",   x: 600, y: 720,  neighbors: ["E", "CB1", "FK1"], inputMap: { up: "E", left: "E", right: "CB1", down: "FK1" } },

  G:   { id: "G",   x: 715,  y: 440,  neighbors: ["A", "E", "O"] },
  O: { id: "O", x: 955, y: 440, neighbors: ["G", "N"], ladderExit: true },


  H: { id: "H", x: 85, y: 820, neighbors: ["I", "C", "CY1"], ladderExit: true },
  I: { id: "I", x: 85, y: 1220, neighbors: ["H", "R", "CB3"], ladderExit: true },

  J:   { id: "J",   x: 400, y: 820,  neighbors: ["K", "CY1"] },
  K:   { id: "K",   x: 550, y: 990,  neighbors: ["J", "M", "L", "FK2"], inputMap: { up: "FK3", down: "L", left: "J", right: "M" }, stopHere: true},

  L: { id: "L", x: 710, y: 1110, neighbors: ["K", "M", "P", "CR3"], inputMap: { up: "M", left: "K", right: "CR3", down: "P" }, ladderExit: true },
  M: { id: "M", x: 710, y: 850, neighbors: ["K", "MN1", "L"], ladderExit: true },
  MN1: { id: "MN1", x: 830, y: 750, neighbors: ["M", "N"], inputMap: { left: "M", right: "N" }, ropePassThrough: true },
  N: { id: "N", x: 955, y: 720, neighbors: ["O", "CB1", "MN1"], ladderExit: true },

  P: { id: "P", x: 530, y: 1220, neighbors: ["CB3", "L", "Q"], ladderExit: true },
  Q: { id: "Q", x: 530, y: 1450, neighbors: ["P", "CY3"], ladderExit: true },
  R:   { id: "R",   x: 85, y: 1450, neighbors: ["I", "CY3"] },
  S:   { id: "S",   x: 460, y: 230,  neighbors: ["B", "AS2", "SE1"], inputMap: { left: "B", right: "AS2", down: "SE1" }, ropePassThrough: true },
  AS1:   { id: "AS1",   x: 760, y: 230,  neighbors: ["A", "AS2"], inputMap: { left: "AS2", right: "A" }, ropePassThrough: true },
  AS2:   { id: "AS2",   x: 640, y: 275,  neighbors: ["S", "AS1"], inputMap: { left: "S", right: "AS1" }, ropePassThrough: true },
  SE1:   { id: "SE1",   x: 545, y: 405,  neighbors: ["SE2", "S"], inputMap: { left: "B", right: "A", down: "E" }, ropePassThrough: true },
  SE2:   { id: "SE2",   x: 530, y: 550,  neighbors: ["SE1", "E"], inputMap: { left: "B", right: "A", down: "E" }, ropePassThrough: true },
  // red upper-left cave: inline path node
  CR1: {
    id: "CR1",
    x: 250,
    y: 530,
    neighbors: ["C", "D", "CR2"],
    inputMap: { up: "CR2", left: "C", right: "D", down: "D" },
    cavePassThrough: true
  },
  CR2: {
    id: "CR2",
    x: 250,
    y: 445,
    neighbors: ["CR1"],
    inputMap: { down: "CR1" }
  },

  // blue upper-right cave: inline path node
  CB1: {
    id: "CB1",
    x: 820,
    y: 720,
    neighbors: ["F", "N", "CB2"],
    inputMap: { up: "CB2", left: "F", right: "N", down: "N" },
    cavePassThrough: true
  },
  CB2: {
    id: "CB2",
    x: 820,
    y: 610,
    neighbors: ["CB1"],
    inputMap: { down: "CB1" }
  },

    // yellow upper cave: inline path node
  CY1: {
    id: "CY1",
    x: 250,
    y: 820,
    neighbors: ["H", "J", "CY2"],
    inputMap: { up: "CY2", left: "H", right: "J" },
    cavePassThrough: true
  },
  CY2: {
    id: "CY2",
    x: 250,
    y: 700,
    neighbors: ["CY1"],
    inputMap: { down: "CY1" }
  },

  // blue lower-left cave: inline path node
  CB3: {
    id: "CB3",
    x: 250,
    y: 1220,
    neighbors: ["I", "P", "CB4"],
    inputMap: { up: "CB4", left: "I", right: "P" },
    cavePassThrough: true
  },
  CB4: {
    id: "CB4",
    x: 250,
    y: 1085,
    neighbors: ["CB3"],
    inputMap: { down: "CB3" }
  },

  // red lower-right cave
  CR3: {
    id: "CR3",
    x: 820,
    y: 1110,
    neighbors: ["L", "CR4"],
    inputMap: { up: "CR4", left: "L", right: "L", down: "L" },
    cavePassThrough: true
  },
  CR4: {
    id: "CR4",
    x: 820,
    y: 1035,
    neighbors: ["CR3"],
    inputMap: { down: "CR3" }
  },

  // yellow lower-right cave
  CY3: {
    id: "CY3",
    x: 250,
    y: 1450,
    neighbors: ["R", "Q", "CY4"],
    inputMap: { up: "CY4", left: "R", right: "Q" },
    cavePassThrough: true
  },
  CY4: {
    id: "CY4",
    x: 250,
    y: 1350,
    neighbors: ["CY3"],
    inputMap: { down: "CY3" }
  }

};

const portals = {
  CB2: "CR2",
  CB4: "CY4",
  CR2: "CB2",
  CR4: "CY2",
  CY2: "CR4",
  CY4: "CB4"
};

const bossPortals = {
  M0C: "M1C",
  M1C: "M0C"
};

const MAIN_HEART_NODE_IDS = ["C", "Q", "J"];

const bossNodes = {
  // ======================================================
  // BOTTOM PLATFORM
  // ======================================================
  START: { id: "START", x: 170, y: 1310, neighbors: ["L1D"] },

  // left ladder to lower slope
  L1D:   { id: "L1D",   x: 340, y: 1290, neighbors: ["START", "S1D", "L1U"], ladderExit: true },
  L1U:   { id: "L1U",   x: 345, y: 965,  neighbors: ["L1D", "L6D", "L3D"], ladderExit: true },

    // small short ladder left
  L6D:   { id: "L6D",   x: 200, y: 945,  neighbors: ["L6U", "L1U"], ladderExit: true },
  L6U:  { id: "L6U",  x: 200, y: 820,  neighbors: ["L6D", "R1B", "M1"], ladderExit: true },

  // right ladder to lower slope
  L2D:   { id: "L2D",   x: 825, y: 1215, neighbors: ["S1D", "L2U"], ladderExit: true },
  L2U:   { id: "L2U",   x: 825, y: 1055,  neighbors: ["L2D", "R2B", "M0"], ladderExit: true },

  S1D:   { id: "S1D",   x: 600, y: 1260, neighbors: ["L1D", "L2D", "SC1"], ladderExit: true },
  SC1:   { id: "SC1",   x: 680, y: 1170, neighbors: ["SC2", "S1D"], stopHere: false },
  SC2:   { id: "SC2",   x: 650, y: 1080, neighbors: ["SC1", "L3D"], stopHere: false },

  // ======================================================
  // LOWER SLOPE (left higher -> right lower)
  // ======================================================
  M0:    { id: "M0",    x: 695, y: 1020,  neighbors: ["L2U", "L3D", "M0C"], inputMap: { up: "M0C", left: "L3D", right: "L2U" }, cavePassThrough: true },
  M1:    { id: "M1",    x: 280, y: 800,  neighbors: ["L6U", "M1C", "L5B"], inputMap: { up: "M1C", left: "L6U", right: "L5B" }, cavePassThrough: true },
  M0C: {
  id: "M0C",
  x: 695,
  y: 950,
  neighbors: ["M0"],
  cavePassThrough: true,
  stopHere: true
},
M1C: {
  id: "M1C",
  x: 280,
  y: 740,
  neighbors: ["M1"],
  cavePassThrough: true,
  stopHere: true
},

  // center main ladder up to upper shelf
  L3D:   { id: "L3D",   x: 500, y: 985,  neighbors: ["L1U", "L3U", "M0", "SC2"], inputMap: { up: "L3U", left: "L1U", right: "M0", DOWN: "SC2" }, ladderExit: true },
  L3U:   { id: "L3U",   x: 500, y: 730,  neighbors: ["L3D", "L4D", "L5B"], ladderExit: true },

  // left rope from upper shelf down
  R1B: {
    id: "R1B",
    x: 85,
    y: 790,
    neighbors: ["L6U", "R1M"],
    inputMap: { up: "R1M", right: "L6U" },
    stopHere: true
  },
  R1T: {
    id: "R1T",
    x: 85,
    y: 435,
    neighbors: ["R1N", "L5D"],
    inputMap: { down: "R1N", right: "L5D" },
    stopHere: true
  },
  R1M: {
    id: "R1M",
    x: 115,
    y: 670,
    neighbors: ["R1N", "R1B"],
    stopHere: false
  },
  R1N: {
    id: "R1N",
    x: 110,
    y: 580,
    neighbors: ["R1M", "R1T"],
    stopHere: false
  },

  // right rope from middle-right down
  R2B: {
    id: "R2B",
    x: 925,
    y: 1030,
    neighbors: ["L2U", "R2M"],
    inputMap: { up: "R2M", left: "L2U" },
    stopHere: true
  },
  R2T: {
    id: "R2T",
    x: 905,
    y: 650,
    neighbors: ["R2N", "L4D", "S2M"],
    inputMap: { down: "R2N", left: "L4D" },
    stopHere: true
  },
  R2M: {
    id: "R2M",
    x: 895,
    y: 950,
    neighbors: ["R2B", "R2N"],
    stopHere: false
  },
  R2N: {
    id: "R2N",
    x: 885,
    y: 850,
    neighbors: ["R2T", "R2M"],
    stopHere: false
  },

  // ======================================================
  // SUMMIT LADDER + GOAL
  // ======================================================
  L4D:   { id: "L4D",   x: 690, y: 690, neighbors: ["L3U", "L4U", "R2T"], ladderExit: true },
  L4U:   { id: "L4U",   x: 690, y: 490, neighbors: ["L4D", "L5D", "S2U"], ladderExit: true },
  S2U:   { id: "S2U",   x: 810, y: 525, neighbors: ["L4U", "S2M"], stopHere: true },
  S2M:   { id: "S2M",   x: 860, y: 580, neighbors: ["R2T", "S2U"], stopHere: false },

  L5D:   { id: "L5D",   x: 340, y: 450, neighbors: ["R1T", "L4U", "L5N", "GOAL"], stopHere: true },
  L5B:   { id: "L5B",   x: 380, y: 755, neighbors: ["L3U", "M1", "L5C"], stopHere: true },
  L5C:   { id: "L5C",   x: 400, y: 620, neighbors: ["L5B", "L5N"], stopHere: false },
  L5N:   { id: "L5N",   x: 390, y: 520, neighbors: ["L5D", "L5C"], stopHere: false },

  TOP: { id: "TOP", x: 340, y: 0, neighbors: [] },
  GOAL:  { id: "GOAL",  x: 340, y: 300, neighbors: ["L5D"] }
};

const bossConfig = {
  startNode: "START",
  goalNode: "GOAL",
  motherStartNode: "L2D",
  roamingTroopStartNodes: ["R1T", "L4U"],
  coconutThrowerNode: "TOP",
  bananaNodes: ["R1T", "L3D", "L2D", "R2T", "L5D"]
};

const bossCoconutLanes = [
  ["TOP", "L5D", "M1", "L6D", "L1U", "L1D", "START"],
  ["TOP", "L4U", "L4D", "L3U", "L3D", "M0", "L2U", "L2D"],
  ["TOP", "L4U", "L4D", "L3U", "L3D", "SC2", "SC1", "S1D"],
  ["TOP", "R2T", "R2B", "L2U", "L2D"]
];

// ======================= CHILL HILL NODES =============================
const chillNodes = {
  CS: { id: "CS", x: 300, y: 1180, neighbors: ["CE"], surface: "ice" },
  CE: { id: "CE", x: 760, y: 1180, neighbors: ["CS", "CN"], surface: "ice" },
  CN: { id: "CN", x: 760, y: 760, neighbors: ["CE", "CW"], surface: "ice" },
  CW: { id: "CW", x: 300, y: 760, neighbors: ["CN", "CS", "CG"], surface: "ice" },
  CG: { id: "CG", x: 520, y: 540, neighbors: ["CW"], stopHere: true, surface: "ice" }
};

const CHILL_BANANA_NODE_IDS = ["CS", "CE", "CN", "CW"];

const chillConfig = {             
  startNode: "CS",
  goalNode: "CG"
};

function getBananaNodeIds() {
  if (state.scene === "chill") return CHILL_BANANA_NODE_IDS;
  return BANANA_NODE_IDS;
}

function getBossScale(x, y) {
  return 1;
}

function getLevelCardImage(level) {
  if (level % 2 === 0) {
    return spriteStore.coconutKongCard;
  }
  return spriteStore.bananaBonanzaCard;
}

function getSceneCard(scene, level) {
  if (scene === "main") {
    return spriteStore.bananaBonanzaCard || getLevelCardImage(level);
  }

  if (scene === "boss") {
    return spriteStore.coconutKongCard || getLevelCardImage(level);
  }

  if (scene === "chill") {
    return (
      spriteStore.chillHillCard ||
      spriteStore.chillHillBackground ||
      getLevelCardImage(level)
    );
  }

  return getLevelCardImage(level);
}

function getGameOverCardImage() {
  return spriteStore.gameOverCard || null;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function isBossScene() {
  return state.scene === "boss";
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function nodePos(id) {
  return getCurrentNodeMap()[id];
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  applyMuteState(sounds, state);
}

function getCurrentNodeMap() {
  if (state.scene === "boss") return bossNodes;
  if (state.scene === "chill") return chillNodes;
  return nodes;
}

function getCurrentBackgroundImage() {
  if (state.scene === "boss") return spriteStore.bossBackground;
  if (state.scene === "chill") return spriteStore.chillHillBackground || backgroundImage;
  return backgroundImage;
}

function showBossIntro(level) {
  state.loadScreenImage = spriteStore.coconutKongCard;  // force scene 2 card
  state.bossIntro = {
    level,
    time: 0,
    duration: 1.8
  };
}

function showLevelIntro(level, nextScene = "main") {
  state.loadScreenImage = getSceneCard(nextScene, level);

  state.levelIntro = {
    level,
    time: 0,
    duration: 2.6,
    nextScene
  };
}

function updateBossIntro(dt) {
  if (!state.bossIntro) return;

  state.bossIntro.time += dt;

  if (state.bossIntro.time >= state.bossIntro.duration) {
    state.bossIntro = null;
    startBossMode();
  }
}

function updateLevelIntro(dt) {
  if (!state.levelIntro) return;

  state.levelIntro.time += dt;

  if (state.levelIntro.time >= state.levelIntro.duration) {
    const nextScene = state.levelIntro.nextScene || "main";
    state.levelIntro = null;

    if (nextScene === "main") {
      startMainScene();
      return;
    }

    if (nextScene === "chill") {
      startChillHill();
      return;
    }
  }
}

function getNearestNodeId(x, y, nodeMap, maxDist = 40) {
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

function debugTeleportPlayerToNode(nodeId, nodeMap) {
  const n = nodeMap[nodeId];
  if (!n || !state.player) return;

  state.player.currentNode = nodeId;
  state.player.previousNode = null;
  state.player.targetNode = null;
  state.player.x = n.x;
  state.player.y = n.y;

  console.log("DEBUG NODE:", nodeId, n.x, n.y, n);
}

function drawPathOverlay(nodeMap) {
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

function drawNodeDebugOverlay(nodeMap) {
  if (!NODE_DEBUG) return;

  ctx.save();
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const id in nodeMap) {
    const n = nodeMap[id];

    if (n.ladderExit) ctx.fillStyle = "#ffd54a";
    else if (n.ropePassThrough) ctx.fillStyle = "#7dd3fc";
    else ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.strokeText(id, n.x, n.y - 18);
    ctx.fillStyle = "white";
    ctx.fillText(id, n.x, n.y - 18);
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function pointInRect(px, py, rect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.w &&
    py >= rect.y &&
    py <= rect.y + rect.h
  );
}

function validateGraph() {
  const errors = [];

  for (const id in nodes) {
    for (const neighborId of nodes[id].neighbors) {
      const neighbor = nodes[neighborId];
      if (!neighbor) {
        errors.push(`${id} references missing node ${neighborId}`);
        continue;
      }
      if (!neighbor.neighbors.includes(id)) {
        errors.push(`${id} -> ${neighborId} is not bidirectional`);
      }
    }
  }
}

function getBestNeighbor(currentNodeId, inputVec, inputName) {
  const nodeMap = getCurrentNodeMap();
  const current = nodeMap[currentNodeId];
  if (!current) return null;

  if (inputName && current.inputMap && current.inputMap[inputName]) {
    const forced = current.inputMap[inputName];
    if (current.neighbors.includes(forced)) {
      return forced;
    }
  }

  if (!inputVec) return null;

  let bestNeighbor = null;
  let bestScore = -Infinity;

  for (const neighborId of current.neighbors) {
    const neighbor = nodeMap[neighborId];
    if (!neighbor) continue;

    const dx = neighbor.x - current.x;
    const dy = neighbor.y - current.y;
    const len = Math.hypot(dx, dy);
    if (!len) continue;

    const nx = dx / len;
    const ny = dy / len;
    const score = nx * inputVec.x + ny * inputVec.y;

    if (score > bestScore) {
      bestScore = score;
      bestNeighbor = neighborId;
    }
  }

  return bestNeighbor;
}

function tryConsumeQueuedTurn(actor) {
  if (!queuedDirection || !queuedDirectionName) return false;

  const nextId = getBestNeighbor(actor.currentNode, queuedDirection, queuedDirectionName);
  if (!nextId) return false;

  actor.targetNode = nextId;

  queuedDirection = null;
  queuedDirectionName = null;
  return true;
}

function tryContinueForward(actor) {
  const nodeMap = getCurrentNodeMap();
  const current = nodeMap[actor.currentNode];
  if (!current || !actor.previousNode) return false;

  if (current.cavePassThrough) {
    if (queuedDirectionName === "up" && current.inputMap?.up) {
      return false;
    }

    const options = current.neighbors.filter(
      n => n !== actor.previousNode && n !== current.inputMap?.up
    );

    if (options.length === 1) {
      actor.targetNode = options[0];
      return true;
    }
  }

  if (current.ropePassThrough) {
    if (queuedDirectionName === "down" && current.inputMap?.down) {
      return false;
    }

    const options = current.neighbors.filter(
      n => n !== actor.previousNode && n !== current.inputMap?.down
    );

    if (options.length === 1) {
      actor.targetNode = options[0];
      return true;
    }
  }

  if (current.ladderExit) return false;
  if (current.stopHere) return false;

  const options = current.neighbors.filter(n => n !== actor.previousNode);

  if (options.length === 1) {
    actor.targetNode = options[0];
    return true;
  }

  return false;
}

function inputVectorFromNodes(fromId, toId) {
  const nodeMap = getCurrentNodeMap();
  const a = nodeMap[fromId];
  const b = nodeMap[toId];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function startMainScene() {
  state.mode = "playing";
  state.scene = "main";
  state.cardBackground = backgroundImage;
  state.boss = null;
  state.catchAnim = null;
  state.hearts = [];
  state.fieldHearts = [];
  state.particles = [];
  state.hand = null;
  state.banana = null;

  resetActors();
  applyLevelConfig();
  resetScene();
  playSceneMusic({ sounds, isBossScene: false });
}

function startBossMode() {
  state.scene = "boss";
  state.mode = "playing";
  state.cardBackground = spriteStore.bossBackground;
  state.catchAnim = null;
  state.hearts = [];
  state.fieldHearts = [];
  state.particles = [];
  state.banana = null;
  state.hand = null;

  if (!state.player) {
    state.player = new Player(bossConfig.startNode);
  }

  const start = bossNodes[bossConfig.startNode];
  state.player.currentNode = bossConfig.startNode;
  state.player.previousNode = null;
  state.player.targetNode = null;
  state.player.x = start.x;
  state.player.y = start.y;

  state.troops = [];
  state.coconuts = [];

  state.boss = {
    coconutTimer: 0,
    heartsCollected: 0,
    requiredHearts: 3,
    hearts: [
      { nodeId: "M1", collected: false },
      { nodeId: "L3D", collected: false },
      { nodeId: "R2T", collected: false }
    ],
    mother: {
      carried: false,
      nodeId: bossConfig.motherStartNode
    }
  };
  state.player.setCarryingMother(false);
  spawnBossRoamers();
}

function startChillHill() {
  state.scene = "chill";
  state.mode = "playing";
  state.boss = null;
  state.catchAnim = null;
  state.hearts = [];
  state.fieldHearts = [];
  state.particles = [];
  state.hand = null;
  state.banana = null;

  if (!state.player) {
    state.player = new Player(chillConfig.startNode);
  } else {
    state.player.reset(chillConfig.startNode);
  }

  state.troops = [];
  state.player.hasBanana = false;

  playSceneMusic({
    sounds,
    isBossScene: false
  });
}

// ======================================================
// LEVEL STATE
// ======================================================

function getLevelConfig() {
  const level = state.level;

  if (level === 1) return { troopCount: 3, speed: 0.60, intelligence: 0.20 };
  if (level === 2) return { troopCount: 3, speed: 0.68, intelligence: 0.30 };
  if (level === 3) return { troopCount: 4, speed: 0.78, intelligence: 0.45 };

  return {
    troopCount: Math.min(6, 4 + Math.floor((level - 3) / 2)),
    speed: Math.min(1.25, 0.78 + (level - 3) * 0.06),
    intelligence: Math.min(0.85, 0.45 + (level - 3) * 0.07)
  };
}

function showLevelUp(level) {
  state.loadScreenImage = getLevelCardImage(level);

  state.levelUp = {
    level,
    time: 0,
    duration: 2.2,
    hearts: Array.from({ length: 12 }, () => ({
      x: rand(80, canvas.width - 80),
      y: rand(canvas.height * 0.65, canvas.height - 40),
      size: rand(14, 34),
      speed: rand(18, 42),
      drift: rand(-12, 12),
      phase: rand(0, Math.PI * 2)
    }))
  };
}

function getOverlayBackgroundImage() {
  return state.loadScreenImage || null;
}

function updateLevelUp(dt) {
  if (!state.levelUp) return;

  const lu = state.levelUp;
  lu.time += dt;

  for (const h of lu.hearts) {
    h.y -= h.speed * dt;
    h.x += Math.sin(lu.time * 2 + h.phase) * h.drift * dt;

    if (h.y < -40) {
      h.y = canvas.height + rand(10, 80);
      h.x = rand(80, canvas.width - 80);
    }
  }

  if (lu.time >= lu.duration) {
    state.levelUp = null;
    handlePostLevelUp();
  }
}

function handlePostLevelUp() {
  showLevelIntro(state.level, "main");
}

// // function handlePostLevelUp() {
// //   if (state.level > 1 && state.level % 2 === 0) {
// //     showBossIntro(state.level);
// //     return;
// //   }

//   showLevelIntro(state.level);
// }

function spawnBossRoamers() {
  state.troops = bossConfig.roamingTroopStartNodes.map((nodeId, i) => {
    const troop = new Troop(nodeId, i === 0 ? "#7c5c46" : "#8d6b52");
    troop.baseSpeed = 120;
    troop.speedMultiplier = 1.0;
    troop.intelligence = 0.35;
    troop.speed = troop.baseSpeed * troop.speedMultiplier;
    return troop;
  });
}

function drawBossIntroOverlay() {
  if (!state.bossIntro) return;

  const bi = state.bossIntro;
  const t = Math.min(bi.time / bi.duration, 1);

  const fadeIn = Math.min(t / 0.2, 1);
  const fadeOut = bi.time > bi.duration - 0.3
    ? Math.max((bi.duration - bi.time) / 0.3, 0)
    : 1;
  const alpha = fadeIn * fadeOut;

  ctx.save();
  ctx.globalAlpha = alpha;

  const bg = state.loadScreenImage || getLevelCardImage(bi.level);
  if (bg && bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px Arial";
  ctx.strokeText("Rescue Mother", canvas.width / 2, 420);
  ctx.fillText("Rescue Mother", canvas.width / 2, 420);

  ctx.font = "36px Arial";
  ctx.fillStyle = "#f3f4f6";
  ctx.fillText("Carry Mother to the cave.", canvas.width / 2, 600);
  ctx.fillText("Collect 3 hearts before escaping.", canvas.width / 2, 660);

  ctx.restore();
}

function drawLevelIntroOverlay() {
  if (!state.levelIntro) return;

  const li = state.levelIntro;
  const t = Math.min(li.time / li.duration, 1);

  const fadeIn = Math.min(t / 0.2, 1);
  const fadeOut = li.time > li.duration - 0.4
    ? Math.max((li.duration - li.time) / 0.4, 0)
    : 1;
  const alpha = fadeIn * fadeOut;

  ctx.save();
  ctx.globalAlpha = alpha;

  const bg = state.loadScreenImage || getLevelCardImage(li.level);
  if (bg && bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 8;

  ctx.fillStyle = "#ffe066";
  ctx.font = "bold 78px Arial";
  ctx.strokeText(`Level ${li.level}`, canvas.width / 2, 320);
  ctx.fillText(`Level ${li.level}`, canvas.width / 2, 320);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 58px Arial";
  ctx.strokeText("Get Ready", canvas.width / 2, 430);
  ctx.fillText("Get Ready", canvas.width / 2, 430);

  ctx.restore();
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function drawHeartShape(x, y, size, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.globalAlpha = alpha;

  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-18, -12, -28, 10, 0, 30);
  ctx.bezierCurveTo(28, 10, 18, -12, 0, 8);
  ctx.closePath();

  ctx.fillStyle = "#ff4f8b";
  ctx.fill();

  ctx.restore();
}

function drawFieldHearts() {
  if (!state.fieldHearts?.length) return;

  const nodeMap = getCurrentNodeMap();

  for (const heart of state.fieldHearts) {
    if (heart.collected) continue;

    const node = nodeMap[heart.nodeId];
    if (!node) continue;

    const pulse = 1 + Math.sin(performance.now() * 0.006 + heart.pulse) * 0.12;

    ctx.save();
    ctx.translate(node.x, node.y - 12);
    ctx.scale(pulse, pulse);
    drawHeart(0, 0, 20, "#d22");
    ctx.restore();
  }
}

function updateMainHeartCollection() {
  if (state.mode === "sceneWin" || state.mode === "caveReveal") return;
  if (state.scene !== "main" || !state.player || !state.fieldHearts) return;

  for (const heart of state.fieldHearts) {
    if (heart.collected) continue;
    if (heart.nodeId !== state.player.currentNode) continue;

    heart.collected = true;
    state.acceptance = Math.min(3, (state.acceptance || 0) + 1);

    sounds.pickup?.play().catch(() => {});

    state.hearts.push({
      x: state.player.x,
      y: state.player.y - 10,
      t: 0
    });
  }

  const collected = state.fieldHearts.filter(h => h.collected).length;
  if (collected >= 3) {
    onSceneWin();
  }
}

// ======================================================
// DRAWING HELPERS
// ======================================================

function drawLevelUpOverlay() {
  if (!state.levelUp) return;

  const lu = state.levelUp;
  const t = Math.min(lu.time / lu.duration, 1);

  // overall fade
  const fadeIn = Math.min(t / 0.25, 1);
  const fadeOut = lu.time > lu.duration - 0.35
    ? Math.max((lu.duration - lu.time) / 0.35, 0)
    : 1;
  const alpha = fadeIn * fadeOut;

  // background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#ff5a1f");
  grad.addColorStop(1, "#ff1f6a");

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // floating hearts
  for (const h of lu.hearts) {
    drawHeartShape(h.x, h.y, h.size, 0.22 * alpha);
  }

  // title text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const titlePop = easeOutBack(Math.min(t / 0.35, 1));
  const subPop = easeOutBack(Math.min(Math.max((t - 0.08) / 0.35, 0), 1));
  const congratsPop = easeOutBack(Math.min(Math.max((t - 0.16) / 0.35, 0), 1));

  ctx.save();
  ctx.translate(canvas.width / 2, 185);
  ctx.scale(titlePop, titlePop);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 8;
  ctx.font = "bold 72px Arial";
  ctx.strokeText("Acceptance", 0, 0);
  ctx.fillText("Acceptance", 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(canvas.width / 2, 295);
  ctx.scale(subPop, subPop);
  ctx.fillStyle = "#ffe066";
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 8;
  ctx.font = "bold 88px Arial";
  ctx.strokeText(`Level ${lu.level}`, 0, 0);
  ctx.fillText(`Level ${lu.level}`, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(canvas.width / 2, 410);
  ctx.scale(congratsPop, congratsPop);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 7;
  ctx.font = "bold 64px Arial";
  ctx.strokeText("Congratulations!", 0, 0);
  ctx.fillText("Congratulations!", 0, 0);
  ctx.restore();

  // monkey art pop/bounce
  const artT = Math.min(Math.max((t - 0.12) / 0.45, 0), 1);
  const artScale = easeOutBack(artT);
  const bob = Math.sin(lu.time * 5.5) * 8;

  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI * 2 * i) / 8 + lu.time * 0.8;
    const rx = Math.cos(ang) * 260;
    const ry = Math.sin(ang) * 120;
    drawHeartShape(
      canvas.width / 2 + rx,
      1010 + ry + bob,
      10 + Math.sin(lu.time * 4 + i) * 2,
      0.16 * alpha
    );
  }

  const img = spriteStore.levelUpArt; // assign your cartoon image here
  if (img?.complete && img.naturalWidth > 0) {
    const targetW = 620;
    const targetH = targetW * (img.height / img.width);

    ctx.save();
    ctx.translate(canvas.width / 2, 1030 + bob);
    ctx.scale(artScale, artScale);
    ctx.drawImage(
      img,
      -targetW / 2,
      -targetH / 2,
      targetW,
      targetH
    );
    ctx.restore();
  }

  ctx.restore();
}

function drawLevelUpCard(title = "Level Up!") {
  const img = spriteStore.levelUpArt;

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.fillStyle = "#fff7cc";
  ctx.font = "bold 64px Arial";
  ctx.strokeText(title, canvas.width / 2, canvas.height * 0.18);
  ctx.fillText(title, canvas.width / 2, canvas.height * 0.18);

  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 4;
  ctx.strokeText("Tap or press a key to continue", canvas.width / 2, canvas.height * 0.86);
  ctx.fillText("Tap or press a key to continue", canvas.width / 2, canvas.height * 0.86);

  ctx.restore();
}

function getDirRow(facing) {
  if (facing === "down") return 0;
  if (facing === "left") return 1;
  if (facing === "right") return 1;
  if (facing === "up") return 2;
  return 0;
}

function drawSheetFrame(img, frame, facing, frameWidth, frameHeight, drawWidth, drawHeight) {
  if (!img || !img.complete || img.naturalWidth === 0) return false;

  const row = getDirRow(facing);
  const sx = frame * frameWidth;
  const sy = row * frameHeight;

  ctx.save();

  if (facing === "right") {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    img,
    sx,
    sy,
    frameWidth,
    frameHeight,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );

  ctx.restore();
  return true;
}

function updateAnim(actor, dt, fps = 12) {
  if (!actor || !actor.dir) return;

  const moving = Math.abs(actor.dir.x) > 0.001 || Math.abs(actor.dir.y) > 0.001;
  if (!moving) {
    actor.frame = 0;
    actor.animTime = 0;
    return;
  }

  actor.animTime += dt;
  actor.frame = Math.floor(actor.animTime * fps) % (actor.frameCount || 4);
}

function drawBanana(x, y, scale = 3, age = 0) {
  const ripeness = ripenessLabel(age);
  scale = scale * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = ripeness.color;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = ripeness.color;
  ctx.beginPath();
  ctx.moveTo(-14, 6);
  ctx.quadraticCurveTo(4, -20, 20, -6);
  ctx.quadraticCurveTo(2, 10, -14, 6);
  ctx.fill();

  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(6, -10, 14, -4);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(2, 12, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3f2f1c";
  ctx.fillRect(16, -8, 4, 4);

  ctx.restore();
}

function drawBackground() {
  const bg = getCurrentBackgroundImage();

  if (bg && bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#273b59";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawAcceptanceHearts() {
  const maxHearts = 3;
  const filled = state.acceptance || 0;

  const startX = 520;
  const y = 15;
  const spacing = 30;
  const size = 18;

  for (let i = 0; i < maxHearts; i++) {
    const x = startX + i * spacing;
    const isFilled = i < filled;
    drawHeart(x, y, size, isFilled ? "#d22" : "#fff");
  }
}

function drawBossHeartHud() {
  const maxHearts = state.boss?.requiredHearts || 3;
  const filled = state.boss?.heartsCollected || 0;

  const startX = 520;
  const y = 15;
  const spacing = 30;
  const size = 18;

  for (let i = 0; i < maxHearts; i++) {
    const x = startX + i * spacing;
    const isFilled = i < filled;
    drawHeart(x, y, size, isFilled ? "#d22" : "#fff");
  }
}

function drawHeart(x, y, size, fillColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 13, size / 13);

  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(0, 0, -9, 0, -9, 6);
  ctx.bezierCurveTo(-9, 12, 0, 16, 0, 18);
  ctx.bezierCurveTo(0, 16, 9, 12, 9, 6);
  ctx.bezierCurveTo(9, 0, 0, 0, 0, 6);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.restore();
}

function drawHudOverlay() {
  const h = 54;
  const pad = 20;

  ctx.save();

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, h);

  ctx.textBaseline = "middle";
  ctx.fillStyle = "#c8ffd8";

  const leftX = pad;
  const rightTextX = canvas.width - 110;

  // LEFT: banana score + level
  ctx.textAlign = "left";
  ctx.font = "28px Arial";
  ctx.fillText(`🍌 ${state.score}   ⛰️ ${state.level ?? 1}`, leftX, h / 2);

  // CENTER-ish: hearts
  if (isBossScene() && state.boss) {
    drawBossHeartHud();
  } else {
    drawAcceptanceHearts();
  }

  // RIGHT: monkey-head lives
  ctx.textAlign = "right";
  ctx.font = "28px Arial";
  ctx.fillText(`🐵 ${state.lives}`, rightTextX, h / 2);

  // Mute button box
  muteButton.w = 54;
  muteButton.h = 32;
  muteButton.x = canvas.width - muteButton.w - 16;
  muteButton.y = 11;

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, muteButton.x, muteButton.y, muteButton.w, muteButton.h, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    state.isMuted ? "🔇" : "🔊",
    muteButton.x + muteButton.w / 2,
    muteButton.y + muteButton.h / 2 + 1
  );

  ctx.restore();
}

function drawOverlay() {
  if (state.mode === "playing") return;

  const bg = getOverlayBackgroundImage();

  ctx.save();

  if (bg && bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff8dc";
  ctx.textAlign = "center";
  ctx.font = "bold 44px Arial";
  ctx.fillText("Monkey Mountain Madness", canvas.width / 2, canvas.height / 2 - 40);

ctx.font = "30px Arial";
let line = "";

if (state.mode === "start") {
  line = "Tap or use spacebar to begin!";
} else if (state.mode === "gameOver") {
  line = "Lil' Jab was tossed too many times. Tap to try again.";
}

if (line) {
  ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 8);
}
  // ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 8);

  ctx.font = "30px Arial";
  ctx.fillStyle = "#fde68a";
  ctx.fillText("Human detected. Banana etiquette unacceptable.", canvas.width / 2, canvas.height / 2 + 42);

  ctx.restore();
}

function drawHearts() {
  state.hearts.forEach(h => {
    const t = h.t;
    const y = h.y - t * 34;
    const a = 1 - t;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(h.x, y);
    ctx.fillStyle = "#ff5c8a";
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-18, -12, -28, 10, 0, 30);
    ctx.bezierCurveTo(28, 10, 18, -12, 0, 8);
    ctx.fill();
    ctx.restore();
  });
}

function spawnMainFieldHearts() {
  state.fieldHearts = MAIN_HEART_NODE_IDS.map(nodeId => ({
    nodeId,
    collected: false,
    pulse: Math.random() * Math.PI * 2
  }));
}

const CAVE_REVEAL_DURATION = 1.0;
const SCENE_WIN_DURATION = 1.5;

function onSceneWin() {
  state.mode = "caveReveal";
  state.caveTimer = 0;
}

function showSceneWin() {
  state.mode = "sceneWin";
  state.sceneWinTimer = 0;
  state.loadScreenImage = spriteStore.sceneWinCard || spriteStore.levelUpCard;
}

function drawSceneWinOverlay() {
  if (state.mode !== "sceneWin") return;

  if (state.loadScreenImage) {
    ctx.drawImage(state.loadScreenImage, 0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 56px Arial";
  ctx.fillText("Scene Clear", canvas.width / 2, 160);
  ctx.restore();
}

function showBananaPickupPopup(x, y, age) {
  const ripeness = ripenessLabel(age);

  state.particles.push({
    kind: "pickupText",
    x,
    y: y - 26,
    t: 0,
    life: 1.4,
    text: `🍌 ${ripeness.points}x`,
    color: ripeness.color
  });
}

function drawParticles() {
  state.particles.forEach(p => {
    if (p.kind === "bounce") {
      ctx.save();
      ctx.globalAlpha = 1 - p.t;
      ctx.strokeStyle = "#fff7cc";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12 + p.t * 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (p.kind === "bananaDrop") {
      ctx.save();
      ctx.globalAlpha = 1 - p.t * 0.7;
      drawBanana(p.x, p.y, 0.7, 8);
      ctx.restore();
    }

    if (p.kind === "pickupText") {
      const progress = Math.min(p.t / (p.life || 0.9), 1);

      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.translate(p.x, p.y - progress * 34);
      ctx.scale(1 + (1 - progress) * 0.3, 1 + (1 - progress) * 0.3);

      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.fillStyle = p.color || "#fff";

      ctx.strokeText(p.text, 0, 0);
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
  });
}

function drawGraph() {
  if (!DEBUG) return;

  const nodeMap = getCurrentNodeMap();

  ctx.save();
  ctx.strokeStyle = "rgba(255,0,0,0.9)";
  ctx.lineWidth = 6;

  const drawn = new Set();

  for (const id in nodeMap) {
    const node = nodeMap[id];
    for (const neighborId of node.neighbors) {
      const neighbor = nodeMap[neighborId];
      if (!neighbor) continue;

      const key = [id, neighborId].sort().join("-");
      if (drawn.has(key)) continue;

      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(neighbor.x, neighbor.y);
      ctx.stroke();
      drawn.add(key);
    }
  }

  for (const id in nodeMap) {
    const node = nodeMap[id];

    ctx.fillStyle = node.ropePassThrough
      ? "#7dd3fc"
      : node.ladderExit
      ? "#ffd54a"
      : "#6fd3ff";

    ctx.beginPath();
    ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawNodeLabels() {
  if (!DEBUG) return;

  const nodeMap = getCurrentNodeMap();

  ctx.save();
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const id in nodeMap) {
    const node = nodeMap[id];
    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;
    ctx.strokeText(id, node.x, node.y - 24);
    ctx.fillStyle = "white";
    ctx.fillText(id, node.x, node.y - 24);
  }

  ctx.restore();
}

function drawNodeHighlights() {
  if (!DEBUG || !state.player) return;

  const nodeMap = getCurrentNodeMap();

  const current = nodeMap[state.player.currentNode];
  if (current) {
    ctx.save();
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(current.x, current.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (state.player.targetNode) {
    const target = nodeMap[state.player.targetNode];
    if (target) {
      ctx.save();
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawBananaState() {
  if (!state.banana || state.player?.hasBanana) return;
  drawBanana(state.banana.x, state.banana.y, state.banana.size || 1, state.banana.age || 0);
}

function drawZookeeper() {
  const z = state.zookeeper;
  if (!z || !spriteStore.zookeeper1?.complete) return;

  const frameCount = 4;
  const frame = z.frame || 0;
  const frameWidth = spriteStore.zookeeper1.width / frameCount;
  const sx = frame * frameWidth;
  const sy = 0;

  ctx.drawImage(
    spriteStore.zookeeper1,
    sx, sy,
    frameWidth, spriteStore.zookeeper1.height,
    50, 30,
    224, 224
  );
}

function drawZookeeper2() {
  const z = state.zookeeper2;
  if (!z || !spriteStore.zookeeper2?.complete) return;

  const frameCount = 4;
  const frame = z.frame || 0;
  const frameWidth = spriteStore.zookeeper2.width / frameCount;
  const sx = frame * frameWidth;
  const sy = 0;

  ctx.drawImage(
    spriteStore.zookeeper2,
    sx, sy,
    frameWidth, spriteStore.zookeeper2.height,
    790, 250,
    224, 224
  );
}

function drawCavePreview() {
  if (!state.cavePreview) return;

  const nodeMap = getCurrentNodeMap();
  const node = nodeMap[state.cavePreview.targetNodeId];
  if (!node) return;

  const t = state.cavePreview.time / state.cavePreview.duration;
  const alpha = 1 - t;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.translate(node.x, node.y);
  ctx.scale(1.4, 1.0); // horizontal tunnel glow

  const radius = 144 + t * 28;
  const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius);
  grad.addColorStop(0, "rgba(255,255,220,0.55)");
  grad.addColorStop(0.45, "rgba(220,220,200,0.22)");
  grad.addColorStop(1, "rgba(255,255,220,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function beginCavePreview(fromNodeId, toNodeId) {
  state.cavePreview = {
    fromNodeId,
    targetNodeId: toNodeId,
    time: 0,
    duration: 0.2
  };
}

function finishCavePreview() {
  const cp = state.cavePreview;
  if (!cp) return;

  const nodeMap = getCurrentNodeMap();
  const target = nodeMap[cp.targetNodeId];
  if (!target || !state.player) {
    state.cavePreview = null;
    return;
  }

  state.player.currentNode = cp.targetNodeId;
  state.player.previousNode = null;
  state.player.targetNode = null;
  state.player.x = target.x;
  state.player.y = target.y;
  state.player.dir = { x: 0, y: 0 };
  state.player.facing = "down";

  state.cavePreview = null;
}

function handlePortalTravel(actor) {
  if (!actor || !actor.currentNode) return;
  if (state.cavePreview) return;

  const portalMap = isBossScene() ? bossPortals : portals;
  const destinationId = portalMap[actor.currentNode];
  if (!destinationId) return;

  const nodeMap = getCurrentNodeMap();
  const dest = nodeMap[destinationId];
  if (!dest) return;

  // Only preview for the player; troops can stay instant for now
  if (actor === state.player) {
    beginCavePreview(actor.currentNode, destinationId);
    return;
  }

  actor.currentNode = destinationId;
  actor.targetNode = null;
  actor.x = dest.x;
  actor.y = dest.y;
  actor.dir = { x: 0, y: 0 };
}

// ======================================================
// GAME OBJECTS
// ======================================================
class Player {
  constructor(startNodeId) {
    const p = nodePos(startNodeId);
    this.currentNode = startNodeId;
    this.previousNode = null;
    this.targetNode = null;
    this.x = p.x;
    this.y = p.y;
    this.dir = { x: 0, y: 0 };
    this.facing = "left";
    this.radius = 22;
    this.baseSpeed = 280;
    this.speed = this.baseSpeed;
    this.frame = 0;
    this.animTime = 0;
    this.frameCount = 4;
    this.hasBanana = false;
    this.panicking = false;
    this.movedThisRound = false;
    this.spriteKey = "lilJabRun";
    this.carryingMother = false;
    this.invuln = 0;
  }

  reset(startNodeId) {
    const p = nodePos(startNodeId);
    this.currentNode = startNodeId;
    this.previousNode = null;
    this.targetNode = null;
    this.x = p.x;
    this.y = p.y;
    this.dir = { x: 0, y: 0 };
    this.facing = "left";
    this.frame = 0;
    this.animTime = 0;
    this.hasBanana = false;
    this.panicking = false;
    this.movedThisRound = false;
    this.speed = this.baseSpeed;
    this.setCarryingMother(false);
    this.invuln = 2.0;
  }

  tryStartMove() {
    if (this.targetNode || !queuedDirection) return;

    // const nextId = getBestNeighbor(this.currentNode, queuedDirection);
    const nextId = getBestNeighbor(this.currentNode, queuedDirection, queuedDirectionName);
    if (!nextId) return;

    this.targetNode = nextId;
    }

update(dt) {
  if (this.invuln > 0) {
    this.invuln -= dt;
    if (this.invuln < 0) this.invuln = 0;
  }
  
  this.syncMotherSprite();

  if (state.levelUp) {
    updateLevelUp(dt);
    return;
  }

  if (state.bossIntro) {
    updateBossIntro(dt);
    return;
  }

  if (state.levelIntro) {
    updateLevelIntro(dt);
    return;
  }

  const nodeMap = getCurrentNodeMap();

  if (this.targetNode && queuedDirection) {
    const from = nodeMap[this.currentNode];
    const to = nodeMap[this.targetNode];
    if (from && to) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy) || 1;

      const forwardX = dx / len;
      const forwardY = dy / len;

      const dot = forwardX * queuedDirection.x + forwardY * queuedDirection.y;

      if (dot < -0.65) {
        const oldCurrent = this.currentNode;
        this.currentNode = this.targetNode;
        this.targetNode = oldCurrent;
        this.previousNode = oldCurrent;
      }
    }
  }

  if (!this.targetNode) {
    if (!tryConsumeQueuedTurn(this)) {
      this.dir = { x: 0, y: 0 };
      updateAnim(this, dt, 12);
      return;
    }
  }

  const target = nodeMap[this.targetNode];
  if (!target) {
    this.targetNode = null;
    this.dir = { x: 0, y: 0 };
    return;
  }

  const dx = target.x - this.x;
  const dy = target.y - this.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 0) {
    this.dir = { x: dx / dist, y: dy / dist };
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    this.facing = dx >= 0 ? "right" : "left";
  } else {
    this.facing = dy >= 0 ? "down" : "up";
  }

  const step = this.speed * dt;

  if (dist <= step) {
    this.x = target.x;
    this.y = target.y;
    this.previousNode = this.currentNode;
    this.currentNode = this.targetNode;
    this.targetNode = null;
    this.movedThisRound = true;

    handlePortalTravel(this);

    if (!tryConsumeQueuedTurn(this)) {
      tryContinueForward(this);
    }
  } else {
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  updateAnim(this, dt, 12);
}

setCarryingMother(isCarrying) {
  this.carryingMother = isCarrying;
  this.spriteKey = isCarrying ? "lilJabMotherRun" : "lilJabRun";
}

syncMotherSprite() {
  const shouldCarry = !!state.boss?.mother?.carried;
  if (this.carryingMother !== shouldCarry) {
    this.setCarryingMother(shouldCarry);
  }
}

  draw() {
    ctx.save();
    if (this.invuln > 0) {
      ctx.globalAlpha = 0.45 + 0.35 * Math.sin(performance.now() * 0.03);
    }
    ctx.translate(this.x, this.y);

    const s = getBossScale(this.x, this.y);
    ctx.scale(s, s);

    const img = spriteStore[this.spriteKey] || spriteStore.lilJabRun;
    if (img?.complete && img.naturalWidth > 0) {
      const frameWidth = img.width / 4;
      const frameHeight = img.height / 3;
      drawSheetFrame(img, this.frame, this.facing, frameWidth, frameHeight, 108, 108);
    } else {
      const bob = Math.sin(this.animTime * 8) * 2; // 2px bounce
      ctx.translate(this.x, this.y + bob);
      ctx.fillStyle = this.hasBanana ? "#ffd54a" : "#ffeb66";
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(8, -8, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.hasBanana) {
      drawBanana(18, -18, 0.45, state.banana?.age || 0);
    }

    ctx.restore();
  }
 }

class Troop {
  constructor(startNodeId, color = "#7c5c46") {
    const p = nodePos(startNodeId);
    this.startNodeId = startNodeId;
    this.currentNode = startNodeId;
    this.previousNode = null;
    this.targetNode = null;
    this.x = p.x;
    this.y = p.y;
    this.dir = { x: 0, y: 0 };
    this.facing = "left";
    this.radius = 20;
    //this.speed = 220;
    this.baseSpeed = 220;
    this.speedMultiplier = 0.60;
    this.intelligence = 0.20;
    this.speed = this.baseSpeed * this.speedMultiplier;
    this.frame = 0;
    this.animTime = 0;
    this.frameCount = 4;
    this.color = color;
  }

  reset() {
    const p = nodePos(this.startNodeId);
    this.currentNode = this.startNodeId;
    this.previousNode = null;
    this.targetNode = null;
    this.x = p.x;
    this.y = p.y;
    this.dir = { x: 0, y: 0 };
    this.facing = "left";
    this.frame = 0;
    this.animTime = 0;
    this.speed = this.baseSpeed * this.speedMultiplier;
  }

chooseNextNode() {
  const nodeMap = getCurrentNodeMap();
  const current = nodeMap[this.currentNode];
  if (!current) return null;

  const candidates = current.neighbors.filter(n => n !== this.previousNode);
  const pool = candidates.length ? candidates : current.neighbors;
  if (!pool.length) return null;

  const player = state.player;

  // In boss mode, chase some of the time regardless of banana state
  if (player && state.scene === "boss" && Math.random() < this.intelligence) {
    let best = null;
    let bestDist = Infinity;

    for (const candidate of pool) {
      const p = nodeMap[candidate];
      if (!p) continue;
      const d = Math.hypot(player.x - p.x, player.y - p.y);
      if (d < bestDist) {
        bestDist = d;
        best = candidate;
      }
    }

    return best;
  }

  // Main scene behavior can remain as-is
  if (player && player.hasBanana && Math.random() < this.intelligence) {
    let best = null;
    let bestDist = Infinity;

    for (const candidate of pool) {
      const p = nodeMap[candidate];
      if (!p) continue;
      const d = Math.hypot(player.x - p.x, player.y - p.y);
      if (d < bestDist) {
        bestDist = d;
        best = candidate;
      }
    }

    return best;
  }

  return choose(pool);
}

  update(dt) {
    if (state.mode === "sceneWin") return;
    this.speed = this.baseSpeed * this.speedMultiplier;

    if (!this.targetNode) {
      const next = this.chooseNextNode();
      if (next) this.targetNode = next;
    }

    if (!this.targetNode) {
      this.dir = { x: 0, y: 0 };
      updateAnim(this, dt, 10);
      return;
    }

    const nodeMap = getCurrentNodeMap();
const target = nodeMap[this.targetNode];
if (!target) {
  this.targetNode = null;
  this.dir = { x: 0, y: 0 };
  return;
}
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      this.dir = { x: dx / dist, y: dy / dist };
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx >= 0 ? "right" : "left";
    } else {
      this.facing = dy >= 0 ? "down" : "up";
    }

    const step = this.speed * dt;
    if (dist <= step) {
        this.x = target.x;
        this.y = target.y;
        this.previousNode = this.currentNode;
        this.currentNode = this.targetNode;
        this.targetNode = null;

        handlePortalTravel(this);
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }

    updateAnim(this, dt, 10);
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    const s = getBossScale(this.x, this.y);
    ctx.scale(s, s);


    const img = spriteStore.troopRun;
    if (img?.complete && img.naturalWidth > 0) {
      const frameWidth = img.width / 4;
      const frameHeight = img.height / 3;
      drawSheetFrame(img, this.frame, this.facing, frameWidth, frameHeight, 128, 128);
    } else {
      ctx.fillStyle = this.color;
      const bob = Math.sin(this.animTime * 8) * 2; // 2px bounce
      ctx.translate(this.x, this.y + bob);

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ======================================================
// GAME FLOW
// ======================================================
function addAcceptance(amount) {
  const maxAcceptance = 3;

  state.acceptance = clamp((state.acceptance || 0) + amount, 0, maxAcceptance);

  if (state.acceptance >= maxAcceptance) {
    state.acceptance = 0;
    state.level += 1;
    showLevelUp(state.level);
  }
}

function applyLevelConfig() {
  const config = getLevelConfig();

  const baseTroopStarts = ["N", "M", "K", "O", "H", "Q"];
  const troopColors = ["#7c5c46", "#6c4d39", "#8d6b52", "#5f4635", "#8b6a50", "#6d5240"];

  while (state.troops.length < config.troopCount) {
    const idx = state.troops.length;
    state.troops.push(new Troop(baseTroopStarts[idx], troopColors[idx]));
  }

  while (state.troops.length > config.troopCount) {
    state.troops.pop();
  }

  for (const troop of state.troops) {
    troop.speedMultiplier = config.speed;
    troop.intelligence = config.intelligence;
  }
}

function ripenessLabel(age) {
  if (age >= 9) return { label: "Golden", points: 3, color: "#facc15" };
  if (age >= 5) return { label: "Yellow", points: 2, color: "#fde047" };
  return { label: "Green", points: 1, color: "#4ade80" };
}

function beginGame() {
  if (state.mode === "start") {
    state.mode = "levelIntro";
    showLevelIntro(state.level);
    return;
  }

  if (state.mode === "sceneWin") {
    goToNextScene();
    return;
  }

  if (state.mode === "gameOver") {
    state.mode = "playing";
    startGame();
  }
}

function resetActors() {
  clearQueuedDirectionCompat();
  queuedDirection = null;
  queuedDirectionName = null;
  state.player = new Player(HOME_NODE);
  state.troops = [
    new Troop("N", "#7c5c46"),
    new Troop("M", "#6c4d39"),
    new Troop("K", "#8d6b52")
  ];
}

function startGame() {
  state.mode = "playing";
  state.scene = "main";
  state.boss = null;
  state.cardBackground = backgroundImage;
  state.loadScreenImage = getLevelCardImage(1);
  state.score = 0;
  state.lives = 3;
  state.hearts = [];
  state.fieldHearts = [];
  state.particles = [];
  state.catchAnim = null;
  state.acceptance = 0;
  state.level = 1;
  state.levelUp = null;
  state.levelIntro = null;
  state.bossIntro = null;
  state.hand = null;
  state.banana = null;
  state.zookeeper = { anim: "idle", frame: 0, time: 0, didThrowSound: false };
  state.zookeeper2 = { anim: "idle", frame: 0, time: 0, timer: rand(2.5, 6) };

  resetActors();
  applyLevelConfig();
  // newRound();
  resetScene();
  playSceneMusic({
    sounds,
    isBossScene: false
  });
}

function newRound() {
  queuedDirection = null;
  queuedDirectionName = null;

  state.roundState = "waiting";
  state.catchAnim = null;

  state.player.reset(HOME_NODE);
  state.troops.forEach(t => t.reset());

  tossBanana();
}

function resetScene() {
  state.inputQueue = [];
  state.roundState = "waiting";
  state.catchAnim = null;

  const startNode =
    state.scene === "chill" ? chillConfig.startNode : HOME_NODE;

  state.player.reset(startNode);
  state.troops.forEach(t => t.reset());

  if (state.scene === "main") {
  spawnMainFieldHearts();
  state.acceptance = 0;
}
  tossBanana();
}

// function spawnNextBanana() {
//   state.banana = null;
//   state.hand = null;
//   tossBanana();
// }

function spawnNextBanana() {
  state.roundState = "waiting";
  state.catchAnim = null;
  state.banana = null;
  state.hand = null;
  tossBanana();
}

function tossBanana() {
  const nodeMap = getCurrentNodeMap();
  const targetNodeId = choose(getBananaNodeIds());
  const to = nodeMap[targetNodeId];

  if (!to) {
    console.warn("tossBanana: missing target node", state.scene, targetNodeId);
    return;
  }

  state.zookeeper = {
    anim: "throw",
    frame: 0,
    time: 0,
    didThrowSound: false
  };

  // existing banana/hand setup...

  state.banana = {
    nodeId: targetNodeId,
    x: to.x,
    y: to.y,
    targetX: to.x,
    targetY: to.y,
    landed: false,
    age: 0,
    size: 1,
    collected: false
  };

  state.hand = {
    active: true,
    t: 0,
    duration: 0.9,
    from: { x: 70, y: 160 + rand(-20, 20) },
    to: { x: to.x, y: to.y }
  };
}

function triggerZookeeper2(type = "react") {
  if (!state.zookeeper2) return;
  if (state.zookeeper2.anim !== "idle") return;

  state.zookeeper2.anim = type;
  state.zookeeper2.frame = 1;
  state.zookeeper2.time = 0;
}

function updateZookeeper(dt) {
  const z = state.zookeeper;
  if (!z) return;

  z.time += dt;

  if (z.anim === "throw") {
    if (z.time < 0.15) z.frame = 0;
    else if (z.time < 0.3) z.frame = 1;
    else if (z.time < 0.5) z.frame = 2;
    else {
      z.anim = "idle";
      z.frame = 0;
      z.time = 0;
      z.didThrowSound = false;
    }

    if (z.frame === 1 && !z.didThrowSound) {
      sounds.step?.play().catch(() => {});
      z.didThrowSound = true;
    }
  }
}

function updateZookeeper2(dt) {
  const z = state.zookeeper2;
  if (!z) return;

  z.time += dt;
  z.timer -= dt;

  if (z.anim === "react") {
    if (z.time < 0.25) z.frame = 1;
    else if (z.time < 0.9) z.frame = 2;
    else if (z.time < 1.2) z.frame = 3;
    else {
      z.anim = "idle";
      z.frame = 0;
      z.time = 0;
      z.timer = rand(2.5, 6);
    }
    return;
  }

  if (z.timer <= 0) {
    z.anim = "react";
    z.frame = 1;
    z.time = 0;
  } else {
    z.frame = 0;
  }
}

function updateHand(dt) {
  if (!state.hand?.active || !state.banana) return;

  state.hand.t += dt / state.hand.duration;
  const t = clamp(state.hand.t, 0, 1);

  const p0 = state.hand.from;
  const p2 = state.hand.to;
  const peak = {
    x: (p0.x + p2.x) / 2 - 40,
    y: Math.min(p0.y, p2.y) - 140 - rand(0, 20)
  };

  const inv = 1 - t;
  state.banana.x = inv * inv * p0.x + 2 * inv * t * peak.x + t * t * p2.x;
  state.banana.y = inv * inv * p0.y + 2 * inv * t * peak.y + t * t * p2.y;

  if (t >= 1) {
    state.hand.active = false;
    state.banana.landed = true;
    state.banana.x = state.banana.targetX;
    state.banana.y = state.banana.targetY;
    state.particles.push({ kind: "bounce", x: state.banana.x, y: state.banana.y + 12, t: 0 });
  }
}

function updateBanana(dt) {
  if (!state.banana || !state.banana.landed || state.player?.hasBanana) return;

  state.banana.age += dt;
  state.banana.size = 1 + Math.sin(state.banana.age * 5) * 0.08;

  if (distance(state.player, state.banana) < 30) {
    state.player.hasBanana = true;
    state.roundState = "chase";
    sounds.pickup?.play().catch(() => {});
    triggerZookeeper2("react");
  }
}

function showChillIntro() {
  state.loadScreenImage =
    spriteStore.chillHillCard ||
    spriteStore.chillHillBackground ||
    spriteStore.levelUpArt ||
    null;

  state.levelIntro = {
    level: state.level,
    time: 0,
    duration: 2.6,
    nextScene: "chill"
  };
}

const sceneOrder = ["main", "boss", "chill"];

function goToNextScene() {
  state.mode = "playing";
  state.sceneWinTimer = 0;

  if (state.scene === "main") {
    showBossIntro(state.level);
    return;
  }

  if (state.scene === "boss") {
    showLevelIntro(state.level, "chill");
    return;
  }

  if (state.scene === "chill") {
    state.level += 1;
    showLevelUp(state.level);
    return;
  }
}

function getBossDangerAtPlayer() {
  if (!state.player) return 999;

  let danger = 999;

  for (const troop of state.troops || []) {
    const d = Math.hypot(state.player.x - troop.x, state.player.y - troop.y);
    danger = Math.min(danger, d);
  }

  for (const coconut of state.coconuts || []) {
    const d = Math.hypot(state.player.x - coconut.x, state.player.y - coconut.y);
    danger = Math.min(danger, d);
  }

  return danger;
}

function updateBossMother(dt) {
  const mother = state.boss?.mother;
  if (!mother) return false;

  const danger = getBossDangerAtPlayer();

  if (mother.carried && danger >= 1.0) {
    dropMother();
  }

  updateBossHeartCollection();
  pickupMotherIfSafe();

  // speed penalty while carrying
  if (state.scene === "boss") {
    const targetSpeed = mother.carried ? 210 : 300;
    state.player.speed += (targetSpeed - state.player.speed) * 0.2;
  }
  if (
    mother.carried &&
    state.player.currentNode === bossConfig.goalNode &&
    state.boss.heartsCollected >= state.boss.requiredHearts
  ) {
    endBossModeSuccess();
  }
  return false;
}

function drawBossMother() {
  if (!isBossScene() || !state.boss?.mother) return;

  const mother = state.boss.mother;
  const img = spriteStore.mother;

  if (mother.carried) return;

  const node = bossNodes[mother.nodeId];
  if (!node) return;

ctx.save();
ctx.translate(node.x + 40, node.y + 40);

//const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.22;
const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.08;
ctx.scale(pulse, pulse);

// strong outer glow
const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, 190);
glow.addColorStop(0,    "rgba(255,255,180,0.63)"); // was 0.90
glow.addColorStop(0.18, "rgba(255,210,90,0.52)");  // was 0.75
glow.addColorStop(0.45, "rgba(255,140,30,0.32)");  // was 0.45
glow.addColorStop(0.75, "rgba(255,90,0,0.12)");    // was 0.18
glow.addColorStop(1, "rgba(255,60,0,0)");

ctx.fillStyle = glow;
ctx.beginPath();
ctx.arc(0, 0, 90, 0, Math.PI * 2);
ctx.fill();

// hot inner ring
ctx.strokeStyle = "rgba(255,190,70,0.65)";
ctx.lineWidth = 6;
ctx.beginPath();
ctx.arc(0, 0, 42, 0, Math.PI * 2);
//ctx.stroke();

ctx.restore();
  ctx.save();

  if (img && img.complete && img.naturalWidth > 0) {
    // ctx.drawImage(img, node.x - 40, node.y - 44, 156, 156);
    ctx.drawImage(img, node.x - 44, node.y - 44, 156, 156);
  } else {
    ctx.fillStyle = "#d8b38a";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBossCollectibleHearts() {
  const boss = state.boss;
  if (!isBossScene() || !boss || !boss.hearts) return;

  const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.08;

  for (const heart of boss.hearts) {
    if (heart.collected) continue;

    const node = bossNodes[heart.nodeId];
    if (!node) continue;

    const x = node.x;
    const y = node.y - 18;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    // glow
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#ff7a95";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // heart body
    drawHeart(0, 0, 30, "#e11d48");

    ctx.restore();
  }
}

function drawBossActors() {
  state.player?.draw();
  state.troops.forEach(t => t.draw());

  drawBossCollectibleHearts();

  for (const coconut of (state.coconuts || [])) {
    drawBossCoconut(coconut);
  }

  drawHearts();
  drawParticles();
}

function dropMother() {
  const mother = state.boss?.mother;
  if (!mother || !mother.carried) return;

  mother.carried = false;
  mother.nodeId = state.player.currentNode;
  state.player?.setCarryingMother(false);
}

function resetBossPlayerToStart() {
  const start = bossNodes[bossConfig.startNode];
  if (!start || !state.player) return;

  clearQueuedDirectionCompat();
  queuedDirection = null;
  queuedDirectionName = null;
  
  state.player.invuln = 2.0;
  state.player.currentNode = bossConfig.startNode;
  state.player.previousNode = null;
  state.player.targetNode = null;
  state.player.x = start.x;
  state.player.y = start.y;
  state.player.dir = { x: 0, y: 0 };
  state.player.facing = "down";

  const carried = state.boss?.mother?.carried;
  state.player.speed = carried ? 210 : 300;
}

function dropMotherAndResetPlayer() {
  resetMotherToStart();
  resetBossPlayerToStart();
}

function resetMotherToStart() {
  const mother = state.boss?.mother;
  if (!mother) return;

  mother.carried = false;
  mother.nodeId = bossConfig.motherStartNode;
  state.player?.setCarryingMother(false);
}

function pickupMotherIfSafe() {
  const mother = state.boss?.mother;
  if (!mother || mother.carried) return;
  if (state.player.currentNode !== mother.nodeId) return;

  mother.carried = true;
  mother.nodeId = null;
  state.player?.setCarryingMother(true);
}

function updateBossHeartCollection() {
  const boss = state.boss;
  const player = state.player;
  if (!boss || !player || !boss.hearts) return;

  for (const heart of boss.hearts) {
    if (!heart.collected && heart.nodeId === player.currentNode) {
      heart.collected = true;
      boss.heartsCollected += 1;
      sounds.pickup?.play().catch(() => {});
    }
  }
}

function updatePlayer(dt) {
  if (!state.player) return;

  state.player.update(dt);

  if (state.player.movedThisRound && state.roundState === "waiting" && state.banana?.landed) {
    state.roundState = "chase";
  }

  updateMainHeartCollection();

  if (state.banana && !state.banana.collected) {
    const d = Math.hypot(
      state.player.x - state.banana.x,
      state.player.y - state.banana.y
    );

    if (d < 36) {
      state.banana.collected = true;

      const ripeness = ripenessLabel(state.banana.age);
      state.score += ripeness.points;

      showBananaPickupPopup(state.player.x, state.player.y, state.banana.age);
      sounds.score?.play().catch(() => {});

      state.banana = null;
      state.hand = null;
      tossBanana();
    }
  }

  if (state.scene === "chill" && state.player.currentNode === chillConfig.goalNode) {
    onSceneWin();
    return;
  }
}

function startCatch(troop) {
  state.catchAnim = {
    troop,
    startX: state.player.x,
    startY: state.player.y,
    endX: nodes[HOME_NODE].x,
    endY: nodes[HOME_NODE].y,
    t: 0,
    duration: 0.8
  };

  state.player.dir = { x: 0, y: 0 };
  addAcceptance(-1);
  triggerZookeeper2("react");
  sounds.catch?.play().catch(() => {});
}

function updateTroops(dt) {
  state.troops.forEach(t => t.update(dt));

  if (state.catchAnim) return;
  if (state.player?.invuln > 0) return;   // main-scene invulnerability

  for (const troop of state.troops) {
    if (distance(state.player, troop) < 34) {
      startCatch(troop);
      break;
    }
  }
}

function restartBossLevel() {
  state.coconuts = [];
  state.troops = [];
  state.boss = null;
  startBossMode();
}

function respawnPlayerHome() {
  if (!state.player) return;

  clearQueuedDirectionCompat();
  queuedDirection = null;
  queuedDirectionName = null;

  state.catchAnim = null;
  state.hand = null;
  state.banana = null;

  state.player.reset(HOME_NODE);
  spawnNextBanana();
}

function updateBossCollisions() {
  const player = state.player;
  if (!player) return;
  if (player.invuln > 0) return;
  const mother = state.boss?.mother;

  if (!player || !mother) return;
  if (player.invuln > 0) return;

  for (const troop of state.troops) {
    if (Math.hypot(player.x - troop.x, player.y - troop.y) < 34) {
      if (mother.carried) {
        dropMotherAndResetPlayer();
      } else {
        restartBossLevel();
      }
      return;
    }
  }

  for (const coconut of state.coconuts) {
    if (Math.hypot(player.x - coconut.x, player.y - coconut.y) < 34) {
      if (mother.carried) {
        dropMother();
      } else {
        restartBossLevel();
      }
      return;
    }
  }
}

function endBossModeSuccess() {
  state.boss = null;
  state.coconuts = [];
  state.troops = [];
  showSceneWin();
}
function spawnBossCoconut() {
  const lane = choose(bossCoconutLanes);

  const first = bossNodes[lane[0]];
  state.coconuts.push({
    lane,
    laneIndex: 0,
    x: first.x,
    y: first.y,
    speed: 260
  });
}

function updateBossCoconuts(dt) {
  const nodeMap = bossNodes;

  for (const coconut of state.coconuts) {
    const nextIndex = coconut.laneIndex + 1;
    if (nextIndex >= coconut.lane.length) {
      coconut.done = true;
      continue;
    }

    const target = nodeMap[coconut.lane[nextIndex]];
    const dx = target.x - coconut.x;
    const dy = target.y - coconut.y;
    const dist = Math.hypot(dx, dy);
    const step = coconut.speed * dt;

    if (dist <= step) {
      coconut.x = target.x;
      coconut.y = target.y;
      coconut.laneIndex = nextIndex;
    } else {
      coconut.x += (dx / dist) * step;
      coconut.y += (dy / dist) * step;
    }
  }

  state.coconuts = state.coconuts.filter(c => !c.done);
}

function updateBossMode(dt) {
  if (!state.boss) return;

  updatePlayer(dt);
  if (!state.boss) return;

  updateTroops(dt);
  if (!state.boss) return;

  updateBossMother(dt);
  if (!state.boss || state.scene !== "boss") return;

  state.boss.coconutTimer += dt;

  if (state.boss.coconutTimer >= 2.4) {
    state.boss.coconutTimer = 0;
    spawnBossCoconut();
  }

  updateBossCoconuts(dt);
  if (!state.boss || state.scene !== "boss") return;

  updateBossCollisions();
}

function updateCatch(dt) {
  if (!state.catchAnim) return;

  const a = state.catchAnim;
  a.t += dt / a.duration;
  const t = clamp(a.t, 0, 1);
  const inv = 1 - t;
  const peakY = Math.min(a.startY, a.endY) - 150;

  state.player.x = inv * inv * a.startX + 2 * inv * t * ((a.startX + a.endX) / 2) + t * t * a.endX;
  state.player.y = inv * inv * a.startY + 2 * inv * t * peakY + t * t * a.endY;
  state.player.facing = t < 0.5 ? "left" : "right";

  if (t >= 1) {
    state.lives -= 1;

    if (state.lives <= 0) {
      state.mode = "gameOver";
      state.loadScreenImage = getGameOverCardImage();

      if (sounds.music) {
        sounds.music.pause();
        sounds.music.currentTime = 0;
      }
      if (sounds.bossMusic) {
        sounds.bossMusic.pause();
        sounds.bossMusic.currentTime = 0;
      }
    } else {
      respawnPlayerHome();
    }
  }
}

function updateParticles(dt) {
  state.hearts.forEach(h => h.t += dt);
  state.hearts = state.hearts.filter(h => h.t < 1.1);

  state.particles.forEach(p => p.t += dt);

  state.particles = state.particles.filter(p => {
    const maxLife = p.life ?? 1;
    return p.t < maxLife;
  });
}

function update(dt) {
  if (state.levelUp) {
    updateLevelUp(dt);
    return;
  }

  if (state.mode === "caveReveal") {
    state.caveTimer = (state.caveTimer || 0) + dt;
    if (state.caveTimer >= CAVE_REVEAL_DURATION) {
      showSceneWin();
    }
    return;
  }

  if (state.levelIntro) {
    updateLevelIntro(dt);
    return;
  }

  if (state.bossIntro) {
    updateBossIntro(dt);
    return;
  }

  if (state.mode === "sceneWin") {
    state.sceneWinTimer = (state.sceneWinTimer || 0) + dt;
    if (state.sceneWinTimer >= SCENE_WIN_DURATION) {
      goToNextScene();
    }
    return;
  }

  if (state.cavePreview) {
    state.cavePreview.time += dt;
    if (state.cavePreview.time >= state.cavePreview.duration) {
      finishCavePreview();
    }
    return;
  }

  if (state.mode !== "playing") return;

  if (state.scene === "boss") {
    updateBossMode(dt);
    return;
  }

  updateHand(dt);
  updateBanana(dt);

  if (!state.catchAnim) {
    updatePlayer(dt);
  }

  if (state.player) {
    updateTroops(dt);
  }

  updateZookeeper(dt);
  updateZookeeper2(dt);
  updateCatch(dt);
  updateParticles(dt);
}

// ======================================================
// RENDER
// ======================================================
function drawActors() {
  state.player?.draw();
  state.troops.forEach(t => t.draw());
  drawHearts();
  drawParticles();
}

// function draw() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   if (state.mode === "start") {
//     drawStartCard(ctx);
//     return;
//   }

//   const showingTransitionCard =
//     !!state.levelUp ||
//     !!state.bossIntro ||
//     !!state.levelIntro ||
//     state.mode === "sceneWin";

//   if (showingTransitionCard) {
//     ctx.fillStyle = "#000";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   } else {
//     drawBackground();

//     if (!isBossScene()) {
//       drawBananaState();
//       drawFieldHearts();
//       drawZookeeper();
//       drawZookeeper2();
//       drawActors();
//     } else {
//       drawBossActors();
//       drawBossMother();
//     }

//     drawHudOverlay();
//     drawCavePreview();
//   }

//   drawNodeLabels();
//   drawPathOverlay(getCurrentNodeMap());
//   drawNodeDebugOverlay();

//   if (state.mode === "sceneWin") {
//     drawLevelUpCard("Scene Clear");
//   }
//   drawOverlay();
//   drawBossIntroOverlay();
//   drawLevelIntroOverlay();
//   drawLevelUpOverlay();
// }

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.mode === "start") {
    drawStartCard(ctx);
    return;
  }

const showingTransitionCard =
  !!state.levelUp ||
  !!state.bossIntro ||
  !!state.levelIntro ||
  state.mode === "sceneWin" ||
  state.mode === "caveReveal";

if (showingTransitionCard) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.mode === "caveReveal") {
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 48px Arial";
    ctx.fillText("Cave Explodes", canvas.width / 2, canvas.height / 2);
    return;
  }

  if (state.mode === "sceneWin") {
    drawLevelUpCard("Scene Clear");
    return;
  }
  drawBossIntroOverlay();
  drawLevelIntroOverlay();
  drawLevelUpOverlay();
  return;
}

  drawBackground();

  if (!isBossScene()) {
    drawBananaState();
    drawFieldHearts();
    drawZookeeper();
    drawZookeeper2();
    drawActors();
  } else {
    drawBossActors();
    drawBossMother();
  }
  // === debug
  if (DEBUG){
    drawPathOverlay(getCurrentNodeMap());
    drawNodeDebugOverlay(getCurrentNodeMap());
    drawNodeLabels();
    drawNodeHighlights();
  }
  // ===
  drawHudOverlay();
  drawCavePreview();
  drawOverlay();
}

function drawBossCoconut(coconut) {
  ctx.save();
  ctx.translate(coconut.x, coconut.y);

  const r = 24; // was effectively ~14 before

  // soft shadow
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(4, 12, r * 0.85, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // outer shell
  const shellGrad = ctx.createRadialGradient(-6, -8, 4, 0, 0, r);
  shellGrad.addColorStop(0, "#9a6130");
  shellGrad.addColorStop(0.6, "#6f421f");
  shellGrad.addColorStop(1, "#4d2b14");

  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // edge
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#2f180c";
  ctx.stroke();

  // fibrous lines
  ctx.strokeStyle = "rgba(255, 220, 170, 0.28)";
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r - 4 - i * 2, -0.8, 1.7);
    ctx.stroke();
  }

  // highlight
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(-8, -10, 7, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // top tuft
  ctx.strokeStyle = "#5d7f2d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -r + 2);
  ctx.lineTo(-3, -r - 7);
  ctx.moveTo(0, -r + 2);
  ctx.lineTo(0, -r - 9);
  ctx.moveTo(0, -r + 2);
  ctx.lineTo(4, -r - 6);
  ctx.stroke();

  ctx.restore();
}

// ======================================================
// INPUT
// ======================================================
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();

  if (state.mode === "caveReveal") {
    showSceneWin();
    return;
  }

  if (state.mode === "start" || state.mode === "gameOver") {
    beginGame();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  if (pointInRect(x, y, muteButton)) {
    toggleMute();
    return;
  }

  touchStart = { x, y };
  swipeHandled = false;
}, { passive: false });

canvas.addEventListener("pointerup", () => {
  touchStart = null;
  swipeHandled = false;
}, { passive: true });

canvas.addEventListener("pointercancel", () => {
  touchStart = null;
  swipeHandled = false;
}, { passive: true });

// canvas.addEventListener("click", () => {
//     if (state.mode === "sceneWin") {
//     goToNextScene();
//     return;
//   }
//   beginGame();
// });

document.addEventListener("keydown", (e) => {
  if(DEBUG){
    if (e.key === "c" || e.key === "C") {
      startChillHill();
      e.preventDefault();
    }
  }
if (state.mode === "caveReveal") {
  showSceneWin();
  return;
}
if (e.key === "c" || e.key === "C") {
  startChillHill();
  e.preventDefault();
}
if (e.key === "n" || e.key === "N") {
  showBossIntro(state.level ?? 1);
  e.preventDefault();
}
  if (e.key === "ArrowLeft") {
    setQueuedDirectionCompat(-1, 0, "left");
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    setQueuedDirectionCompat(1, 0, "right");
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    setQueuedDirectionCompat(0, -1, "up");
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    setQueuedDirectionCompat(0, 1, "down");
    e.preventDefault();
  } else if (e.code === "Space") {
    beginGame();
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key in keys) {
    keys[e.key] = false;
    e.preventDefault();
  }
});

document.body.addEventListener("touchmove", (e) => {
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
}, { passive: false });

// ======================================================
// LOOP
// ======================================================
// function loop(ts) {
//   const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
//   state.lastTime = ts;
//   update(dt || 0);
//   draw();
//   requestAnimationFrame(loop);
// }
function loop(ts) {
  try {
    const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
    state.lastTime = ts;
    update(dt || 0);
    draw();
  } catch (err) {
    console.error("LOOP CRASH", err);
    console.log("scene:", state.scene);
    console.log("boss:", state.boss);
    console.log("player:", state.player);
    debugger;
    return; // stop the loop so the error stays visible
  }
  requestAnimationFrame(loop);
}
// ======================================================
// STARTUP
// ======================================================
validateGraph();
state.loadScreenImage = getLevelCardImage(1);
requestAnimationFrame(loop);
