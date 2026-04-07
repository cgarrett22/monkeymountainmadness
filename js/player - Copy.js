export class Player {
  constructor(startNodeId, deps) {
    this.deps = deps;
    const p = deps.nodePos(startNodeId);
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
    const p = this.deps.nodePos(startNodeId);
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
    const { inputState, getBestNeighbor } = this.deps;
    if (this.targetNode || !inputState.queuedDirection) return;

    const nextId = getBestNeighbor(
      this.currentNode,
      inputState.queuedDirection,
      inputState.queuedDirectionName
    );
    if (!nextId) return;

    this.targetNode = nextId;
  }

  update(dt) {
    const {
      state,
      inputState,
      getCurrentNodeMap,
      tryConsumeQueuedTurn,
      tryContinueForward,
      updateAnim,
      handlePortalTravel
    } = this.deps;

    if (this.invuln > 0) {
      this.invuln -= dt;
      if (this.invuln < 0) this.invuln = 0;
    }

    this.syncMotherSprite();

    if (state.levelUp || state.bossIntro || state.levelIntro) {
      return;
    }

    const nodeMap = getCurrentNodeMap();

    if (this.targetNode && inputState.queuedDirection) {
      const from = nodeMap[this.currentNode];
      const to = nodeMap[this.targetNode];
      if (from && to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;

        const forwardX = dx / len;
        const forwardY = dy / len;

        const dot =
          forwardX * inputState.queuedDirection.x +
          forwardY * inputState.queuedDirection.y;

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
    const shouldCarry = !!this.deps.state.boss?.mother?.carried;
    if (this.carryingMother !== shouldCarry) {
      this.setCarryingMother(shouldCarry);
    }
  }

  draw() {
    const {
      ctx,
      state,
      getBossScale,
      spriteStore,
      drawSheetFrame,
      drawBanana
    } = this.deps;

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
      const bob = Math.sin(this.animTime * 8) * 2;
      ctx.translate(0, bob);
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