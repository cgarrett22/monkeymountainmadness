// npc-butterfly.js

export function createButterfly(startNodeId, nodeMap) {
  const start = nodeMap[startNodeId];
  if (!start) {
    throw new Error(`createButterfly: missing start node ${startNodeId}`);
  }

  return {
    active: true,
    currentNode: startNodeId,
    previousNode: null,
    targetNode: null,

    x: start.x,
    y: start.y,

    speed: 320,
    hoverTime: 0,
    hoverDuration: 0.28 + Math.random() * 0.24,
    spurting: false,

    frame: 0,
    animTime: 0,

    bobTime: 0,
    bobAmount: 8,
    facing: "left"
  };
}

export function updateButterfly(butterfly, dt, nodeMap, choose) {
  if (!butterfly?.active) return;

  butterfly.animTime += dt;
  butterfly.bobTime += dt;

  if (!butterfly.targetNode) {
    butterfly.hoverTime += dt;
    butterfly.frame = Math.floor(butterfly.animTime * 12) % 4;

    if (butterfly.hoverTime >= butterfly.hoverDuration) {
      const current = nodeMap[butterfly.currentNode];
      if (!current) return;

      let options = current.neighbors || [];
      if (butterfly.previousNode && options.length > 1) {
        options = options.filter(id => id !== butterfly.previousNode);
      }

      const nextId = options.length ? choose(options) : null;
      if (nextId) {
        butterfly.targetNode = nextId;
        butterfly.spurting = true;
        butterfly.hoverTime = 0;
      }
    }

    return;
  }

  const target = nodeMap[butterfly.targetNode];
  if (!target) {
    butterfly.targetNode = null;
    butterfly.spurting = false;
    return;
  }

  const dx = target.x - butterfly.x;
  const dy = target.y - butterfly.y;
  const dist = Math.hypot(dx, dy);
  const step = butterfly.speed * dt;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 1) {
    butterfly.facing = dx >= 0 ? "right" : "left";
    }
  butterfly.frame = Math.floor(butterfly.animTime * 16) % 4;

  if (dist <= step || dist < 1) {
    butterfly.x = target.x;
    butterfly.y = target.y;
    butterfly.previousNode = butterfly.currentNode;
    butterfly.currentNode = butterfly.targetNode;
    butterfly.targetNode = null;
    butterfly.spurting = false;
    butterfly.hoverTime = 0;
    butterfly.hoverDuration = 0.18 + Math.random() * 0.30;
    return;
  }

  butterfly.x += (dx / dist) * step;
  butterfly.y += (dy / dist) * step;
}

export function drawButterfly(ctx, butterfly, spriteStore) {
  if (!butterfly?.active) return;

  const img = spriteStore.butterfly;
  if (!img || !img.complete || img.naturalWidth <= 0) return;

  const cols = 4;
  const frameWidth = img.naturalWidth / cols;
  const frameHeight = img.naturalHeight;
  const frame = butterfly.frame % cols;

  const bob = Math.sin(butterfly.bobTime * 8) * butterfly.bobAmount;
  const drawW = 128;
  const drawH = drawW * (frameHeight / frameWidth);

    ctx.save();
    ctx.translate(butterfly.x, butterfly.y - 58 + bob);

    if (butterfly.facing === "right") {
    ctx.scale(-1, 1);
    }

    ctx.drawImage(
        img,
        frame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
    );

    ctx.restore();
}