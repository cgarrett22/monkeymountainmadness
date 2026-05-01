// delivery-event.js

import { DELIVERY_ROUTES } from "./delivery-routes.js";
import { rand, randInt } from "./utils.js";

export function spawnDeliveryEvent(state, getCurrentNodeMap) {
  if (state.deliveryEvent || state.deliveryCrate) return;
  if (state.mode !== "playing") return;

  const sceneKey =
    state.scene === "main" ? "main" :
    state.scene === "boss" ? "boss" :
    state.scene === "chill" ? "chill" :
    null;

  if (!sceneKey) return;

  const routes = DELIVERY_ROUTES[sceneKey];
  if (!routes?.length) return;

  const route = routes[Math.floor(Math.random() * routes.length)];
  if (!route?.length) return;

  const nodeMap = getCurrentNodeMap();
  const first = nodeMap[route[0]];
  if (!first) return;

  state.deliveryEvent = {
    route,
    routeIndex: 0,
    x: first.x,
    y: first.y,
    speed: 135,
    facing: "right",
    frame: 0,
    animTime: 0,
    state: "walking", // walking | fainting | fading
    time: 0,
    alpha: 1,
    crateValue: randInt(10, 18),
    faintGagPlayed: false
  };
}

export function updateDeliveryEvent(
  state,
  dt,
  getCurrentNodeMap,
  sounds,
  playSfx,
  showFloatingText
) {
  const d = state.deliveryEvent;
  if (!d) return;

  d.time += dt;

  if (d.state === "walking") {
    const nextIndex = d.routeIndex + 1;

    if (nextIndex >= d.route.length) {
      state.deliveryEvent = null;
      state.deliveryTimer = rand(18, 30);
      return;
    }

    const target = getCurrentNodeMap()[d.route[nextIndex]];
    if (!target) {
      state.deliveryEvent = null;
      return;
    }

    const dx = target.x - d.x;
    const dy = target.y - d.y;
    const dist = Math.hypot(dx, dy);
    const step = d.speed * dt;

    if (Math.abs(dx) > Math.abs(dy)) {
      d.facing = dx >= 0 ? "right" : "left";
    } else {
      d.facing = dy >= 0 ? "down" : "up";
    }

    d.animTime += dt;
    d.frame = Math.floor(d.animTime * 6) % 4;

    if (dist <= step || dist < 1) {
      d.x = target.x;
      d.y = target.y;
      d.routeIndex = nextIndex;
    } else {
      d.x += (dx / dist) * step;
      d.y += (dy / dist) * step;
    }

    if (
      state.player &&
      Math.hypot(state.player.x - d.x, state.player.y - d.y) < 52
    ) {
      d.state = "fainting";
      d.time = 0;
      d.frame = 0;

      playSfx?.(sounds?.eOh);
      scheduleDeliveryAhh(state, sounds, playSfx);
    }

    return;
  }

  if (d.state === "fainting") {
    if (!d.faintGagPlayed) {
      d.faintGagPlayed = true;

      state.hearts.push({
        x: d.x,
        y: d.y - 70,
        t: 0
      });

      state.hearts.push({
        x: d.x - 18,
        y: d.y - 48,
        t: 0.1
      });

      state.hearts.push({
        x: d.x + 18,
        y: d.y - 52,
        t: 0.2
      });

      showFloatingText?.(d.x, d.y - 455, "Oh the love!! ❤️", "#fff", 4.4);
      showFloatingText?.(d.x, d.y - 380, "I.. can't take it!", "#ff7aa8", 4.4);
    }

    if (d.time >= 1.0) {
      d.state = "fading";
      d.time = 0;
    }

    return;
  }

  if (d.state === "fading") {
    d.alpha = Math.max(0, 1 - d.time / 0.45);

    if (d.alpha <= 0) {
      state.deliveryEvent = null;
      state.deliveryTimer = rand(22, 34);
    }
  }
}

export function updateDeliveryCrate(
  state,
  dt,
  sounds,
  playSfx,
  addAcceptanceScore
) {
  const c = state.deliveryCrate;
  if (!c) return;

  c.ttl -= dt;

  if (c.ttl <= 0) {
    state.deliveryCrate = null;
    return;
  }

  if (
    state.player &&
    Math.hypot(state.player.x - c.x, state.player.y - c.y) < 48
  ) {
    state.score += c.value;
    state.bananasCollectedThisScene =
      (state.bananasCollectedThisScene || 0) + c.value;

    addAcceptanceScore?.(c.value, "delivery crate");

    state.delayedPopups.push({
      delay: 1.15,
      popup: {
        nodeId: "delivery",
        type: "bananaBunch",
        value: c.value,
        x: c.x,
        y: c.y - 15,
        time: 0,
        duration: 3.2
      }
    });

    playSfx?.(sounds?.score);
    state.deliveryCrate = null;
  }
}

export function drawDeliveryEvent(ctx, state, spriteStore) {
  const d = state.deliveryEvent;
  if (!d) return;

  ctx.save();
  ctx.globalAlpha = d.alpha ?? 1;
  ctx.translate(d.x, d.y - 150);

  const img =
    d.state === "walking"
      ? spriteStore.deliveryDude
      : spriteStore.deliveryDudeFaints;

  if (img?.complete && img.naturalWidth > 0) {
    const cols = 4;
    const rows = 3;
    const frameWidth = img.naturalWidth / cols;
    const frameHeight = img.naturalHeight / rows;

    let row = 1;
    if (d.facing === "down") row = 0;
    else if (d.facing === "up") row = 2;

    const frame =
      d.state === "walking"
        ? d.frame
        : Math.min(3, Math.floor(d.time * 8));

    if (d.facing === "right") {
      ctx.scale(-1, 1);
    }

    const drawW = 384;
    const drawH = 384;

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
  }

  ctx.restore();
}

export function drawDeliveryCrate(ctx, state, spriteStore) {
  const c = state.deliveryCrate;
  if (!c) return;

  ctx.save();

  const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.06;
  ctx.translate(c.x, c.y);
  ctx.scale(pulse, pulse);

  if (
    spriteStore.deliveryCrate?.complete &&
    spriteStore.deliveryCrate.naturalWidth > 0
  ) {
    const w = 96;
    const h =
      w *
      (spriteStore.deliveryCrate.naturalHeight /
        spriteStore.deliveryCrate.naturalWidth);

    ctx.drawImage(spriteStore.deliveryCrate, -w / 2, -h / 2, w, h);
  } else {
    ctx.fillStyle = "#b7791f";
    ctx.fillRect(-34, -26, 68, 52);
  }

  ctx.restore();
}

export function scheduleDeliveryAhh(state, sounds, playSfx) {
  if (state.deliveryAhhTimer) {
    clearTimeout(state.deliveryAhhTimer);
  }

  state.deliveryAhhTimer = setTimeout(() => {
    playSfx?.(sounds?.ahh, null, "ahh");
    state.deliveryAhhTimer = null;
  }, 180);
}

export function cancelDeliveryAhh(state) {
  if (state.deliveryAhhTimer) {
    clearTimeout(state.deliveryAhhTimer);
    state.deliveryAhhTimer = null;
  }
}