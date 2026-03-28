const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1536;

// ======================================================
// CONFIG
// ======================================================
const DEBUG = true;
let NODE_DEBUG = true;
const SWIPE_THRESHOLD = 24;

const spriteStore = {};
const sounds = {};
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

const state = {
  mode: "start",
  cardBackground: null,
  loadScreenImage: null,
  levelIntro: null,
  lastTime: 0,
  score: 0,
  lives: 3,
  acceptance: 0,
  isMuted: false,
  nextAcceptanceUnlock: 3,
  player: null,
  troops: [],
  banana: null,
  hand: null,
  hearts: [],
  particles: [],
  catchAnim: null,
  zookeeper: { anim: "idle", frame: 0, time: 0, didThrowSound: false },
  zookeeper2: { anim: "idle", frame: 0, time: 0, timer: 3.5 },
  scene: "main",
  boss: null,
  bossIntro: null,
  roundState: "waiting",
  cavePreview: null
};

let musicStarted = false;
let touchStart = null;
let swipeHandled = false;
let queuedDirection = null;
let queuedDirectionName = null;

function setQueuedDirection(x, y, name) {
  queuedDirection = { x, y };
  queuedDirectionName = name;
}

const muteButton = {
  x: 0,
  y: 0,
  w: 54,
  h: 36
};

// ======================================================
// NODE GRAPH
// ======================================================

const nodes = {
  A:   { id: "A",   x: 870, y: 230,  neighbors: ["S", "G"] },
//  B:   { id: "B",   x: 100, y: 230,  neighbors: ["A", "C"] },
  B: { id: "B", x: 100, y: 230, neighbors: ["S", "C"], ladderExit: true },


  // C:   { id: "C",   x: 100, y: 530,  neighbors: ["B", "CR1", "H"] },
  C: { id: "C", x: 100, y: 530, neighbors: ["B", "CR1", "H"], ladderExit: true },
  D:   { id: "D",   x: 360, y: 530,  neighbors: ["CR1", "E"] },

  E:   { id: "E",   x: 525, y: 645,  neighbors: ["D", "F", "G", "S"], inputMap: { up: "S", left: "D", right: "G", down: "F" } },
  F:   { id: "F",   x: 600, y: 720,  neighbors: ["E", "CB1"] },

  G:   { id: "G",   x: 715,  y: 440,  neighbors: ["A", "E", "O"] },
  // O:   { id: "O",   x: 955, y: 440,  neighbors: ["G", "N"] },
  O: { id: "O", x: 955, y: 440, neighbors: ["G", "N"], ladderExit: true },

  // N:   { id: "N",   x: 955, y: 720,  neighbors: ["O", "CB1", "M"] },
  N: { id: "N", x: 955, y: 720, neighbors: ["O", "CB1", "M"], ladderExit: true },

  // H:   { id: "H",   x: 100, y: 820,  neighbors: ["C", "J", "I"] },
  H: { id: "H", x: 100, y: 820, neighbors: ["I", "C", "CY1"], ladderExit: true },
  // I:   { id: "I",   x: 100, y: 1220, neighbors: ["H", "R", "CB3"] },
  I: { id: "I", x: 100, y: 1220, neighbors: ["H", "R", "CB3"], ladderExit: true },

  J:   { id: "J",   x: 400, y: 820,  neighbors: ["K", "CY1"] },
  K:   { id: "K",   x: 530, y: 950,  neighbors: ["J", "M", "L"] },

  // M:   { id: "M",   x: 710, y: 850,  neighbors: ["K", "N", "L"] },
  M: { id: "M", x: 710, y: 850, neighbors: ["K", "N", "L"], ladderExit: true },
  // L:   { id: "L",   x: 710, y: 1110, neighbors: ["K", "M", "P", "CR3"] },
  // L: { id: "L", x: 710, y: 1110, neighbors: ["K", "M", "P", "CR3"], ladderExit: true },
  L: { id: "L", x: 710, y: 1110, neighbors: ["K", "M", "P", "CR3"], inputMap: { up: "M", left: "K", right: "CR3", down: "P" }, ladderExit: true },

  // P:   { id: "P",   x: 530, y: 1220, neighbors: ["CB3", "L", "Q"] },
  // Q:   { id: "Q",   x: 530, y: 1450, neighbors: ["P", "R"] },
  P: { id: "P", x: 530, y: 1220, neighbors: ["CB3", "L", "Q"], ladderExit: true },
  Q: { id: "Q", x: 530, y: 1450, neighbors: ["P", "CY3"], ladderExit: true },
  R:   { id: "R",   x: 100, y: 1450, neighbors: ["I", "CY3"] },
  S:   { id: "S",   x: 525, y: 230,  neighbors: ["B", "A", "E"], inputMap: { left: "B", right: "A", down: "E" }, ropePassThrough: true },
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
    inputMap: { up: "CB4", left: "I", right: "P", down: "P" },
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

const bossNodes = {
  // ======================================================
  // BOTTOM PLATFORM
  // ======================================================
  START: { id: "START", x: 170, y: 1310, neighbors: ["L1D"] },
  // B0:    { id: "B0",    x: 285, y: 1315, neighbors: ["START", "B1", "L1D"] },
  // B1:    { id: "B1",    x: 520, y: 1295, neighbors: ["B0", "B2"] },
  // B2:    { id: "B2",    x: 780, y: 1278, neighbors: ["B1", "L2D"] },

  // left ladder to lower slope
  L1D:   { id: "L1D",   x: 340, y: 1290, neighbors: ["START", "L2D", "L1U"], ladderExit: true },
  L1U:   { id: "L1U",   x: 340, y: 1005,  neighbors: ["L1D", "S1D", "L3D"], ladderExit: true },

    // small short ladder left
  S1D:   { id: "S1D",   x: 200, y: 920,  neighbors: ["S1U", "L1U"], ladderExit: true },
  S1U:  { id: "S1U",  x: 200, y: 820,  neighbors: ["S1D", "R1B", "M1"], ladderExit: true },

  // right ladder to lower slope
  L2D:   { id: "L2D",   x: 825, y: 1215, neighbors: ["L1D", "L2U"], ladderExit: true },
  L2U:   { id: "L2U",   x: 825, y: 1055,  neighbors: ["L2D", "R2B", "M0"], ladderExit: true },

  // ======================================================
  // LOWER SLOPE (left higher -> right lower)
  // ======================================================
  M0:    { id: "M0",    x: 695, y: 1020,  neighbors: ["L2U", "L3D", "M0C"], inputMap: { up: "M0C", left: "L3D", right: "L2U" }, cavePassThrough: true },
  // M0C:    { id: "M0C",    x: 695, y: 950,  neighbors: ["M0"], stopHere: true },
  M1:    { id: "M1",    x: 280, y: 800,  neighbors: ["S1U", "M1C", "L5B"], inputMap: { up: "M1C", left: "S1U", right: "L5B" }, cavePassThrough: true },
  // M1C:    { id: "M1C",    x: 280, y: 740,  neighbors: ["M1"] },
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
  L3D:   { id: "L3D",   x: 500, y: 970,  neighbors: ["L1U", "L3U", "M0"], ladderExit: true },
  L3U:   { id: "L3U",   x: 500, y: 740,  neighbors: ["L3D", "L4D", "L5B"], ladderExit: true },

  // left rope from upper shelf down
  R1B: {
    id: "R1B",
    x: 85,
    y: 790,
    neighbors: ["S1U", "R1M"],
    inputMap: { up: "R1M", right: "S1U" },
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
    neighbors: ["R2N", "L4D"],
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
  L4D:   { id: "L4D",   x: 690, y: 690, neighbors: ["L5B", "L4U", "R2T"], ladderExit: true },
  L4U:   { id: "L4U",   x: 690, y: 490, neighbors: ["L4D", "L5D"], ladderExit: true },

  L5D:   { id: "L5D",   x: 340, y: 450, neighbors: ["R1T", "L4U", "L5N", "GOAL"], stopHere: true },
  L5B:   { id: "L5B",   x: 380, y: 740, neighbors: ["L3U", "M1", "L5C"], stopHere: true },
  L5C:   { id: "L5C",   x: 400, y: 620, neighbors: ["L5B", "L5N"], stopHere: false },
  L5N:   { id: "L5N",   x: 390, y: 520, neighbors: ["L5D", "L5C"], stopHere: false },
  // L5U:   { id: "L5U",   x: 315, y: 330, neighbors: ["L4D", "GOAL"], ladderExit: true },

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
  ["TOP", "L5D", "M1", "S1D", "L1U", "L1D", "START"],
  ["TOP", "L4U", "L4D", "L3U", "L3D", "M0", "L2U", "L2D"],
  ["TOP", "R2T", "R2B", "L2U", "L2D"]
];

// function getBossScale(x, y) {
//   if (!isBossScene()) return 1;

//   // tune rectangles to your ledges
//   const zones = [
//     { x: 220, y: 860, w: 430, h: 180 }, // M0
//     { x: 160, y: 660, w: 320, h: 140 }  // M1
//   ];

//   return zones.some(z =>
//     x >= z.x && x <= z.x + z.w &&
//     y >= z.y && y <= z.y + z.h
//   ) ? 0.8 : 1.0;
// }

function getBossScale(x, y) {
  return 1;
}

const HOME_NODE = "A";
const BANANA_NODE_IDS = ["D", "E", "F", "G", "J", "K", "M", "L", "N", "P"];

// ======================================================
// ASSETS
// ======================================================
const backgroundImage = new Image();
backgroundImage.src = "assets/monkeymountain.png";

function loadSprites() {
  spriteStore.lilJabRun = new Image();
  spriteStore.lilJabRun.src = "sprites/jab-sprite.png";

  spriteStore.troopRun = new Image();
  spriteStore.troopRun.src = "sprites/troop-sprite.png";

  spriteStore.zookeeper1 = new Image();
  spriteStore.zookeeper1.src = "sprites/zookeeper-1.png";

  spriteStore.zookeeper2 = new Image();
  spriteStore.zookeeper2.src = "sprites/zookeeper-2.png";

  spriteStore.levelUpArt = new Image();
  spriteStore.levelUpArt.src = "assets/levelup-monkeys.png";

  spriteStore.mother = new Image();
  spriteStore.mother.src = "assets/mother-plush.png";

  spriteStore.bossBackground = new Image();
  spriteStore.bossBackground.src = "assets/boss-mountain.png";

  spriteStore.bananaBonanzaCard = new Image();
  spriteStore.bananaBonanzaCard.src = "assets/banana-bonanza-card.png";

  spriteStore.coconutKongCard = new Image();
  spriteStore.coconutKongCard.src = "assets/coconut-kong-card.png";

  spriteStore.feedingTimeCard = new Image();
  spriteStore.feedingTimeCard.src = "assets/feeding-time-card.png";

  spriteStore.gameOverCard = new Image();
  spriteStore.gameOverCard.src = "assets/game-over-card.png";

  spriteStore.youWinCard = new Image();
  spriteStore.youWinCard.src = "assets/you-win-card.png";
}

function loadSounds() {
  sounds.pickup = new Audio("assets/pickup.mp3");
    sounds.pickup.volume = 0.75;
  sounds.catch = new Audio("assets/catch.mp3");
    sounds.catch.volume = 0.75;
  sounds.score = new Audio("assets/score.mp3");
    sounds.score.volume = 0.75;
  sounds.step = new Audio("assets/step.mp3");
  sounds.panic = new Audio("assets/panic.mp3");
    sounds.panic.volume = 0.75;
  sounds.music = new Audio("assets/jungle_jumpin.ogg");
  sounds.music.loop = true;
  sounds.bossMusic = new Audio("assets/boss-loop.ogg");
  sounds.bossMusic.loop = true;
  //sounds.bossMusic.volume = 0.75;
  applyMuteState();
}

loadSprites();
loadSounds();

// ======================================================
// HELPERS
// ======================================================

function stopAllMusic() {
  if (sounds.music) {
    sounds.music.pause();
    sounds.music.currentTime = 0;
  }
  if (sounds.bossMusic) {
    sounds.bossMusic.pause();
    sounds.bossMusic.currentTime = 0;
  }
}

function playSceneMusic() {
  stopAllMusic();

  const track = isBossScene() ? sounds.bossMusic : sounds.music;
  if (track) {
    track.play().catch(() => {});
  }
}

function getLevelCardImage(level) {
  if (level % 2 === 0) {
    return spriteStore.coconutKongCard;
  }
  return spriteStore.bananaBonanzaCard;
}
// function getLevelCardImage(level) {
//   if (level % 3 === 0) {
//     return spriteStore.feedingTimeCard;
//   }
//   if (level % 2 === 0) {
//     return spriteStore.coconutKongCard;
//   }
//   return spriteStore.bananaBonanzaCard;
// }

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

function playMusicOnce() {
  if (musicStarted || !sounds.music) return;
  musicStarted = true;
  sounds.music.currentTime = 0;
  sounds.music.play().catch(() => {});
}

function applyMuteState() {
  for (const key in sounds) {
    if (sounds[key]) {
      sounds[key].muted = state.isMuted;
    }
  }
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  applyMuteState();
}

function getCurrentNodeMap() {
  return state.scene === "boss" ? bossNodes : nodes;
}

function getCurrentBackgroundImage() {
  return state.scene === "boss" ? spriteStore.bossBackground : backgroundImage;
}

function startBossNodeTest() {
  state.scene = "boss";

  if (!state.player) {
    state.player = new Player(bossConfig.startNode);
  }

  const start = bossNodes[bossConfig.startNode];
  state.player.currentNode = bossConfig.startNode;
  state.player.previousNode = null;
  state.player.targetNode = null;
  state.player.x = start.x;
  state.player.y = start.y;

  state.boss = {
    coconutTimer: 0,
    mother: {
      carried: false,
      nodeId: bossConfig.motherStartNode
    }
  };
}

function showBossIntro(level) {
  state.loadScreenImage = getLevelCardImage(level);

  state.bossIntro = {
    level,
    time: 0,
    duration: 3.8
  };
}

function showLevelIntro(level) {
  state.loadScreenImage = getLevelCardImage(level);

  state.levelIntro = {
    level,
    time: 0,
    duration: 2.6
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
    const level = state.levelIntro.level;
    state.levelIntro = null;

    // temporary routing until Feeding Time exists
    state.scene = "main";
    resetActors();
    applyLevelConfig();
    newRound();
    playSceneMusic();
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

  // if (errors.length) {
  //   console.warn("Graph validation errors:");
  //   errors.forEach(err => console.warn(err));
  // } else {
  //   console.log("Graph is valid.");
  // }
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

function startBossMode() {
  state.scene = "boss";
  state.mode = "playing";
  state.cardBackground = spriteStore.bossBackground;
  state.catchAnim = null;
  state.hearts = [];
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

  spawnBossRoamers();
  playSceneMusic();
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
  if (state.level > 1 && state.level % 2 === 0) {
    showBossIntro(state.level);
    return;
  }

  showLevelIntro(state.level);
}

// function showBossIntro(level) {
//   state.bossIntro = {
//     level,
//     time: 0,
//     duration: 1.8
//   };
// }

function updateBossIntro(dt) {
  if (!state.bossIntro) return;

  state.bossIntro.time += dt;

  if (state.bossIntro.time >= state.bossIntro.duration) {
    state.bossIntro = null;
    startBossMode();
  }
}

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

  // ctx.strokeStyle = "rgba(0,0,0,0.35)";
  // ctx.lineWidth = 8;
  // ctx.fillStyle = "#ffe066";
  // ctx.font = "bold 82px Arial";
  // ctx.strokeText("Boss Round", canvas.width / 2, 300);
  // ctx.fillText("Boss Round", canvas.width / 2, 300);

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

// function drawBackground() {
//   if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
//     ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
//   } else {
//     ctx.fillStyle = "#273b59";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   }
// }

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
  ctx.font = "26px Arial";
  ctx.fillStyle = "#c8ffd8";

  const leftX = pad;
  const centerX = canvas.width / 2;
  const rightTextX = canvas.width - 110;

  // CENTER: banana ripeness/state
  let ripenessText = "Airborne";
  if (state.player?.hasBanana) {
    ripenessText = "secured";
  } else if (state.banana?.landed) {
    ripenessText = ripenessLabel(state.banana.age).label;
  }

  // ctx.textAlign = "center";
  // ctx.fillText(`Ripeness: ${ripenessText}`, centerX, h / 2);

  // LEFT: score / acceptance / level
  ctx.textAlign = "left";
  ctx.fillText(
    `Score: ${state.score}   Level: ${state.level ?? 1}   Ripeness: ${ripenessText} `,
    leftX,
    h / 2
  );

  // drawAcceptanceHearts();
  if (isBossScene() && state.boss) {
    drawBossHeartHud();
  } else {
    drawAcceptanceHearts();
  }
  // RIGHT: lives
  ctx.textAlign = "right";
  ctx.fillText(`Lives: ${state.lives}`, rightTextX, h / 2);

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
  ctx.fillText(state.isMuted ? "🔇" : "🔊", muteButton.x + muteButton.w / 2, muteButton.y + muteButton.h / 2 + 1);

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
  const line = state.mode === "start"
    ? "Tap or use spacebar to start the Banana Bonanza round!"
    : "Lil' Jab was tossed too many times. Tap to try again.";
  ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 8);

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
  }

  tryStartMove() {
    if (this.targetNode || !queuedDirection) return;

    // const nextId = getBestNeighbor(this.currentNode, queuedDirection);
    const nextId = getBestNeighbor(this.currentNode, queuedDirection, queuedDirectionName);
    if (!nextId) return;

    this.targetNode = nextId;
    }

update(dt) {
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

//   draw() {
//     ctx.save();
//     ctx.translate(this.x, this.y);

//     const img = spriteStore.lilJabRun;
//     if (img?.complete && img.naturalWidth > 0) {
//       const frameWidth = img.width / 4;
//       const frameHeight = img.height / 3;
//       drawSheetFrame(img, this.frame, this.facing, frameWidth, frameHeight, 96, 96);
//     } else {
//       ctx.fillStyle = this.hasBanana ? "#ffd54a" : "#ffeb66";
//       ctx.beginPath();
//       ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
//       ctx.fill();

//       ctx.fillStyle = "#000";
//       ctx.beginPath();
//       ctx.arc(8, -8, 3, 0, Math.PI * 2);
//       ctx.fill();
//     }

//     if (this.hasBanana) {
//       drawBanana(18, -18, 0.45, state.banana?.age || 0);
//     }

//     ctx.restore();
//   }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    const s = getBossScale(this.x, this.y);
    ctx.scale(s, s);

    const img = spriteStore.lilJabRun;
    if (img?.complete && img.naturalWidth > 0) {
      const frameWidth = img.width / 4;
      const frameHeight = img.height / 3;
      drawSheetFrame(img, this.frame, this.facing, frameWidth, frameHeight, 96, 96);
    } else {
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
    state.mode = "playing";
    startGame();
    playMusicOnce();
    return;
  }

  if (state.mode === "gameOver") {
    state.mode = "playing";
    startGame();
    playMusicOnce();
  }
}

function resetActors() {
  state.player = new Player(HOME_NODE);
  state.troops = [
    new Troop("N", "#7c5c46"),
    new Troop("M", "#6c4d39"),
    new Troop("K", "#8d6b52")
  ];
}

function startGame() {
  state.scene = "main";
  state.boss = null;
  state.cardBackground = backgroundImage;
  state.loadScreenImage = getLevelCardImage(1);
  // state.mode = "playing";
  state.score = 0;
  state.lives = 3;
  state.hearts = [];
  state.particles = [];
  state.catchAnim = null;
  state.acceptance = 0;
  state.level = 1;
  state.levelUp = null;
  state.zookeeper = { anim: "idle", frame: 0, time: 0, didThrowSound: false };
  state.zookeeper2 = { anim: "idle", frame: 0, time: 0, timer: rand(2.5, 6) };

  resetActors();
  applyLevelConfig();
  newRound();
  playSceneMusic();
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

function tossBanana() {
  const targetNodeId = choose(BANANA_NODE_IDS);
  const to = nodes[targetNodeId];

  state.zookeeper = {
    anim: "throw",
    frame: 0,
    time: 0,
    didThrowSound: false
  };

  state.banana = {
    nodeId: targetNodeId,
    x: to.x,
    y: to.y,
    targetX: to.x,
    targetY: to.y,
    landed: false,
    age: 0,
    size: 1
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
  // state.player.speed = mother.carried ? 210 : 280;
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

  if (mother.carried) {
    ctx.save();

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, state.player.x - 36, state.player.y - 36, 156, 156);
    } else {
      ctx.fillStyle = "#d8b38a";
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y - 40, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

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

function dropMother() {
  const mother = state.boss?.mother;
  if (!mother || !mother.carried) return;

  mother.carried = false;
  mother.nodeId = state.player.currentNode;
}

function resetBossPlayerToStart() {
  const start = bossNodes[bossConfig.startNode];
  if (!start || !state.player) return;

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
}

// function pickupMotherIfSafe() {
//   const mother = state.boss?.mother;
//   if (!mother || mother.carried) return;
//   if (state.player.currentNode !== mother.nodeId) return;

//   const danger = getBossDangerAtPlayer();
//   if (danger < 0.35) {
//     mother.carried = true;
//   }
// }

function pickupMotherIfSafe() {
  const mother = state.boss?.mother;
  if (!mother || mother.carried) return;
  if (state.player.currentNode !== mother.nodeId) return;

  mother.carried = true;
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
  getCurrentNodeMap();
  state.player.update(dt);

  if (state.player.movedThisRound && state.roundState === "waiting" && state.banana?.landed) {
    state.roundState = "chase";
  }

  if (state.player.hasBanana) {
    const home = nodes[HOME_NODE];
    if (Math.hypot(state.player.x - home.x, state.player.y - home.y) < 40) {
      const ripeness = ripenessLabel(state.banana.age);
      state.score += ripeness.points;
      addAcceptance(1);
      state.hearts.push({ x: home.x - 10, y: home.y - 20, t: 0 });
      state.particles.push({ kind: "bananaDrop", x: home.x + 30 + state.score * 6, y: home.y + 30, t: 0 });
      sounds.score?.play().catch(() => {});
      triggerZookeeper2("react");
      newRound();
    }
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
  getCurrentNodeMap();
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

function updateBossCollisions() {
  const player = state.player;
  const mother = state.boss?.mother;
  if (!player || !mother) return;

  for (const troop of state.troops) {
    if (Math.hypot(player.x - troop.x, player.y - troop.y) < 34) {
      if (mother.carried) {
        //dropMother();
        dropMotherAndResetPlayer();
      } else {
        state.lives = Math.max(0, state.lives - 1);
        restartBossLevel();
        if (state.lives <= 0) {
          // whatever your existing game over / restart flow is
        }
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
  state.level += 1;
  state.scene = "main";
  state.boss = null;
  state.coconuts = [];
  state.troops = [];

  showLevelUp(state.level);
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

      musicStarted = false;
    } else {
      newRound();
    }
  }
}

function updateParticles(dt) {
  state.hearts.forEach(h => h.t += dt);
  state.hearts = state.hearts.filter(h => h.t < 1.1);

  state.particles.forEach(p => p.t += dt);
  state.particles = state.particles.filter(p => p.t < 1);
}

function update(dt) {
  if (state.levelUp) {
    updateLevelUp(dt);
    return;
  }

  if (state.bossIntro) {
    updateBossIntro(dt);
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
//   drawBackground();

//   if (!isBossScene()) {
//     drawBananaState();
//     drawZookeeper();
//     drawZookeeper2();
//     drawActors();
//   } else {
//     drawBossActors();
//     drawBossMother();
//   }
// // drawNodeLabels();
// // drawPathOverlay(getCurrentNodeMap());
//   drawHudOverlay();
//   drawOverlay();
//   drawBossIntroOverlay();
//   drawLevelUpOverlay();
//   drawCavePreview();
// }

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

const showingTransitionCard =
  !!state.levelUp ||
  !!state.bossIntro ||
  !!state.levelIntro ||   // <-- THIS WAS MISSING
  state.mode !== "playing";
  
  if (showingTransitionCard) {
    // During start screen / level-up / boss intro,
    // do NOT draw the live game scene underneath.
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    drawBackground();

    if (!isBossScene()) {
      drawBananaState();
      drawZookeeper();
      drawZookeeper2();
      drawActors();
    } else {
      drawBossActors();
      drawBossMother();
    }

    drawHudOverlay();
    drawCavePreview();
  }
  // drawNodeLabels();
  // drawPathOverlay(getCurrentNodeMap());
  drawOverlay();
  drawBossIntroOverlay();
  drawLevelIntroOverlay();
  drawLevelUpOverlay();
}

function isInBossShadowZone(x, y) {
  // Tune these rectangles to match your awning/ledge areas
  const zones = [
    { x: 220, y: 860, w: 430, h: 180 }, // M0 / lower sheltered zone
    { x: 160, y: 660, w: 320, h: 140 }  // M1 / upper sheltered zone
  ];

  return zones.some(z =>
    x >= z.x &&
    x <= z.x + z.w &&
    y >= z.y &&
    y <= z.y + z.h
  );
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

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  if (pointInRect(x, y, muteButton)) {
    toggleMute();
    return;
  }

  beginGame();
  touchStart = { x, y };
  swipeHandled = false;
}, { passive: false });

canvas.addEventListener("pointermove", (e) => {
  if (!touchStart || !state.player) return;

  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const dx = x - touchStart.x;
  const dy = y - touchStart.y;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    setQueuedDirection(dx > 0 ? 1 : -1, 0, dx > 0 ? "right" : "left");
  } else {
    setQueuedDirection(0, dy > 0 ? 1 : -1, dy > 0 ? "down" : "up");
  }

  // reset anchor so another swipe can be detected immediately
  touchStart = { x, y };
}, { passive: false });

canvas.addEventListener("pointerup", () => {
  touchStart = null;
  swipeHandled = false;
}, { passive: true });

canvas.addEventListener("pointercancel", () => {
  touchStart = null;
  swipeHandled = false;
}, { passive: true });

canvas.addEventListener("click", () => {
  beginGame();
});

document.addEventListener("keydown", (e) => {
if (e.key === "n" || e.key === "N") {
  showBossIntro(state.level ?? 1);
  e.preventDefault();
}
  if (e.key === "ArrowLeft") {
    setQueuedDirection(-1, 0, "left");
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    setQueuedDirection(1, 0, "right");
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    setQueuedDirection(0, -1, "up");
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    setQueuedDirection(0, 1, "down");
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
