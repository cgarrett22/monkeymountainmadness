// npc-pj.js

export function createPJ(startNodeId, nodeMap) {
  const start = nodeMap[startNodeId];
  if (!start) {
    throw new Error(`createPJ: missing start node ${startNodeId}`);
  }

  return {
    active: true,
    locked: false,
    currentNode: startNodeId,
    previousNode: null,
    targetNode: null,

    x: start.x,
    y: start.y,

    speed: 165,
    frame: 0,
    animTime: 0,
    facing: "right",

    waitTime: 0,
    waitDuration: 0.35 + Math.random() * 0.35,

    swatting: false,
    swatCooldown: 0,
    swatTimer: 0,
    swatDuration: 0.32    
  };
}

export function updatePJ(pj, dt, nodeMap, butterfly, choose) {
  if (!pj?.active || pj.locked) return;

  pj.animTime += dt;
  pj.swatCooldown = Math.max(0, (pj.swatCooldown || 0) - dt);

  if (pj.swatting) {
    pj.swatTimer -= dt;

    const progress = 1 - Math.max(0, pj.swatTimer) / pj.swatDuration;
    pj.frame = Math.min(3, Math.floor(progress * 4));

    if (pj.swatTimer <= 0) {
      pj.swatting = false;
      pj.swatTimer = 0;
    }

    return;
  }

  if (!pj.targetNode) {
    pj.waitTime += dt;
    pj.frame = 0;

    if (pj.waitTime >= pj.waitDuration) {
      const current = nodeMap[pj.currentNode];
      if (!current) return;

      let options = current.neighbors || [];
      if (pj.previousNode && options.length > 1) {
        options = options.filter(id => id !== pj.previousNode);
      }

      let nextId = null;

      if (butterfly?.active) {
        const butterflyGoalId = butterfly.targetNode || butterfly.currentNode;
        const goalNode = nodeMap[butterflyGoalId];

        if (goalNode && options.length) {
          let bestDist = Infinity;

          for (const id of options) {
            const n = nodeMap[id];
            if (!n) continue;

            const d = Math.hypot(goalNode.x - n.x, goalNode.y - n.y);
            if (d < bestDist) {
              bestDist = d;
              nextId = id;
            }
          }
        }
      }

      if (!nextId && options.length) {
        nextId = choose(options);
      }

      if (nextId) {
        pj.targetNode = nextId;
        pj.waitTime = 0;
      }
    }

    return;
  }

  const target = nodeMap[pj.targetNode];
  if (!target) {
    pj.targetNode = null;
    return;
  }

  const dx = target.x - pj.x;
  const dy = target.y - pj.y;
  const dist = Math.hypot(dx, dy);
  const step = pj.speed * dt;

  if (Math.abs(dx) > Math.abs(dy)) {
    pj.facing = dx >= 0 ? "right" : "left";
  } else {
    pj.facing = dy >= 0 ? "down" : "up";
  }

  pj.frame = Math.floor(pj.animTime * 8) % 4;

  if (dist <= step || dist < 1) {
    pj.x = target.x;
    pj.y = target.y;
    pj.previousNode = pj.currentNode;
    pj.currentNode = pj.targetNode;
    pj.targetNode = null;
    pj.waitTime = 0;
    pj.waitDuration = 0.25 + Math.random() * 0.4;
    return;
  }

  pj.x += (dx / dist) * step;
  pj.y += (dy / dist) * step;
}

export function triggerPJSwat(pj) {
  if (!pj) return;
  if ((pj.swatCooldown || 0) > 0) return;

  pj.swatting = true;
  pj.swatTimer = pj.swatDuration || 0.32;
  pj.swatCooldown = 0.18;
  pj.frame = 0;
}

export function drawPJ(ctx, pj, spriteStore) {
  if (!pj?.active) return;

  // --- SWAT SPRITE ---
  if (pj.swatting) {
    const img = spriteStore.pjSwat;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const cols = 4;
    const frameWidth = img.naturalWidth / cols;
    const frameHeight = img.naturalHeight;
    const frame = pj.frame % cols;

    const drawW = 260;
    const drawH = drawW * (frameHeight / frameWidth);

    ctx.save();
    ctx.translate(pj.x, pj.y - 78);

    if (pj.facing === "right") {
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
    return;
  }

  // --- NORMAL PJ SPRITE ---
  const img = spriteStore.palPJ;
  if (!img || !img.complete || img.naturalWidth <= 0) return;

  const cols = 4;
  const rows = 3;
  const frameWidth = img.naturalWidth / cols;
  const frameHeight = img.naturalHeight / rows;

  let row = 1;
  if (pj.facing === "down") row = 0;
  else if (pj.facing === "up") row = 2;

  const frame = pj.frame % cols;
  const drawW = 250;
  const drawH = 250;

  ctx.save();
  ctx.translate(pj.x, pj.y - 70);

  if (pj.facing === "right") {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    img,
    frame * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );

  ctx.restore();
}