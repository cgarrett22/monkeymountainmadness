/**
 * TROOP.JS - Enemy/NPC Troop Class
 * Organized by: Initialization, Core Update, AI & Movement, Rendering
 */

export class Troop {
  // ======================================================
  // 1. CONSTRUCTOR & INITIALIZATION
  // ======================================================
  constructor(startNodeId, color = "#7c5c46", deps) {
    this.deps = deps;
    const p = deps.nodePos(startNodeId);
    
    // Position & Identification
    this.startNodeId = startNodeId;
    this.currentNode = startNodeId;
    this.previousNode = null;
    this.targetNode = null;
    this.x = p.x;
    this.y = p.y;
    this.radius = 20;

    // Movement & AI Stats
    this.dir = { x: 0, y: 0 };
    this.facing = "left";
    this.baseSpeed = 220;
    this.speedMultiplier = 0.60;
    this.intelligence = 0.20;
    this.speed = this.baseSpeed * this.speedMultiplier;

    // Animation & Visuals
    this.frame = 0;
    this.animTime = 0;
    this.frameCount = 4;
    this.color = color;
  }

  reset() {
    const p = this.deps.nodePos(this.startNodeId);
    if (!p) {
      throw new Error(`Troop.reset: missing node ${this.startNodeId}`);
    }

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

  // ======================================================
  // 2. CORE UPDATE LOOP
  // ======================================================
  update(dt) {
    const {
      state,
      getCurrentNodeMap,
      updateAnim,
      handlePortalTravel,
      getBestNeighbor
    } = this.deps;

    // Scene Blocking Logic
    if (state.levelUp || state.bossIntro || state.levelIntro) {
      return;
    }

    const nodeMap = getCurrentNodeMap();

    // AI Decision Making: Select a target node if idle
    if (!this.targetNode) {
      const current = nodeMap[this.currentNode];
      if (!current) return;

      // Logic for choosing next node (AI/Random)
      let nextId = null;
      if (current.neighbors.length > 0) {
        // Example: simple random neighbor selection
        nextId = current.neighbors[Math.floor(Math.random() * current.neighbors.length)];
      }

      if (nextId) {
        this.targetNode = nextId;
      } else {
        this.dir = { x: 0, y: 0 };
        updateAnim(this, dt, 10);
        return;
      }
    }

    // Move Toward Target
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

    // Determine Facing Direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx >= 0 ? "right" : "left";
    } else {
      this.facing = dy >= 0 ? "down" : "up";
    }

    const step = this.speed * dt;

    // Node Arrival Check
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

  // ======================================================
  // 3. RENDERING
  // ======================================================
  draw() {
    const { ctx, getBossScale, spriteStore, drawSheetFrame } = this.deps;

    ctx.save();
    ctx.translate(this.x, this.y);

    const s = getBossScale(this.x, this.y);
    ctx.scale(s, s);

    // Sprite or Fallback Rendering
    const img = spriteStore.troopRun; // Assuming a standard troop sprite exists
    if (img?.complete && img.naturalWidth > 0) {
      const frameWidth = img.width / 4;
      const frameHeight = img.height / 3;
      drawSheetFrame(img, this.frame, this.facing, frameWidth, frameHeight, 90, 90);
    } else {
      // Fallback: Colored Circle
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}