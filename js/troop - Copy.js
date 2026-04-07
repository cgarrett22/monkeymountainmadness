export class Troop {
  constructor(startNodeId, color = "#7c5c46", deps) {
    this.deps = deps;
    const p = deps.nodePos(startNodeId);
    this.startNodeId = startNodeId;
    this.currentNode = startNodeId;
    this.previousNode = null;
    this.targetNode = null;
    this.x = p.x;
    this.y = p.y;
    this.dir = { x: 0, y: 0 };
    this.facing = "left";
    this.radius = 20;
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
    this.speed = this.baseSpeed * this.speedMultiplier;
  }

  chooseNextNode() {
    const { getCurrentNodeMap, state, choose } = this.deps;
    const nodeMap = getCurrentNodeMap();
    const current = nodeMap[this.currentNode];
    if (!current) return null;

    const candidates = current.neighbors.filter(n => n !== this.previousNode);
    const pool = candidates.length ? candidates : current.neighbors;
    if (!pool.length) return null;

    const player = state.player;

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
    const {
      state,
      getCurrentNodeMap,
      updateAnim,
      handlePortalTravel
    } = this.deps;

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
    const { ctx, getBossScale, spriteStore, drawSheetFrame } = this.deps;

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
      const bob = Math.sin(this.animTime * 8) * 2;
      ctx.translate(0, bob);

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}