export function createNanaSnatcher(startNodeId, nodeMap) {
  const start = nodeMap[startNodeId];
  if (!start) {
    throw new Error(`createNanaSnatcher: missing start node ${startNodeId}`);
  }

  return {
    active: true,
    hidden: false,
    respawnTimer: 0,

    currentNode: startNodeId,
    previousNode: null,
    targetNode: null,

    x: start.x,
    y: start.y,

    speed: 255,
    frame: 0,
    animTime: 0,
    facing: "left",

    carryingBanana: false,
    targetBananaId: null,
    exitNodeId: null,

    waitTime: 0,
    waitDuration: 0.2
  };
}

function getNearestBanana(snatcher, bananas) {
  let best = null;
  let bestDist = Infinity;

  for (const banana of bananas || []) {
    if (!banana || banana.collected) continue;
    if (!banana.landed) continue;

    const d = Math.hypot(snatcher.x - banana.x, snatcher.y - banana.y);
    if (d < bestDist) {
      bestDist = d;
      best = banana;
    }
  }

  return best;
}

function chooseNeighborToward(currentNodeId, goalNodeId, nodeMap) {
  const current = nodeMap[currentNodeId];
  const goal = nodeMap[goalNodeId];
  if (!current || !goal) return null;

  let bestId = null;
  let bestDist = Infinity;

  for (const id of current.neighbors || []) {
    const n = nodeMap[id];
    if (!n) continue;

    const d = Math.hypot(goal.x - n.x, goal.y - n.y);
    if (d < bestDist) {
      bestDist = d;
      bestId = id;
    }
  }

  return bestId;
}

export function updateNanaSnatcher(
  snatcher,
  dt,
  nodeMap,
  bananas,
  getEnemyEntryNodeId
) {
  if (!snatcher?.active || snatcher.hidden) return;

  snatcher.animTime += dt;

  if (!snatcher.targetNode) {
    snatcher.waitTime += dt;
    snatcher.frame = 0;

    if (snatcher.waitTime >= snatcher.waitDuration) {
      let nextId = null;

      if (!snatcher.carryingBanana) {
        const banana = getNearestBanana(snatcher, bananas);

        if (banana) {
          snatcher.targetBananaId = banana.id;
            nextId = findNextStepToward(
            snatcher.currentNode,
            banana.nodeId,
            nodeMap
            );
        }
      } else {
        snatcher.exitNodeId = getEnemyEntryNodeId();
        if (snatcher.exitNodeId) {
            nextId = findNextStepToward(
            snatcher.currentNode,
            snatcher.exitNodeId,
            nodeMap
            );
        }
      }

      if (nextId) {
        snatcher.targetNode = nextId;
        snatcher.waitTime = 0;
      }
    }

    return;
  }

  const target = nodeMap[snatcher.targetNode];
  if (!target) {
    snatcher.targetNode = null;
    return;
  }

  const dx = target.x - snatcher.x;
  const dy = target.y - snatcher.y;
  const dist = Math.hypot(dx, dy);
  const step = snatcher.speed * dt;

  if (Math.abs(dx) > Math.abs(dy)) {
    snatcher.facing = dx >= 0 ? "right" : "left";
  } else {
    snatcher.facing = dy >= 0 ? "down" : "up";
  }

  snatcher.frame = Math.floor(snatcher.animTime * 8) % 4;

  if (dist <= step || dist < 1) {
    snatcher.x = target.x;
    snatcher.y = target.y;
    snatcher.previousNode = snatcher.currentNode;
    snatcher.currentNode = snatcher.targetNode;
    snatcher.targetNode = null;
    snatcher.waitTime = 0;

    if (!snatcher.carryingBanana) {
      const banana = (bananas || []).find(
        b => b && !b.collected && b.landed && b.nodeId === snatcher.currentNode
      );

      if (banana) {
        banana.collected = true;
        snatcher.carryingBanana = true;
        snatcher.targetBananaId = banana.id;
      }
    } else if (snatcher.exitNodeId && snatcher.currentNode === snatcher.exitNodeId) {
        snatcher.active = false;
        snatcher.hidden = true;
        snatcher.respawnTimer = 6.0;

        snatcher.carryingBanana = false;
        snatcher.targetBananaId = null;
        snatcher.exitNodeId = null;
        snatcher.targetNode = null;
        snatcher.previousNode = null;
    }

    return;
  }

  snatcher.x += (dx / dist) * step;
  snatcher.y += (dy / dist) * step;
}

export function drawNanaSnatcher(ctx, snatcher, spriteStore) {
  if (!snatcher?.active || snatcher.hidden) return;

  const img = snatcher.carryingBanana
    ? spriteStore.nanaSnatchersSnatched
    : spriteStore.nanaSnatchers;

  if (!img || !img.complete || img.naturalWidth <= 0) return;

  const cols = 4;
  const rows = 3;
  const frameWidth = img.naturalWidth / cols;
  const frameHeight = img.naturalHeight / rows;

  let row = 1;
  if (snatcher.facing === "down") row = 0;
  else if (snatcher.facing === "up") row = 2;

  const frame = snatcher.frame % cols;
  const drawW = 188;
  const drawH = 188;

  ctx.save();
  ctx.translate(snatcher.x, snatcher.y - 58);

  if (snatcher.facing === "right") {
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

function findNextStepToward(startNodeId, goalNodeId, nodeMap) {
  if (!startNodeId || !goalNodeId || startNodeId === goalNodeId) return null;

  const queue = [startNodeId];
  const cameFrom = new Map();
  cameFrom.set(startNodeId, null);

  while (queue.length) {
    const currentId = queue.shift();
    if (currentId === goalNodeId) break;

    const current = nodeMap[currentId];
    if (!current) continue;

    for (const neighborId of current.neighbors || []) {
      if (cameFrom.has(neighborId)) continue;
      if (!nodeMap[neighborId]) continue;

      cameFrom.set(neighborId, currentId);
      queue.push(neighborId);
    }
  }

  if (!cameFrom.has(goalNodeId)) return null;

  let step = goalNodeId;
  while (cameFrom.get(step) !== startNodeId) {
    step = cameFrom.get(step);
    if (step == null) return null;
  }

  return step;
}
