const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1536;

// ======================================================
// CONFIG
// ======================================================
const DEBUG = true;
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
  mode: "start", // start, playing, gameOver
  lastTime: 0,
  score: 0,
  lives: 3,
  acceptance: 0,
  nextAcceptanceUnlock: 10,
  player: null,
  troops: [],
  banana: null,
  hand: null,
  hearts: [],
  particles: [],
  catchAnim: null,
  zookeeper: { anim: "idle", frame: 0, time: 0, didThrowSound: false },
  zookeeper2: { anim: "idle", frame: 0, time: 0, timer: 3.5 },
  roundState: "waiting"
};

let musicStarted = false;
let touchStart = null;
let swipeHandled = false;
let queuedDirection = null;
let queuedDirectionName = null;

function setQueuedDirection(x, y, name) {
  queuedDirection = { x, y };
  queuedDirectionName = name;
  console.log("queued:", name);
}

// ======================================================
// NODE GRAPH
// ======================================================
const nodes = {
  A:   { id: "A",   x: 850, y: 230,  neighbors: ["B", "G"] },
  B:   { id: "B",   x: 100, y: 230,  neighbors: ["A", "C"] },

  C:   { id: "C",   x: 100, y: 530,  neighbors: ["B", "CR1", "H"] },
  D:   { id: "D",   x: 360, y: 530,  neighbors: ["CR1", "E"] },

  E:   { id: "E",   x: 530, y: 670,  neighbors: ["D", "F", "G"] },
  F:   { id: "F",   x: 600, y: 720,  neighbors: ["E", "CB1"] },

  G:   { id: "G",   x: 710, y: 440,  neighbors: ["A", "E", "O"] },
  O:   { id: "O",   x: 955, y: 440,  neighbors: ["G", "N"] },

  N:   { id: "N",   x: 955, y: 720,  neighbors: ["O", "CB1", "M"] },

  H:   { id: "H",   x: 100, y: 820,  neighbors: ["C", "J", "I"] },
  I:   { id: "I",   x: 100, y: 1220, neighbors: ["H", "R", "CB3"] },

  J:   { id: "J",   x: 400, y: 820,  neighbors: ["H", "K"] },
  K:   { id: "K",   x: 530, y: 950,  neighbors: ["J", "M", "L"] },

  M:   { id: "M",   x: 710, y: 850,  neighbors: ["K", "N", "L"] },
  L:   { id: "L",   x: 710, y: 1110, neighbors: ["K", "M", "P", "CR3"] },

  P:   { id: "P",   x: 530, y: 1220, neighbors: ["CB3", "L", "Q"] },
  Q:   { id: "Q",   x: 530, y: 1450, neighbors: ["P", "R"] },
  R:   { id: "R",   x: 100, y: 1450, neighbors: ["Q", "I"] },

  // red upper-left cave: inline path node
  CR1: {
    id: "CR1",
    x: 250,
    y: 530,
    neighbors: ["C", "D", "CR2"],
    inputMap: { up: "CR2", left: "C", right: "D", down: "D" },
    stopHere: true
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
    stopHere: true
  },
  CB2: {
    id: "CB2",
    x: 820,
    y: 610,
    neighbors: ["CB1"],
    inputMap: { down: "CB1" }
  },

  // blue lower-left cave: inline path node
  CB3: {
    id: "CB3",
    x: 250,
    y: 1220,
    neighbors: ["I", "P", "CB4"],
    inputMap: { up: "CB4", left: "I", right: "P", down: "P" },
    stopHere: true
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
    stopHere: true
  },
  CR4: {
    id: "CR4",
    x: 820,
    y: 1035,
    neighbors: ["CR3"],
    inputMap: { down: "CR3" }
  }
};

const portals = {
  CB2: "CB4",
  CB4: "CB2",
  CR2: "CR4",
  CR4: "CR2"
};

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
}

function loadSounds() {
  sounds.pickup = new Audio("assets/pickup.mp3");
  sounds.catch = new Audio("assets/catch.mp3");
  sounds.score = new Audio("assets/score.mp3");
  sounds.step = new Audio("assets/step.mp3");
  sounds.panic = new Audio("assets/panic.mp3");
  sounds.music = new Audio("assets/jungle_jumpin.ogg");
  sounds.music.loop = true;
  sounds.music.volume = 0.75;
}

loadSprites();
loadSounds();

// ======================================================
// HELPERS
// ======================================================
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function nodePos(id) {
  return nodes[id];
}

function playMusicOnce() {
  if (musicStarted || !sounds.music) return;
  musicStarted = true;
  sounds.music.currentTime = 0;
  sounds.music.play().catch(() => {});
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

  if (errors.length) {
    console.warn("Graph validation errors:");
    errors.forEach(err => console.warn(err));
  } else {
    console.log("Graph is valid.");
  }
}

function getBestNeighbor(currentNodeId, inputVec, inputName) {
  const current = nodes[currentNodeId];
  if (!current) return null;

  // explicit override first
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
    const neighbor = nodes[neighborId];
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

  console.log(
    `TURN USED at ${actor.currentNode}: ${queuedDirectionName} -> ${nextId}`
  );

  queuedDirection = null;
  queuedDirectionName = null;
  return true;
}

function tryContinueForward(actor) {
  const current = nodes[actor.currentNode];
  if (!current || !actor.previousNode) return false;

  if (current.stopHere) {
    console.log("STOP NODE:", actor.currentNode);
    return false;
  }

  const options = current.neighbors.filter(n => n !== actor.previousNode);

  if (options.length === 1) {
    console.log("AUTO-CONTINUE:", actor.currentNode, "->", options[0]);
    actor.targetNode = options[0];
    return true;
  }

  return false;
}

function inputVectorFromNodes(fromId, toId) {
  const a = nodes[fromId];
  const b = nodes[toId];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

// ======================================================
// DRAWING HELPERS
// ======================================================
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
    -drawWidth * 2,
    -drawHeight * 2,
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

function drawBanana(x, y, scale = 1, age = 0) {
  const ripeness = ripenessLabel(age);

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
  if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#273b59";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawHudOverlay() {
  const pad = 40;
  const h = 54;

  ctx.save();

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, h);

  const fontSize = Math.max(16, Math.floor(canvas.width * 0.018));
  ctx.textBaseline = "middle";
  ctx.font = `${Math.floor(fontSize * 0.8)}px Arial`;
  ctx.fillStyle = "#c8ffd8";

  ctx.textAlign = "left";
  ctx.fillText(`Score: ${state.score}   Acceptance: ${state.acceptance ?? 0}`, pad, h / 2);

  let ripenessText = "airborne";
  if (state.player?.hasBanana) {
    ripenessText = "secured";
  } else if (state.banana?.landed) {
    ripenessText = ripenessLabel(state.banana.age).label;
  }

  ctx.textAlign = "center";
  ctx.fillText(`Ripeness: ${ripenessText}`, canvas.width / 2, h / 2);

  ctx.textAlign = "right";
  ctx.fillText(`Lives: ${state.lives}`, canvas.width - pad, h / 2);

  ctx.restore();
}

function drawOverlay() {
  if (state.mode === "playing") return;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff8dc";
  ctx.textAlign = "center";
  ctx.font = "bold 44px Arial";
  ctx.fillText("Monkey Mountain Madness", canvas.width / 2, canvas.height / 2 - 40);

  ctx.font = "20px Arial";
  const line = state.mode === "start"
    ? "Tap or use spacebar to start the Banana Banzai!"
    : "Lil' Jab was tossed too many times. Tap to try again.";
  ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 8);

  ctx.font = "16px Arial";
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

  ctx.save();
  ctx.strokeStyle = "rgba(255,0,0,0.9)";
  ctx.lineWidth = 6;
  ctx.fillStyle = "#6fd3ff";

  const drawn = new Set();

  for (const id in nodes) {
    const node = nodes[id];
    for (const neighborId of node.neighbors) {
      const key = [id, neighborId].sort().join("-");
      if (drawn.has(key)) continue;
      const n2 = nodes[neighborId];
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
      drawn.add(key);
    }
  }

for (const id in nodes) {
  const node = nodes[id];

  if (id.startsWith("CB")) {
        ctx.fillStyle = id.endsWith("1") || id.endsWith("3") ? "#60a5fa" : "#2563eb";
    } else if (id.startsWith("CR")) {
        ctx.fillStyle = id.endsWith("1") || id.endsWith("3") ? "#f87171" : "#dc2626";
    } else {
        ctx.fillStyle = "#6fd3ff";
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawNodeLabels() {
  if (!DEBUG) return;

  ctx.save();
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const id in nodes) {
    const node = nodes[id];
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

  const current = nodes[state.player.currentNode];
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
    const target = nodes[state.player.targetNode];
    ctx.save();
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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
    50, 65,
    156, 156
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
    505, 380,
    156, 156
  );
}

function handlePortalTravel(actor) {
  if (!actor || !actor.currentNode) return;

  const destinationId = portals[actor.currentNode];
  if (!destinationId) return;

  const dest = nodes[destinationId];
  if (!dest) return;

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
    this.speed = 280;
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
  }

  tryStartMove() {
    if (this.targetNode || !queuedDirection) return;

    // const nextId = getBestNeighbor(this.currentNode, queuedDirection);
    const nextId = getBestNeighbor(this.currentNode, queuedDirection, queuedDirectionName);
    if (!nextId) return;

    this.targetNode = nextId;
    }

update(dt) {
  // immediate reversal while traveling
  if (this.targetNode && queuedDirection) {
    const from = nodes[this.currentNode];
    const to = nodes[this.targetNode];

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

      console.log("REVERSE");
    }
  }

  // if standing still at a node, try queued turn first
  if (!this.targetNode) {
    if (!tryConsumeQueuedTurn(this)) {
      this.dir = { x: 0, y: 0 };
      updateAnim(this, dt, 12);
      return;
    }
  }

  const target = nodePos(this.targetNode);
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

    console.log("ARRIVED:", this.currentNode);

    handlePortalTravel(this);

    // after landing: queued turn first, otherwise continue straight if possible
    if (!tryConsumeQueuedTurn(this)) {
      tryContinueForward(this);
    }
  } else {
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  updateAnim(this, dt, 12);
}

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    const img = spriteStore.lilJabRun;
    if (img?.complete && img.naturalWidth > 0) {
      const frameWidth = img.width / 4;
      const frameHeight = img.height / 3;
      drawSheetFrame(img, this.frame, this.facing, frameWidth, frameHeight, 72, 72);
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
    this.speed = 220;
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
  }

    chooseNextNode() {
    const current = nodes[this.currentNode];
    if (!current) return null;

        const candidates = current.neighbors.filter(n => n !== this.previousNode);
        const pool = candidates.length ? candidates : current.neighbors;
        if (!pool.length) return null;

        const player = state.player;

        // chase only when player has banana
        if (player && player.hasBanana) {
            let best = null;
            let bestDist = Infinity;

            for (const candidate of pool) {
            const p = nodes[candidate];
            const d = Math.hypot(player.x - p.x, player.y - p.y);
            if (d < bestDist) {
                bestDist = d;
                best = candidate;
            }
            }

            return best;
        }

        // otherwise wander randomly
        return choose(pool);
    }

  update(dt) {
    if (!this.targetNode) {
      const next = this.chooseNextNode();
      if (next) this.targetNode = next;
    }

    if (!this.targetNode) {
      this.dir = { x: 0, y: 0 };
      updateAnim(this, dt, 10);
      return;
    }

    const target = nodes[this.targetNode];
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

    const img = spriteStore.troopRun;
    if (img?.complete && img.naturalWidth > 0) {
      const frameWidth = img.width / 4;
      const frameHeight = img.height / 3;
      drawSheetFrame(img, this.frame, this.facing, frameWidth, frameHeight, 68, 68);
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
  state.acceptance = Math.max(0, (state.acceptance || 0) + amount);
  if ((state.acceptance || 0) >= (state.nextAcceptanceUnlock || 10)) {
    state.nextAcceptanceUnlock += 10;
  }
}

function ripenessLabel(age) {
  if (age >= 9) return { label: "golden", points: 3, color: "#facc15" };
  if (age >= 5) return { label: "yellow", points: 2, color: "#fde047" };
  return { label: "green", points: 1, color: "#4ade80" };
}

function beginGame() {
  if (state.mode !== "playing") {
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
  state.mode = "playing";
  state.score = 0;
  state.lives = 3;
  state.hearts = [];
  state.particles = [];
  state.catchAnim = null;
  state.acceptance = 0;
  state.nextAcceptanceUnlock = 10;
  state.zookeeper = { anim: "idle", frame: 0, time: 0, didThrowSound: false };
  state.zookeeper2 = { anim: "idle", frame: 0, time: 0, timer: rand(2.5, 6) };
  resetActors();
  newRound();
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

function updatePlayer(dt) {
  if (!state.player) return;

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

  for (const troop of state.troops) {
    if (distance(state.player, troop) < 34) {
      startCatch(troop);
      break;
    }
  }
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
      if (sounds.music) {
        sounds.music.pause();
        sounds.music.currentTime = 0;
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
  if (state.mode !== "playing") return;

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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  // drawGraph();
  // drawNodeLabels();
  // drawNodeHighlights();
  drawBananaState();
  drawActors();
  drawZookeeper();
  drawZookeeper2();
  drawHudOverlay();
  drawOverlay();
}

// ======================================================
// INPUT
// ======================================================
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  beginGame();
  touchStart = { x: e.clientX, y: e.clientY };
  swipeHandled = false;
}, { passive: false });

canvas.addEventListener("pointermove", (e) => {
  if (!touchStart || swipeHandled || !state.player) return;

  e.preventDefault();

  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    setQueuedDirection(dx > 0 ? 1 : -1, 0, dx > 0 ? "right" : "left");
  } else {
    setQueuedDirection(0, dy > 0 ? 1 : -1, dy > 0 ? "down" : "up");
  }

  swipeHandled = true;
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
function loop(ts) {
  const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
  state.lastTime = ts;
  update(dt || 0);
  draw();
  requestAnimationFrame(loop);
}

// ======================================================
// STARTUP
// ======================================================
validateGraph();
requestAnimationFrame(loop);
