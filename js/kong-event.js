export function createKongEventState() {
  return {
    introDone: false,
    introBalloons: [],
    active: false,
    type: null,          // "kongChasesBalloon" | "balloonChasesKong"
    balloonType: null,   // "banana" | "girl" | "godzilla"
    phase: "idle",       // idle | intro | squat | run
    route: [],
    routeIndex: 0,
    x: 0,
    y: 0,
    speed: 0,
    timer: 0,
    duration: 0,
    triggeredThisScene: 0,
    maxPerScene: 1,
    nextHeartTrigger: 2
  };
}

export function resetKongEvent(state) {
  state.kongEvent = createKongEventState();
}

export function startKongBalloonIntro(state) {
  if (!state.kongEvent) {
    state.kongEvent = createKongEventState();
  }

  state.kongEvent.introDone = true;
  state.kongEvent.phase = "intro";
  state.kongEvent.timer = 0;

  state.kongEvent.introBalloons = [
    {
      type: "banana",
      x: 120,
      y: 1480,
      vx: 58,
      vy: -26,
      bob: 0
    },
    {
      type: "girl",
      x: 210,
      y: 1540,
      vx: 54,
      vy: -22,
      bob: 1.7
    },
    {
      type: "godzilla",
      x: 300,
      y: 1600,
      vx: 50,
      vy: -18,
      bob: 3.1
    }
  ];
}

export function updateKongBalloonIntro(state, dt) {
  const e = state.kongEvent;
  if (!e || e.phase !== "intro") return;

  e.timer += dt;

  for (const b of e.introBalloons) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  if (e.timer >= 3.2) {
    e.phase = "idle";
    e.introBalloons = [];
  }
}

export function applyKongDizzy(state) {
  state.dizzyTimer = state.dizzyDuration || 1.0;
}

export function maybeTriggerKongEvent(state, getCurrentNodeMap) {
  if (!canKongEventRunInScene(state)) return;

  const e = state.kongEvent;
  if (!e) return;
  if (e.active) return;
  if (e.phase !== "idle") return;
  if ((state.acceptance || 0) < e.nextHeartTrigger) return;
  if (e.triggeredThisScene >= e.maxPerScene) return;

  const balloonCycle = ["banana", "girl", "godzilla"];
  const balloonType = balloonCycle[e.triggeredThisScene % balloonCycle.length];

  forceTriggerKongEvent(state, getCurrentNodeMap, balloonType);
}

export function forceTriggerKongEvent(state, getCurrentNodeMap, balloonType = "banana") {
  if (!canKongEventRunInScene(state)) return;

  const e = state.kongEvent;
  if (!e) return;

  const type =
    balloonType === "godzilla"
      ? "balloonChasesKong"
      : "kongChasesBalloon";

  const route = ["BB20", "BB32", "BB18", "BB23", "BB24"];
  const nodeMap = getCurrentNodeMap();
  const first = nodeMap[route[0]];
  if (!first) return;

  e.active = true;
  e.type = type;
  e.balloonType = balloonType;
  e.phase = "squat";
  e.route = route;
  e.routeIndex = 0;
  e.x = first.x;
  e.y = first.y;
  e.speed = 300;
  e.timer = 0;
}

export function updateKongEvent(state, dt, getCurrentNodeMap) {
  const e = state.kongEvent;
  if (!e) return;

  if (e.phase === "intro") {
    updateKongBalloonIntro(state, dt);
    return;
  }

  if (!e.active) return;

  e.timer += dt;

  if (e.phase === "squat") {
    if (e.timer >= 0.7) {
      e.phase = "run";
      e.timer = 0;
    }
    return;
  }

  if (e.phase !== "run") return;

  const route = e.route;
  const nextIndex = e.routeIndex + 1;

  if (nextIndex >= route.length) {
    e.active = false;
    e.phase = "idle";
    e.triggeredThisScene += 1;
    return;
  }

  const nodeMap = getCurrentNodeMap();
  const target = nodeMap[route[nextIndex]];
  if (!target) {
    e.active = false;
    e.phase = "idle";
    return;
  }

  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const dist = Math.hypot(dx, dy);
  const step = e.speed * dt;

  if (dist <= step) {
    e.x = target.x;
    e.y = target.y;
    e.routeIndex = nextIndex;
  } else {
    e.x += (dx / dist) * step;
    e.y += (dy / dist) * step;
  }
}

export function updateKongEventCollisions(state, playSfx, sounds) {
  const e = state.kongEvent;
  if (!e || !e.active || e.phase !== "run") return;
  if (!state.player) return;

  if (Math.hypot(state.player.x - e.x, state.player.y - e.y) < 110) {
    applyKongDizzy(state);
  }

  for (const troop of state.troops || []) {
    if (troop.hidden) continue;

    if (Math.hypot(troop.x - e.x, troop.y - e.y) < 100) {
      troop.hidden = true;
      troop.respawnTimer = 1.5;
    }
  }
}

function canKongEventRunInScene(state) {
  if (!state.unlocks?.kongEvent) return false;

  return (
    state.scene === "chill" ||
    (state.scene === "main" && state.level >= 2)
  );
}

function getBalloonImage(spriteStore, type, animated = false) {
  if (animated) {
    if (type === "banana") return spriteStore.bananaBalloonSprite;
    if (type === "girl") return spriteStore.girlKongBalloonSprite;
    if (type === "godzilla") return spriteStore.godzillaBalloonSprite;
  } else {
    if (type === "banana") return spriteStore.bananaBalloon;
    if (type === "girl") return spriteStore.girlKongBalloon;
    if (type === "godzilla") return spriteStore.godzillaBalloon;
  }
  return null;
}

function drawAnimatedBalloon(ctx, img, x, y, drawW) {
  if (!img || !img.complete || img.naturalWidth <= 0) return;

  const isSprite =
    img.naturalWidth > img.naturalHeight * 1.2;

  if (isSprite) {
    const cols = 4;
    const frameWidth = img.naturalWidth / cols;
    const frameHeight = img.naturalHeight;
    const frame = Math.floor(performance.now() * 0.012) % cols;
    const drawH = drawW * (frameHeight / frameWidth);

    ctx.drawImage(
      img,
      frame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      x - drawW / 2,
      y - drawH / 2,
      drawW,
      drawH
    );
  } else {
    const drawH = drawW * (img.naturalHeight / img.naturalWidth);
    ctx.drawImage(
      img,
      x - drawW / 2,
      y - drawH / 2,
      drawW,
      drawH
    );
  }
}

export function drawKongEvent(ctx, state, spriteStore, getCurrentNodeMap) {
  const e = state.kongEvent;
  if (!e) return;
if (!canKongEventRunInScene(state)) return;

  // intro balloons
  if (e.phase === "intro" && Array.isArray(e.introBalloons)) {
    for (const b of e.introBalloons) {
      const img = getBalloonImage(spriteStore, b.type, true) || getBalloonImage(spriteStore, b.type, false);
      if (!img || !img.complete || img.naturalWidth <= 0) continue;

      const bob = Math.sin(performance.now() * 0.003 + (b.bob || 0)) * 10;
      drawAnimatedBalloon(ctx, img, b.x, b.y + bob, 240);
    }
    return;
  }

  if (!e.active) return;

  const balloonImg =
    getBalloonImage(spriteStore, e.balloonType, true) ||
    getBalloonImage(spriteStore, e.balloonType, false);

  if (e.phase === "squat") {
    const kongImg = spriteStore.kongSquat || spriteStore.kong;
    if (kongImg && kongImg.complete && kongImg.naturalWidth > 0) {
      const drawW = 256;
      const drawH = drawW * (kongImg.naturalHeight / kongImg.naturalWidth);

      ctx.drawImage(
        kongImg,
        e.x - drawW / 2,
        e.y - drawH * 0.82,
        drawW,
        drawH
      );
    }

    if (balloonImg && balloonImg.complete && balloonImg.naturalWidth > 0) {
      const bob = Math.sin(performance.now() * 0.005) * 8;
      const bx = e.x + 210;
      const by = e.y - 205 + bob;
      drawAnimatedBalloon(ctx, balloonImg, bx, by, 260);
    }

    return;
  }

  if (e.phase === "run") {
    const runningImg = spriteStore.kongRunning || spriteStore.kong;

    let runningRight = true;
    if (e.routeIndex + 1 < e.route.length) {
      const nodeMap = getCurrentNodeMap();
      const currentNode = nodeMap[e.route[e.routeIndex]];
      const nextNode = nodeMap[e.route[e.routeIndex + 1]];
      if (currentNode && nextNode) {
        runningRight = nextNode.x >= currentNode.x;
      }
    }

    let balloonOffsetX = 220;
    let balloonOffsetY = -150;

    if (e.type === "balloonChasesKong") {
      balloonOffsetX = -220;
      balloonOffsetY = -130;
    }

    if (balloonImg && balloonImg.complete && balloonImg.naturalWidth > 0) {
      const bx = e.x + balloonOffsetX;
      const by = e.y + balloonOffsetY + Math.sin(performance.now() * 0.006) * 8;
      drawAnimatedBalloon(ctx, balloonImg, bx, by, 260);
    }

    if (runningImg && runningImg.complete && runningImg.naturalWidth > 0) {
      const cols = 5;
      const frameWidth = runningImg.naturalWidth / cols;
      const frameHeight = runningImg.naturalHeight;
      const frame = Math.floor(performance.now() * 0.012) % cols;

      const drawW = 256;
      const drawH = drawW * (frameHeight / frameWidth);

      ctx.save();
      ctx.translate(e.x, e.y - 120);

      if (runningRight) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        runningImg,
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
  }
}