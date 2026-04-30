import {
    Player
} from "./player.js";
import {
    Troop
} from "./troop.js";

import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    DEBUG,
    DEBUG_TEST_LEVEL,
    DEBUG_LOOP_MAIN_SCENE,
    DEBUG_LOOP_KONG_SCENE,
    NODE_DEBUG,
    HAT_TRICK_WINDOW,
    HAT_TRICK_COUNT,
    HAT_TRICK_BONUS,
    HIGH_FIVE_WINDOW,
    HIGH_FIVE_COUNT,
    HIGH_FIVE_BONUS,
    SWIPE_THRESHOLD,
    HOME_NODE,
    MUTE_BUTTON
} from "./config.js";

import {
    createInitialState,
    createKeysState,
    createInputState,
    setQueuedDirection,
    clearQueuedDirection
} from "./state.js";

import {
    createBackgroundImage,
    loadSprites,
    loadSounds,
    applyMuteState,
    stopAllMusic,
    playSceneMusic,
    playSfx
} from "./assets.js";


import {
  bananaBonanzaSecretRewards,
  bananaBonanzaDeliveryRoutes
} from "./banana-bonanza-rewards.js";

import { ZOOKEEPER_LAYOUT } from "./zookeeper-layout.js";
import { DELIVERY_ROUTES } from "./delivery-routes.js";

import { bossNodes } from "./scene-data-boss-nodes.js";
import { bossConfig, bossCoconutLanes, babyKongPath, coconutKongSecretRewards } from "./scene-data-boss.js";
import { chillNodes } from "./scene-data-chill-nodes.js";
import { chillConfig, CHILL_BANANA_NODE_IDS } from "./scene-data-chill.js";

import { SCENE_CONFIGS } from "./scene-config.js";

import {
  randInt,
  rand,
  choose,
  clamp,
  distance,
  getNearestNodeId,
  getNodeIdsByTag,
  getSafeSpawnNodeId
} from "./utils.js";

import { roundRect, drawHeart, drawHeartShape } from "./draw-primitives.js";

import {
  debugLog,
  safeDebugString,
  copyDebugLogsToClipboard,
  clearDebugLogs,
  drawPathOverlay
} from "./debug-utils.js";

import { createButterfly, updateButterfly, drawButterfly } from "./npc-butterfly.js";
import { createPJ, updatePJ, drawPJ, triggerPJSwat } from "./npc-pj.js";

import {
  createNanaSnatcher,
  updateNanaSnatcher,
  drawNanaSnatcher
} from "./npc-nanasnatchers.js";

import {
  loadLeaderboard,
  saveLeaderboard,
  isHighScore,
  insertHighScore,
  normalizeInitials
} from "./leaderboard.js";

import {
  createKongEventState,
  resetKongEvent,
  startKongBalloonIntro,
  maybeTriggerKongEvent,
  forceTriggerKongEvent,
  updateKongEvent,
  updateKongEventCollisions,
  drawKongEvent
} from "./kong-event.js";

import {
  spawnDeliveryEvent,
  updateDeliveryEvent,
  updateDeliveryCrate,
  drawDeliveryEvent,
  drawDeliveryCrate,
  cancelDeliveryAhh
} from "./delivery-event.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const keys = createKeysState();
const state = createInitialState();
state.leaderboard = loadLeaderboard();

const inputState = createInputState();

const spriteStore = loadSprites();
const sounds = loadSounds(state);
const backgroundImage = createBackgroundImage();

state.mode = "start";
state.cardBackground = spriteStore.gameStartCard;

const muteButton = {
    ...MUTE_BUTTON
};

const MAX_ACTIVE_BANANAS = 3;

const CLOUD_SCROLL_SPEED = 14;

// keep compatibility with the rest of the existing file for now
function drawStartCard(ctx) {
  const img = state.cardBackground;

  if (!img || !img.complete || img.naturalWidth <= 0) {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Start card missing or still loading", canvas.width / 2, 220);

    drawLeaderboardPanel();
    return;
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  drawLeaderboardPanel();
}

function drawLeaderboardPanel() {
  const entries = state.leaderboard || [];
  if (!entries.length) return;


  const cw = canvas.width;
  const w = 330;
  const h = 280;
  const x = cw / 2 - w / 2;
  const y = 1320;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText("MOST ACCEPTED", cw/2, 1365);

  ctx.font = "bold 28px Arial";
  ctx.textAlign = "left";
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    ctx.fillText(
      `${e.initials}  ❤️  ${e.score}`,
      cw/2 - w/2 + 80,
      1415 + i * 38
    );
  }

  ctx.restore();
}

function setQueuedDirectionCompat(x, y, name) {
    setQueuedDirection(inputState, x, y, name);
}

function clearQueuedDirectionCompat() {
    clearQueuedDirection(inputState);
}

Object.defineProperties(window, {
    queuedDirection: {
        get: () => inputState.queuedDirection,
        set: (value) => {
            inputState.queuedDirection = value;
        }
    },
    queuedDirectionName: {
        get: () => inputState.queuedDirectionName,
        set: (value) => {
            inputState.queuedDirectionName = value;
        }
    },
    touchStart: {
        get: () => inputState.touchStart,
        set: (value) => {
            inputState.touchStart = value;
        }
    },
    swipeHandled: {
        get: () => inputState.swipeHandled,
        set: (value) => {
            inputState.swipeHandled = value;
        }
    },
    musicStarted: {
        get: () => inputState.musicStarted,
        set: (value) => {
            inputState.musicStarted = value;
        }
    }
});

const SECRET_REWARDS = {
  main: bananaBonanzaSecretRewards,
  boss: coconutKongSecretRewards
};

function getSceneConfig() {
    return SCENE_CONFIGS[state.scene] || SCENE_CONFIGS.main;
}

function getScenePortals() {
    return getSceneConfig().portals || {
        cave: {},
        wrap: {}
    };
}

function getSecretRoomConfig() {
    return getSceneConfig().secretRoom || null;
}

function isSecretRoomUnlocked() {
    const secret = getSecretRoomConfig();
    if (!secret) return false;

    if (secret.unlockCondition === "heartsComplete") {
        return (state.acceptance || 0) >= 3;
    }

    if (secret.unlockCondition === "bossHeartsComplete") {
        return (
            state.scene === "boss" &&
            (state.boss?.heartsCollected || 0) >= (state.boss?.requiredHearts || 3)
        );
    }

    return false;
}

function resolveScenePortal(nodeId) {
    if (!nodeId) return null;

    const portals = getScenePortals();
    const secret = getSecretRoomConfig();

    if (
        secret &&
        nodeId === secret.entryNodeId &&
        isSecretRoomUnlocked()
    ) {
        return {
            type: "secret",
            to: secret.destinationNodeId
        };
    }

    if (portals.cave?.[nodeId]) {
        return {
            type: "cave",
            to: portals.cave[nodeId]
        };
    }

    if (portals.wrap?.[nodeId]) {
        return {
            type: "wrap",
            to: portals.wrap[nodeId]
        };
    }

    return null;
}

function getBananaNodeIds() {
  if (state.scene === "boss") return bossConfig.bananaNodes;
  if (state.scene === "chill") return CHILL_BANANA_NODE_IDS;
  return getNodeIdsByTag(getCurrentNodeMap(), "banana");
}

function checkSecretReward() {
    if (!state.player) return;
    //console.log("SECRET CHECK", state.scene, state.player.currentNode);
    const sceneRewards = SECRET_REWARDS[state.scene];
    if (!sceneRewards) return;

    const nodeId = state.player.currentNode;
    const reward = sceneRewards[nodeId];
    if (!reward) return;

    if (!state.secretRewardsFound) state.secretRewardsFound = {};
    const rewardKey = `${state.scene}:${nodeId}`;
    if (state.secretRewardsFound[rewardKey]) return;

    const bonus = randInt(reward.min, reward.max);

    state.secretRewardsFound[rewardKey] = true;
    state.score += bonus;
    state.bananasCollectedThisScene = (state.bananasCollectedThisScene || 0) + bonus;
    addAcceptanceScore(bonus, "secret reward");
    state.secretRewardPopups.push({
        nodeId,
        type: reward.type,
        value: bonus,
        x: reward.x,
        y: reward.y,
        time: 0,
        duration: 1.8
    });

    //sounds.score?.play().catch(() => {});
    playSfx(sounds.score);
}

function drawSecretRewardSparkles() {
    const sceneRewards = SECRET_REWARDS[state.scene];
    if (!sceneRewards) return;

    const now = performance.now() * 0.001;

    for (const nodeId in sceneRewards) {
        const reward = sceneRewards[nodeId];
        const rewardKey = `${state.scene}:${nodeId}`;

        if (state.secretRewardsFound?.[rewardKey]) continue;

        const cx = reward.x;
        const cy = reward.y - 30;

        for (let i = 0; i < 2; i++) {
            const ang = now * 2 + i * Math.PI;
            const sx = cx + Math.cos(ang) * (12 + i * 8);
            const sy = cy + Math.sin(ang * 1.2) * (8 + i * 5);

            ctx.save();
            ctx.globalAlpha = 0.9;

            const glow = ctx.createRadialGradient(sx, sy, 1, sx, sy, 14);
            glow.addColorStop(0, "rgba(255,255,255,1)");
            glow.addColorStop(0.35, "rgba(255,220,170,0.95)");
            glow.addColorStop(1, "rgba(255,220,170,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(sx, sy, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#fff8d6";
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}

function drawMessagePlate(text, x, y, alpha = 1, opts = {}) {
    const {
        font = "bold 34px Arial",
            textColor = "#ffe066",
            strokeColor = "rgba(0,0,0,0.72)",
            plateColor = "rgba(0,0,0,0.42)",
            lineWidth = 5,
            padX = 14,
            padY = 10,
            radius = 12
    } = opts;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const metrics = ctx.measureText(text);
    const boxW = metrics.width + padX * 2;
    const boxH = 24 + padY * 2;

    // backing plate
    ctx.fillStyle = plateColor;
    roundRect(ctx, x - boxW / 2, y - boxH / 2, boxW, boxH, radius);
    ctx.fill();

    // text
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = textColor;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    ctx.restore();
}

function drawSecretRewardPopups() {
    if (!state.secretRewardPopups?.length) return;

    for (const popup of state.secretRewardPopups) {
        const t = popup.time / popup.duration;
        const rise = t * 42;
        const alpha = 1 - t;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (
            popup.type === "bananaBunch" &&
            spriteStore.bananaBunch &&
            spriteStore.bananaBunch.complete &&
            spriteStore.bananaBunch.naturalWidth > 0
        ) {
            const img = spriteStore.bananaBunch;
            const w = 88;
            const h = w * (img.naturalHeight / img.naturalWidth);

            ctx.drawImage(
                img,
                popup.x - w / 2,
                popup.y - 86 - rise,
                w,
                h
            );
        }

        ctx.restore();

        drawMessagePlate(
            `+${popup.value} 🍌`,
            popup.x,
            popup.y - 112 - rise,
            alpha, {
                font: "bold 48px Arial",
                textColor: "#ffe066",
                plateColor: "rgba(0,0,0,0.48)"
            }
        );
    }
}

function drawHeartProgressPopup() {
    const p = state.heartProgressPopup;
    if (!p) return;

    const t = p.time / p.duration;
    const alpha = 1 - t;
    const rise = t * 70;

    const x = canvas.width / 2;
    const y = canvas.height * 0.34 - rise;

    ctx.save();
    ctx.globalAlpha = alpha;

    // soft mist / fog backdrop
    const grad = ctx.createRadialGradient(x, y, 20, x, y, 170);
    grad.addColorStop(0, "rgba(255,255,255,0.92)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
    grad.addColorStop(0.75, "rgba(255,255,255,0.18)");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 170, 0, Math.PI * 2);
    ctx.fill();

    // subtle secondary haze
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 140, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // text
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.fillStyle = "#ff4f8b";

    const text = `❤️ ${p.count}/3`;

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    ctx.restore();
}

function addAcceptanceScore(amount, reason = "") {
  if (!amount) return;
  state.acceptanceScore = (state.acceptanceScore || 0) + amount;

  // Optional debug:
  // if (reason) debugLog(state, `[ACCEPTANCE] +${amount} ${reason}`);
}

function getBossScale(x, y) {
    return 1;
}

function getLevelCardImage(level) {
    if (level % 2 === 0) {
        return spriteStore.coconutKongCard;
    }
    return spriteStore.bananaBonanzaCard;
}

function getSceneCard(scene, level) {
    if (scene === "main") {
        return spriteStore.bananaBonanzaCard || getLevelCardImage(level);
    }

    if (scene === "boss") {
        return spriteStore.coconutKongCard || getLevelCardImage(level);
    }

    if (scene === "chill") {
        return (
            spriteStore.chillHillCard ||
            spriteStore.chillHillBackground ||
            getLevelCardImage(level)
        );
    }

    return getLevelCardImage(level);
}

function getGameOverCardImage() {
    return spriteStore.gameOverCard || null;
}

function isBossScene() {
    return state.scene === "boss";
}

function nodePos(id) {
    return getCurrentNodeMap()[id];
}

function toggleMute() {
    state.isMuted = !state.isMuted;
    applyMuteState(sounds, state);
}

function getCurrentNodeMap() {
    return getSceneConfig().nodes;
}

function checkChillHillDebugWin() {
    if (!DEBUG) return;
    if (state.scene !== "chill") return;
    if (!state.player) return;
    if (state.mode !== "playing") return;

    if (state.player.currentNode === "CG" && !state.player.targetNode) {
        onSceneWin();
    }
}

function getCurrentBackgroundImage() {
    if (state.scene === "boss") return spriteStore.ckBackground;
    if (state.scene === "chill") return spriteStore.chillHillBackground || backgroundImage;
    return backgroundImage;
}

function getCurrentEnemyEntryNodeId() {
  const sceneConfig = getSceneConfig();
  const candidateIds = sceneConfig.enemyEntryNodeIds || [];
  const nodeMap = getCurrentNodeMap();

  if (!candidateIds.length) return null;
  if (!state.player) return candidateIds[0];

  let bestId = candidateIds[0];
  let bestDist = -Infinity;

  for (const id of candidateIds) {
    const node = nodeMap[id];
    if (!node) continue;

    const d = Math.hypot(node.x - state.player.x, node.y - state.player.y);
    if (d > bestDist) {
      bestDist = d;
      bestId = id;
    }
  }

  return bestId;
}

function drawDizzyRings() {
  if (!state.player) return;
  if ((state.dizzyTimer || 0) <= 0) return;

  const x = state.player.x;
  const y = state.player.y - 110;
  const t = performance.now() * 0.008;

  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(255,245,140,0.95)";
  ctx.lineWidth = 4;

  for (let i = 0; i < 3; i++) {
    const ang = t + i * (Math.PI * 2 / 3);
    const rx = Math.cos(ang) * 26;
    const ry = Math.sin(ang) * 9;

    ctx.beginPath();
    ctx.arc(rx, ry, 11, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function showBossIntro(level) {
    state.mode = "playing";
    state.sceneWinTimer = 0;
    state.levelIntro = null;
    state.levelUp = null;

    state.loadScreenImage = getSceneCard("boss");

    state.bossIntro = {
        level,
        time: 0,
        duration: 1.8
    };
}


function showLevelIntro(level, nextScene = "main") {
    state.mode = "playing";
    state.sceneWinTimer = 0;
    state.bossIntro = null;
    state.levelUp = null;

    state.loadScreenImage = getSceneCard(nextScene);

    state.levelIntro = {
        level,
        nextScene,
        phase: "card",
        time: 0,
        prepared: false
    };
}

function updateClouds(dt) {
    // if (state.scene !== "main") return;

    const img = spriteStore.clouds;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    state.cloudOffset -= CLOUD_SCROLL_SPEED * dt;

    if (state.cloudOffset <= -canvas.width) {
        state.cloudOffset += canvas.width;
    }
}

function updateBossIntro(dt) {
    if (!state.bossIntro) return;

    state.bossIntro.time += dt;

    if (state.bossIntro.time >= state.bossIntro.duration) {
        state.bossIntro = null;
        startBossMode();
    }
}

function updateBossKongIntro(dt) {
    const intro = state.boss?.kongIntro;
    if (!intro) return;

    intro.timer += dt;

    if (intro.phase === "release") {
        // Give balloons time to float off
        if (intro.timer >= 1.0) {
            intro.phase = "jump";
            intro.timer = 0;
        }
        return;
    }

    if (intro.phase === "jump") {
        // Kong jumps upward off-screen
        intro.kongJumpY -= 900 * dt;

        if (intro.kongJumpY <= -500) {
            intro.kongVisible = false;
            intro.phase = "fall";
            intro.timer = 0;
            startScreenShake(0.45, 18);
            pulseVibrate([40, 30, 40]);
        }
        return;
    }

    if (intro.phase === "fall") {
        intro.kongFallY += 1300 * dt;

        const landY = 610; // set this to your top horizontal lane y
        if (intro.kongFallY >= landY) {
            intro.kongFallY = landY;
            intro.phase = "chase";
            intro.timer = 0;

            startScreenShake(0.45, 22);
            pulseVibrate([50, 35, 50]);

            // start Kong event without a balloon visual
            if (state.kongEvent) {
                forceTriggerKongEvent(state, getCurrentNodeMap, "none");
            }
        }
        return;
    }

    if (intro.phase === "chase") {
        if (state.kongEvent?.active) {
            intro.phase = "done";
        }
    }
}

function drawBossKongIntro() {
    const intro = state.boss?.kongIntro;
    if (!intro) return;

    if (intro.phase === "jump") {
        const img = spriteStore.kongJumping;
        if (img?.complete && img.naturalWidth > 0 && intro.kongVisible) {
            drawAnimatedKongSprite(img, 0, intro.kongJumpY);
        }
        return;
    }

    if (intro.phase === "fall") {
        const img = spriteStore.kongSquat;
        if (img?.complete && img.naturalWidth > 0) {
            drawStaticBossKong(img, 0, intro.kongFallY);
        }
        return;
    }
}

function updateLevelIntro(dt) {
    if (!state.levelIntro) return;

    const li = state.levelIntro;
    li.time += dt;

    if (li.phase === "card") {
        if (li.time >= SCENE_INTRO_TIMING.cardDuration) {
            li.phase = "overlay";
            li.time = 0;

            if (!li.prepared) {
                if (li.nextScene === "main") {
                    startMainScene();
                } else if (li.nextScene === "chill") {
                    startChillHill();
                }
                li.prepared = true;
            }
        }
        return;
    }

    if (li.phase === "overlay") {
        if (li.time >= SCENE_INTRO_TIMING.overlayDuration) {
            state.levelIntro = null;
        }
    }
}

function getSceneIntroFocus(nextScene = "main") {
    if (nextScene === "main") {
        const node = getCurrentNodeMap()[HOME_NODE];
        return node ? {
            x: node.x,
            y: node.y
        } : {
            x: canvas.width * 0.8,
            y: 120
        };
    }

    if (nextScene === "boss") {
        const node = getCurrentNodeMap()[HOME_NODE];
        return node ? {
            x: node.x,
            y: node.y
        } : {
            x: canvas.width / 2,
            y: 180
        };
    }

    if (nextScene === "chill") {
        const node = getCurrentNodeMap()[HOME_NODE];
        return node ? {
            x: node.x,
            y: node.y
        } : {
            x: canvas.width / 2,
            y: 180
        };
    }

    return {
        x: canvas.width / 2,
        y: 180
    };
}

function drawBabyKongPathDebug() {
    if (!DEBUG) return;
    if (state.scene !== "boss") return;
    if (!Array.isArray(babyKongPath) || babyKongPath.length < 1) return;

    ctx.save();

    // Path line
    ctx.strokeStyle = "rgba(0, 255, 255, 0.85)";
    ctx.lineWidth = 5;
    ctx.beginPath();

    for (let i = 0; i < babyKongPath.length; i++) {
        const p = babyKongPath[i];

        if (i === 0) {
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }

    ctx.stroke();

    // Points and labels
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const p of babyKongPath) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.strokeText(p.id, p.x, p.y - 28);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(p.id, p.x, p.y - 28);
    }

    // Current Baby Kong target marker
    const baby = state.boss?.babyKong;
    if (baby) {
        ctx.strokeStyle = "rgba(255, 255, 0, 0.95)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(baby.x, baby.y, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ffff00";
        ctx.font = "bold 22px Arial";
        ctx.fillText(
            `${baby.state || "?"} f:${baby.frame ?? 0}`,
            baby.x,
            baby.y + 34
        );
    }

    ctx.restore();
}

function drawJumpDebugPanel() {
    if (!DEBUG) return;
    if (state.scene !== "boss") return;

    const player = state.player;
    const nodeMap = getCurrentNodeMap();

    const currentNodeId = player?.currentNode || null;
    const targetNodeId = player?.targetNode || null;

    const currentData = currentNodeId ? nodeMap[currentNodeId] : null;
    const targetData = targetNodeId ? nodeMap[targetNodeId] : null;

    const lines = [
        `JUMP DEBUG`,
        `currentNode: ${currentNodeId}`,
        `targetNode: ${targetNodeId}`,
        `current.jumpTo: ${currentData?.jumpTo || "none"}`,
        `target.jumpTo: ${targetData?.jumpTo || "none"}`,
        `jump called: ${!!state.lastJumpDebug?.called}`,
        `jump phase: ${state.lastJumpDebug?.phase || "none"}`,
        `originNodeId: ${state.lastJumpDebug?.originNodeId || "none"}`,
        `jumpToId: ${state.lastJumpDebug?.jumpToId || "none"}`,
        `hasDest: ${state.lastJumpDebug?.hasDest ?? "n/a"}`,
        `playerJump active: ${!!state.playerJump?.active}`,
        `hop active: ${!!state.playerHop?.active}`,
        `x/y: ${Math.round(player?.x || 0)}, ${Math.round(player?.y || 0)}`
    ];

    ctx.save();

    const x = 30;
    const y = 92;
    const w = 430;
    const h = 390;

    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(x, y, w, h);

    ctx.font = "22px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    for (let i = 0; i < lines.length; i++) {
        ctx.fillStyle = i === 0 ? "#ffe066" : "#ffffff";
        ctx.fillText(lines[i], x + 16, y + 14 + i * 28);
    }

    ctx.restore();
}

function toggleDebugConsole() {
  state.showDebugConsole = !state.showDebugConsole;
  debugLog(
    state,
    state.showDebugConsole ? "[DEBUG] console shown" : "[DEBUG] console hidden"
  );
}

function drawDebugConsole() {
    if (!state.showDebugConsole) return;

    const x = canvas.width / 2 + 48;
    const y = canvas.height - 420;
    const w = canvas.width / 2 - 48;
    const h = 320;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffe066";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("DEBUG CONSOLE", x + 18, y + 14);

    const testBtn = {
        x: x + w - 222,
        y: y + 12,
        w: 62,
        h: 28
    };

    const copyBtn = {
        x: x + w - 150,
        y: y + 12,
        w: 62,
        h: 28
    };

    const clearBtn = {
        x: x + w - 78,
        y: y + 12,
        w: 62,
        h: 28
    };

    state.debugTestButton = testBtn;
    state.debugCopyButton = copyBtn;
    state.debugClearButton = clearBtn;

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;

    roundRect(ctx, testBtn.x, testBtn.y, testBtn.w, testBtn.h, 8);
    ctx.fill();
    ctx.stroke();

    roundRect(ctx, copyBtn.x, copyBtn.y, copyBtn.w, copyBtn.h, 8);
    ctx.fill();
    ctx.stroke();

    roundRect(ctx, clearBtn.x, clearBtn.y, clearBtn.w, clearBtn.h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TEST", testBtn.x + testBtn.w / 2, testBtn.y + testBtn.h / 2 + 1);
    ctx.fillText("COPY", copyBtn.x + copyBtn.w / 2, copyBtn.y + copyBtn.h / 2 + 1);
    ctx.fillText("CLEAR", clearBtn.x + clearBtn.w / 2, clearBtn.y + clearBtn.h / 2 + 1);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const lines = (state.debugLogs || []).slice(-11);
    let lineY = y + 52;

    for (const line of lines) {
        ctx.fillText(line, x + 18, lineY);
        lineY += 22;
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

    for (const id in getCurrentNodeMap()) {
        for (const neighborId of getCurrentNodeMap()[id].neighbors) {
            const neighbor = getCurrentNodeMap()[neighborId];
            if (!neighbor) {
                errors.push(`${id} references missing node ${neighborId}`);
                continue;
            }
            if (!neighbor.neighbors.includes(id)) {
                errors.push(`${id} -> ${neighborId} is not bidirectional`);
            }
        }
    }
}

function getBestNeighbor(currentNodeId, inputVec, inputName) {
    const nodeMap = getCurrentNodeMap();
    const current = nodeMap[currentNodeId];
    if (!current) return null;

    if (
        inputName &&
        current.allowedInputs &&
        !current.allowedInputs.includes(inputName)
    ) {
        return null;
    }

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

    // reject weak or backward-ish matches
    // if (bestScore < 0.55) return null;
    if (bestScore < 0.36) return null;

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

function isLockedSecretNode(nodeId) {
    const secret = getSecretRoomConfig();
    if (!secret) return false;
    return !isSecretRoomUnlocked() && nodeId === secret.lockedNodeId;
}

function tryContinueForward(actor) {
    const nodeMap = getCurrentNodeMap();
    const current = nodeMap[actor.currentNode];
    if (!current || !actor.previousNode) return false;

    if (current.stopHere) return false;

    const prev = nodeMap[actor.previousNode];
    if (!prev) return false;

    const options = current.neighbors.filter(
        n => n !== actor.previousNode && !isLockedSecretNode(n)
    );
    if (!options.length) return false;

    if (options.length === 1) {
        actor.targetNode = options[0];
        return true;
    }

    // preserve current travel direction when possible
    const travelDx = current.x - prev.x;
    const travelDy = current.y - prev.y;
    const travelLen = Math.hypot(travelDx, travelDy);
    if (!travelLen) return false;

    const tx = travelDx / travelLen;
    const ty = travelDy / travelLen;

    let bestNeighbor = null;
    let bestScore = -Infinity;

    for (const neighborId of options) {
        const neighbor = nodeMap[neighborId];
        if (!neighbor) continue;

        const dx = neighbor.x - current.x;
        const dy = neighbor.y - current.y;
        const len = Math.hypot(dx, dy);
        if (!len) continue;

        const nx = dx / len;
        const ny = dy / len;
        const score = nx * tx + ny * ty;

        if (score > bestScore) {
            bestScore = score;
            bestNeighbor = neighborId;
        }
    }

    // only auto-continue if one option is a clear continuation
    if (bestScore >= 0.75) {
        actor.targetNode = bestNeighbor;
        return true;
    }

    return false;
}

function startMainScene() {
    state.mode = "playing";
    state.scene = "main";
    state.cardBackground = backgroundImage;
    state.boss = null;
    state.catchAnim = null;
    state.hearts = [];
    state.fieldHearts = [];
    state.flyingHearts = [];
    state.mainSecretUnlocked = false;
    state.mainSecretEntered = false;
    state.mainMotherPose = "sit";
    state.mainMotherTimer = 0;
    state.particles = [];
    state.hands = [];
    state.bananas = [];
    state.sceneWinAwarded = false;
    state.bananasCollectedThisScene = 0;
    state.heartThrowTimer = 2.5;
    state.heartsThrown = 0;
    state.maxActiveHearts = 1;
    state.heartCooldown = 0;
    state.lastHeartNodeId = null;

    state.zookeeper = {
        anim: "idle",
        frame: 0,
        time: 0,
        didThrowSound: false
    };

    state.zookeeper2 = {
        anim: "idle",
        frame: 0,
        time: 0,
        timer: rand(2.5, 6),
        action: "idle",
        actionTimer: 0
    };

    resetActors();
    applyLevelConfig();
    resetScene();
    // debugLog(state, "[AUDIO] playSceneMusic main");
    playSceneMusic({
        sounds,
        isBossScene: false
    });
    state.butterfly = null;
    state.pj = null;
    state.bananaTimestamps = [];
    state.mainEnding = null;
    state.mainSecretEntered = false;
    state.mainMotherPose = "sit";
    state.mainMotherTimer = 0;
    state.pendingHeartThrow = null;
    state.secretRewardsFound = {};
    state.secretRewardPopups = [];
    state.bananaTimestamps = [];
    state.nanaSnatchers = [];
    resetKongEvent(state);
    state.pjRewardBunches = [];
    state.dizzyTimer = 0;
}

function createSceneHeartTargets(count = 3) {
    const nodeIds = [...getBananaNodeIds()];
    const hearts = [];

    while (hearts.length < count && nodeIds.length) {
        const index = Math.floor(Math.random() * nodeIds.length);
        const nodeId = nodeIds.splice(index, 1)[0];

        hearts.push({
            nodeId,
            collected: false
        });
    }

    return hearts;
}
function startBossMode() {
  state.scene = "boss";
  state.mode = "playing";
  state.cardBackground = spriteStore.ckBackground;
  state.catchAnim = null;
  state.hearts = [];
  state.fieldHearts = [];
  state.flyingHearts = [];
  state.particles = [];
  state.sceneWinAwarded = false;
  state.bananasCollectedThisScene = 0;
  state.hands = [];
  state.bananas = [];
  state.heartThrowTimer = 2.5;
  state.heartsThrown = 0;
  state.maxActiveHearts = 1;
  state.heartCooldown = 0;
  state.lastHeartNodeId = null;

  const startNodeId = SCENE_CONFIGS.boss.startNode;
  const start = SCENE_CONFIGS.boss.nodes[startNodeId];

  if (!state.player) {
    state.player = new Player(startNodeId, sharedDeps);
  }

  state.player.currentNode = startNodeId;
  state.player.previousNode = null;
  state.player.targetNode = null;
  state.player.x = start.x;
  state.player.y = start.y;
  state.player.dir = { x: 0, y: 0 };

  state.troops = [];
  state.coconuts = [];

  state.zookeeper = {
    anim: "idle",
    frame: 0,
    time: 0,
    didThrowSound: false
  };

  state.zookeeper2 = {
    anim: "idle",
    frame: 0,
    time: 0,
    timer: rand(2.5, 6),
    action: "idle",
    actionTimer: 0
  };

  state.boss = {
    coconutTimer: 0,
    heartsCollected: 0,
    requiredHearts: 3,
    hearts: [],

    secretReveal: {
      unlocked: false,
      exploding: false,
      exposed: false,
      timer: 0,
      duration: 1.0,
      frame: 0
    },

    babyKong: {
      path: babyKongPath,
      pathIndex: 0,
      x: babyKongPath[0].x,
      y: babyKongPath[0].y,
      targetIndex: 1,
      speed: 85,
      facing: "left",
      state: "walking", // walking | dropping
      frame: 0,
      animTime: 0,
      dropTimer: 0,
      dropCooldown: 2.4
    },

    
    mother: {
      carried: false,
      nodeId: bossConfig.motherStartNode
    }
  };

  state.boss.kongIntro = {
        phase: "tethered", // tethered | release | jump | fall | chase | done
        timer: 0,
        balloonsReleased: false,
        kongVisible: true,
        kongJumpY: 0,
        kongFallY: -400,
        squatLanded: false
    };

    state.screenShake = {
        timer: 0,
        duration: 0,
        magnitude: 0
    };
  state.player.setCarryingMother(false);

  spawnBossRoamers();
  state.bananaTimestamps = [];
  state.mainEnding = null;
  state.mainSecretEntered = false;
  state.mainMotherPose = "sit";
  state.mainMotherTimer = 0;
  state.secretRewardsFound = {};
  state.secretRewardPopups = [];
  refillBananas();
}

function startScreenShake(duration = 0.35, magnitude = 14) {
    state.screenShake.timer = duration;
    state.screenShake.duration = duration;
    state.screenShake.magnitude = magnitude;
}

function pulseVibrate(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

function updateScreenShake(dt) {
    if (!state.screenShake || state.screenShake.timer <= 0) return;
    state.screenShake.timer = Math.max(0, state.screenShake.timer - dt);
}

function triggerBossBalloonRelease() {
    const intro = state.boss?.kongIntro;
    if (!intro || intro.phase !== "tethered") return;

    intro.phase = "release";
    intro.timer = 0;
    intro.balloonsReleased = true;

    // however you're tracking the balloon group
    state.boss.balloons = state.boss.balloons || [];
    for (const b of state.boss.balloons) {
        b.released = true;
    }
}
function startChillHill() {
    state.scene = "chill";
    state.mode = "playing";
    state.boss = null;
    state.catchAnim = null;
    state.hearts = [];
    state.fieldHearts = [];
    state.flyingHearts = [];
    state.particles = [];
    state.hands = [];
    state.bananas = [];
    state.sceneWinAwarded = false;
    state.bananasCollectedThisScene = 0;
    state.heartThrowTimer = 2.5;
    state.heartsThrown = 0;
    state.maxActiveHearts = 1;
    state.heartCooldown = 0;
    state.lastHeartNodeId = null;

    if (!state.player) {
        state.player = new Player(chillConfig.startNode, sharedDeps);
    } else {
        state.player.reset(chillConfig.startNode);
    }

    state.zookeeper = {
        anim: "idle",
        frame: 0,
        time: 0,
        didThrowSound: false
    };

    state.zookeeper2 = {
        anim: "idle",
        frame: 0,
        time: 0,
        timer: rand(2.5, 6),
        action: "idle",
        actionTimer: 0
    };

    state.troops = [];
    state.player.hasBanana = false;

    // debugLog(state, "[AUDIO] playSceneMusic chill");
    playSceneMusic({
        sounds,
        isBossScene: false
    });
    state.bananaTimestamps = [];
    state.mainEnding = null;
    state.mainSecretEntered = false;
    state.mainMotherPose = "sit";
    state.mainMotherTimer = 0;
    state.pendingHeartThrow = null;
    state.pendingHeartThrow = null;
    state.secretRewardsFound = {};
    state.secretRewardPopups = [];
    state.bananaTimestamps = [];
}

function runAudioTest() {
    cancelAudioTest();

    state.audioTestActive = true;
    state.audioTestTimers = [];

    debugLog(state, "[AUDIO] test start");

    state.audioTestTimers.push(setTimeout(() => {
        debugLog(state, "[AUDIO] test pickup");
        playSfx(sounds.pickup, null, "pickup");
    }, 100));

    state.audioTestTimers.push(setTimeout(() => {
        debugLog(state, "[AUDIO] test score");
        playSfx(sounds.score, null, "score");
    }, 500));

    state.audioTestTimers.push(setTimeout(() => {
        debugLog(state, "[AUDIO] test ahh");
        playSfx(sounds.ahh, null, "ahh");
    }, 900));

    state.audioTestTimers.push(setTimeout(() => {
        debugLog(state, "[AUDIO] test victory");
        playSfx(sounds.victory, null, "victory");
        state.audioTestActive = false;
        state.audioTestTimers = [];
    }, 1300));
}

function cancelAudioTest() {
    if (state.audioTestTimers?.length) {
        for (const id of state.audioTestTimers) {
            clearTimeout(id);
        }
    }

    state.audioTestTimers = [];
    state.audioTestActive = false;
}

function unlockAudioOnce() {
    if (inputState.musicStarted || inputState.audioUnlockInProgress) return;

    inputState.audioUnlockInProgress = true;
    debugLog(state, "[AUDIO] attempting silent unlock");

    try {
        const unlockSound = new Howl({
            src: ["assets/squeak.m4a"],
            volume: 0,
            preload: true
        });

        unlockSound.once("play", () => {
            unlockSound.stop();
            inputState.musicStarted = true;
            inputState.audioUnlockInProgress = false;
            debugLog(state, "[AUDIO] silent unlock success");
        });

        unlockSound.once("playerror", (_, err) => {
            inputState.audioUnlockInProgress = false;
            debugLog(state, "[AUDIO] silent unlock failed", String(err));
        });

        unlockSound.play();
    } catch (err) {
        inputState.audioUnlockInProgress = false;
        debugLog(state, "[AUDIO] silent unlock failed", err?.message || String(err));
    }
}

// ======================================================
// LEVEL STATE
// ======================================================

function getLevelConfig() {
    const level = state.level;

    if (level === 1) return {
        troopCount: 3,
        speed: 0.60,
        intelligence: 0.20
    };
    if (level === 2) return {
        troopCount: 3,
        speed: 0.68,
        intelligence: 0.30
    };
    if (level === 3) return {
        troopCount: 4,
        speed: 0.78,
        intelligence: 0.45
    };

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
        hearts: Array.from({
            length: 12
        }, () => ({
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
    showLevelIntro(state.level, "main");
}

function spawnBossRoamers() {
    state.troops = bossConfig.roamingTroopStartNodes.map((nodeId, i) => {
        const troop = new Troop(
            nodeId,
            i === 0 ? "#7c5c46" : "#8d6b52",
            sharedDeps
        );
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
    const fadeOut = bi.time > bi.duration - 0.3 ?
        Math.max((bi.duration - bi.time) / 0.3, 0) :
        1;
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
    const card = state.loadScreenImage || getSceneCard(li.nextScene, li.level);

    // PHASE 1: show scene card only
    if (li.phase === "card") {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (card && card.complete && card.naturalWidth > 0) {
            ctx.drawImage(card, 0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 48px Arial";
            ctx.lineWidth = 6;
            ctx.strokeStyle = "rgba(0,0,0,0.45)";
            ctx.fillStyle = "#fff";
            ctx.strokeText(`Level ${li.level || state.level || 1}`, canvas.width / 2, 110);
            ctx.fillText(`Level ${li.level || state.level || 1}`, canvas.width / 2, 110);
            ctx.restore();
        }

        return;
    }

    // Phase 2: real scene underneath
    if (state.scene === "boss") {
        drawCloudLayer();
        drawCoconutKongBosses();
    }
    drawBackground();
    if (state.scene === "boss") {
        drawBabyKongPathDebug();
    }

    if (state.scene === "main") {
      drawCloudLayer();
    }
    drawZookeeper();
    drawZookeeper2();
    drawBananaState();
    drawFlyingHearts();
    drawFieldHearts();
    drawActors();
        if (state.scene === "boss") {
        drawCoconutKongOverlay();
    }

    drawMainSecretMother();

    if (state.scene === "boss") {
        for (const coconut of (state.coconuts || [])) {
            drawBossCoconut(coconut);
        }
        drawBossMother();
    }

    //const focus = getSceneIntroFocus(li.nextScene);
    const focus = getSceneIntroFocus(li.nextScene);
    focus.y -= 20;
    const progress = Math.min(li.time / SCENE_INTRO_TIMING.overlayDuration, 1);

    const overlayAlpha = SCENE_INTRO_TIMING.overlayAlpha * (1 - progress);
    const r = SCENE_INTRO_TIMING.spotlightRadius;

    // full-screen dim layer with one circular hole
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(focus.x, focus.y, r, 0, Math.PI * 2, true);
    ctx.fill("evenodd");
    ctx.restore();
}

function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function getHeartThrowOrigin() {
    const sceneKey = getSceneKey();
    const box = ZOOKEEPER_LAYOUT[sceneKey].z1;

    return {
        x: box.x + 40,
        y: box.y + 130 + rand(-12, 12)
    };
}

function throwHeartFromZookeeper(zookeeper, targetNodeId) {
    const nodeMap = getCurrentNodeMap();
    const target = nodeMap[targetNodeId];
    if (!target) return;

    const from = getKeeperThrowOrigin(zookeeper);

    state.flyingHearts.push({
        x: from.x,
        y: from.y,
        startX: from.x,
        startY: from.y,
        targetX: target.x,
        targetY: target.y,
        time: 0,
        duration: 1.05,
        targetNodeId
    });
}

function updateFieldHeartLifetime(dt) {
    if (!state.fieldHearts?.length) return;

    for (let i = state.fieldHearts.length - 1; i >= 0; i--) {
        const heart = state.fieldHearts[i];
        if (heart.collected) continue;

        heart.age = (heart.age || 0) + dt;

        if (heart.age >= (heart.life || 6.5)) {
            state.fieldHearts.splice(i, 1);
        }
    }
}

function getKeeperThrowOrigin(keeper) {
    const sceneKey = getSceneKey();
    const throwerKey = keeper === state.zookeeper2 ? "z2" : "z1";
    const box = ZOOKEEPER_LAYOUT[sceneKey][throwerKey];

    let offsetX = 0;
    let offsetY = 0;

    if (keeper === state.zookeeper2) {
        offsetX = -56;
        offsetY = -30;
    }

    return {
        x: box.x + box.w * 0.5 + offsetX,
        y: box.y + box.h * 0.45 + offsetY + rand(-10, 10)
    };
}

function triggerHeartThrow(z, targetNodeId) {
    if (!z || !targetNodeId) return;

    if (z === state.zookeeper2) {
        state.zookeeper2.action = "hearts";
        state.zookeeper2.actionTimer = 0.7;
        state.zookeeper2.anim = "throw";
        state.zookeeper2.frame = 0;
        state.zookeeper2.time = 0;
    }

    state.pendingHeartThrow = {
        keeper: z,
        targetNodeId,
        delay: 0.75
    };
}

function updatePendingHeartThrow(dt) {
    const p = state.pendingHeartThrow;
    if (!p) return;

    p.delay -= dt;
    if (p.delay > 0) return;

    throwHeartFromZookeeper(p.keeper, p.targetNodeId);
    state.pendingHeartThrow = null;
}

function canThrowHeart() {
    if (state.mode !== "playing") return false;
    if (!state.zookeeper2) return false;
    if (state.scene === "boss") {
    const boss = state.boss;
    if (!boss) return false;
    if ((boss.heartsCollected || 0) >= (boss.requiredHearts || 3)) return false;
    } else {
        if ((state.acceptance || 0) >= 3) return false;
    }
    if ((state.heartCooldown || 0) > 0) return false;
    if (state.pendingHeartThrow) return false;

    return getActiveHeartCount() < state.maxActiveHearts;
}

function getHeartTargetCandidates() {
    const nodeIds = getBananaNodeIds();
    const nodeMap = getCurrentNodeMap();
    const playerNode = state.player?.currentNode;

    return nodeIds.filter(nodeId => {
        if (!nodeMap[nodeId]) return false;
        if (nodeId === playerNode) return false;
        if (nodeId === state.lastHeartNodeId) return false;

        if (
            state.lastHeartNodeId &&
            nodeMap[state.lastHeartNodeId]?.neighbors?.includes(nodeId)
        ) {
            return false;
        }

        return true;
    });
}

function chooseHeartTargetNodeId() {
    const candidates = getHeartTargetCandidates();
    if (!candidates.length) return null;
    return choose(candidates);
}

function triggerGiftThrow() {
    if (!state.zookeeper2) return;

    state.zookeeper2.action = "gifts";
    state.zookeeper2.actionTimer = 0.7;
}

function updateKeeperAction(keeper, dt) {
    if (!keeper || !keeper.actionTimer) return;

    keeper.actionTimer -= dt;
    if (keeper.actionTimer <= 0) {
        keeper.actionTimer = 0;
        keeper.action = "idle";
        keeper.anim = "idle";
        keeper.frame = 0;
        keeper.time = 0;
    }
}

function updateFlyingHearts(dt) {
    if (!state.flyingHearts?.length) return;

    for (let i = state.flyingHearts.length - 1; i >= 0; i--) {
        const h = state.flyingHearts[i];
        h.time += dt;

        const t = Math.min(h.time / h.duration, 1);
        const arc = Math.sin(t * Math.PI) * 140;

        h.x = h.startX + (h.targetX - h.startX) * t;
        h.y = h.startY + (h.targetY - h.startY) * t - arc;

        if (t >= 1) {
            state.flyingHearts.splice(i, 1);

            if (!getUncollectedHeartAtNode(h.targetNodeId) && !hasActiveGroundHeart()) {
                state.fieldHearts.push({
                    nodeId: h.targetNodeId,
                    collected: false,
                    age: 0,
                    life: 6.5
                });
            }
        }
    }
}

function drawFlyingHearts() {
    if (!state.flyingHearts?.length) return;

    for (const h of state.flyingHearts) {
        const t = Math.min(h.time / h.duration, 1);
        const pop = 1 + Math.sin(t * Math.PI) * 0.18;

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.scale(pop, pop);
        ctx.font = "54px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("❤️", 0, 0);
        ctx.restore();
    }
}

function drawFieldHearts() {
    if (!state.fieldHearts?.length) return;

    const nodeMap = getCurrentNodeMap();

    for (const heart of state.fieldHearts) {
        if (heart.collected) continue;

        const node = nodeMap[heart.nodeId];
        if (!node) continue;

        const age = heart.age || 0;
        const life = heart.life || 6.5;

        const warningStart = life * 0.68;
        const fadeStart = life * 0.84;

        let alpha = 1;
        if (age > fadeStart) {
            alpha = Math.max(0, 1 - (age - fadeStart) / (life - fadeStart));
        }

        let pulseAmount = 0.06;
        let pulseSpeed = 0.008;

        if (age > warningStart && age <= fadeStart) {
            pulseAmount = 0.28;
            pulseSpeed = 0.020;
        } else if (age > fadeStart) {
            pulseAmount = 0.34;
            pulseSpeed = 0.028;
        }

        const pulse = 1 + Math.sin(performance.now() * pulseSpeed) * pulseAmount;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(node.x, node.y - 24);
        ctx.scale(pulse, pulse);

        if (age > warningStart) {
            const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
            glow.addColorStop(0, "rgba(255,255,255,0.45)");
            glow.addColorStop(0.45, "rgba(255,120,170,0.22)");
            glow.addColorStop(1, "rgba(255,120,170,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, 34, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("❤️", 0, 0);

        ctx.restore();
    }
}

function updateHeartCollection() {
    if (state.mode === "sceneWin" || state.mode === "caveReveal") return;
    if (!state.player || !state.fieldHearts) return;

    for (const heart of state.fieldHearts) {
        if (heart.collected) continue;
        if (heart.nodeId !== state.player.currentNode) continue;

        heart.collected = true;

        const collected = state.fieldHearts.filter(h => h.collected).length;
        state.acceptance = Math.min(3, collected);
        addAcceptanceScore(50, "heart pickup");
        state.heartCooldown = 1.0;
        state.lastHeartNodeId = heart.nodeId;
        state.lastHeartPickupTime = performance.now() / 1000;

        playSfx(sounds.ahh);

        state.hearts.push({
            x: state.player.x,
            y: state.player.y - 10,
            t: 0
        });

        showHeartProgressPopup(state.acceptance);

        if (
            boss.heartsCollected >= boss.requiredHearts &&
            !state.boss.secretReveal?.unlocked
        ) {
            startBossSecretReveal();
        }

        if (collected >= 3) {
            state.mainSecretUnlocked = true;
        }
        break;
    }
}

function startBossSecretReveal() {
    if (!state.boss) return;

    if (!state.boss.secretReveal) {
        state.boss.secretReveal = {};
    }

    state.boss.secretReveal.unlocked = true;
    state.boss.secretReveal.exploding = true;
    state.boss.secretReveal.exposed = false;
    state.boss.secretReveal.timer = 0;
    state.boss.secretReveal.duration = 1.0;
    state.boss.secretReveal.frame = 0;

    playSfx(sounds.explosion);
}

function hasActiveGroundHeart() {
    return (state.fieldHearts || []).some(h => !h.collected);
}

function getUncollectedHeartAtNode(nodeId) {
    return (state.fieldHearts || []).find(h => !h.collected && h.nodeId === nodeId) || null;
}



function updateBabyKong(dt) {
    const baby = state.boss?.babyKong;
    if (!baby || !baby.path?.length) return;

    baby.animTime += dt;

    if (baby.state === "dropping") {
        baby.dropTimer += dt;

        // 12-frame drop sprite, 4x3, about 0.8 sec total
        baby.frame = Math.min(11, Math.floor(baby.dropTimer * 15));

        if (baby.dropTimer >= 0.8) {
            spawnBossCoconutFromBabyKong(baby);

            baby.state = "walking";
            baby.dropTimer = 0;
            baby.dropCooldown = rand(1.8, 3.2);
            baby.frame = 0;
        }

        return;
    }

    baby.dropCooldown -= dt;

    if (baby.dropCooldown <= 0) {
        baby.state = "dropping";
        baby.dropTimer = 0;
        baby.frame = 0;
        return;
    }

    const target = baby.path[baby.targetIndex];
    if (!target) return;

    const dx = target.x - baby.x;
    const dy = target.y - baby.y;
    const dist = Math.hypot(dx, dy);
    const step = baby.speed * dt;

    baby.facing = dx >= 0 ? "right" : "left";
    baby.frame = Math.floor(baby.animTime * 10) % 25;

    if (dist <= step || dist < 1) {
        baby.x = target.x;
        baby.y = target.y;
        baby.pathIndex = baby.targetIndex;

        // ping-pong path
        if (baby.targetIndex >= baby.path.length - 1) {
            baby.direction = -1;
        } else if (baby.targetIndex <= 0) {
            baby.direction = 1;
        }

        baby.direction = baby.direction || 1;
        baby.targetIndex += baby.direction;
        return;
    }

    baby.x += (dx / dist) * step;
    baby.y += (dy / dist) * step;
}
// ==================
// jump
// ==================

function getCurrentJumpDestination(node) {
    if (!node) return null;

    if (node.jumpTo) return node.jumpTo;

    if (Array.isArray(node.jumpNeighbors) && node.jumpNeighbors.length) {
        return node.jumpNeighbors[0];
    }

    return null;
}

function tryPlayerJump() {
    if (!state.player) return false;

    if (state.mode !== "playing") return false;
    if (state.playerJump?.active) return false;

    // Boss-only for now.
    if (state.scene !== "boss") return false;

    if (
    state.scene === "boss" &&
    state.player?.currentNode === "CK13" &&
    !state.player.targetNode
) {
    const nodeMap = getCurrentNodeMap();
    const from = nodeMap.CK13;
    const to = nodeMap.CK14;

    state.playerJump = {
        active: true,
        fromNodeId: "CK13",
        toNodeId: "CK14",
        time: 0,
        duration: 0.48,
        height: 145,
        startX: from.x,
        startY: from.y,
        endX: to.x,
        endY: to.y
    };

    state.player.previousNode = null;
    state.player.targetNode = null;
    state.player.x = from.x;
    state.player.y = from.y;
    state.player.dir = { x: 0, y: 0 };

    return true;
}

    const player = state.player;
    const nodeMap = getCurrentNodeMap();

    const currentNodeId = player.currentNode;
    const targetNodeId = player.targetNode;

    const originNodeId = getPlayerJumpOriginNodeId();
    const originNode = originNodeId ? nodeMap[originNodeId] : null;

    const jumpToId = getCurrentJumpDestination(originNode);
    const dest = jumpToId ? nodeMap[jumpToId] : null;

    state.lastJumpDebug = {
        called: true,
        phase: "resolved",
        currentNode: currentNodeId,
        targetNode: targetNodeId,
        originNodeId,
        jumpToId,
        hasDest: !!dest,
        playerX: Math.round(player.x),
        playerY: Math.round(player.y),
        time: performance.now()
    };

    // NAVIGATION JUMP
    if (originNode && dest) {
        state.playerJump = {
            active: true,
            fromNodeId: originNodeId,
            toNodeId: jumpToId,
            time: 0,
            duration: 0.48,
            height: 145,
            startX: originNode.x,
            startY: originNode.y,
            endX: dest.x,
            endY: dest.y
        };

        // Snap to the launch node so the jump always starts cleanly.
        player.currentNode = originNodeId;
        player.previousNode = null;
        player.targetNode = null;
        player.x = originNode.x;
        player.y = originNode.y;
        player.dir = { x: 0, y: 0 };

        clearQueuedDirectionCompat();

        state.lastJumpDebug.phase = "navigation jump created";
        state.lastJumpDebug.playerJumpActive = true;

        return true;
    }

    // DEFENSIVE HOP
    startPlayerHop();

    state.lastJumpDebug.phase = "defensive hop";
    state.lastJumpDebug.hopActive = true;

    return true;
}

function startPlayerHop() {
    if (!state.playerHop) {
        state.playerHop = {
            active: false,
            timer: 0,
            duration: 0.42,
            height: 95
        };
    }

    if (state.playerHop.active) return;

    state.playerHop.active = true;
    state.playerHop.timer = 0;
    state.playerVisualOffsetY = 0;
}

function updatePlayerHop(dt) {
    const hop = state.playerHop;
    if (!hop?.active) {
        state.playerVisualOffsetY = 0;
        return;
    }

    hop.timer += dt;

    const p = Math.min(hop.timer / hop.duration, 1);
    state.playerVisualOffsetY = -Math.sin(p * Math.PI) * hop.height;

    if (p >= 1) {
        hop.active = false;
        hop.timer = 0;
        state.playerVisualOffsetY = 0;
    }
}

function updatePlayerJump(dt) {
    const jump = state.playerJump;
    if (!jump?.active || !state.player) return false;

    jump.time += dt;

    const p = Math.min(jump.time / jump.duration, 1);
    const arc = Math.sin(p * Math.PI) * jump.height;

    const x = jump.startX + (jump.endX - jump.startX) * p;
    const y = jump.startY + (jump.endY - jump.startY) * p - arc;

    state.player.x = x;
    state.player.y = y;
    state.player.dir = { x: 0, y: 0 };
    state.player.targetNode = null;

    if (p >= 1) {
        state.player.x = jump.endX;
        state.player.y = jump.endY;
        state.player.previousNode = jump.fromNodeId;
        state.player.currentNode = jump.toNodeId;
        state.player.targetNode = null;
        state.player.dir = { x: 0, y: 0 };
        state.playerJump = null;

        return false;
    }
    return true;
}

function isPlayerJumpDodgingCoconut() {
    const hop = state.playerHop;

    if (state.playerJump?.active) {
        return true;
    }

    if (!hop?.active) return false;

    const p = hop.timer / hop.duration;

    // Middle part of the hop avoids low rolling coconuts.
    return p >= 0.22 && p <= 0.82;
}

function checkRopeReturn() {
    if (state.scene !== "boss") return;
    if (!state.player) return;
    if (state.player.targetNode) return;
    if (state.playerJump?.active) return;

    const player = state.player;
    const nodeMap = getCurrentNodeMap();
    const current = nodeMap[player.currentNode];

    if (!current?.returnTo) return;

    if (player.previousNode === current.returnTo) {
        return;
    }

    const requiredInput = current.requireInputForReturn || null;

    if (requiredInput && inputState.queuedDirectionName !== requiredInput) {
        return;
    }

    const dest = nodeMap[current.returnTo];
    if (!dest) return;

    clearQueuedDirectionCompat();

    player.previousNode = null;
    player.targetNode = null;
    player.currentNode = current.returnTo;
    player.x = dest.x;
    player.y = dest.y;
    player.dir = { x: 0, y: 0 };
}

function getPlayerJumpOriginNodeId() {
    const player = state.player;
    if (!player) return null;

    const nodeMap = getCurrentNodeMap();

    // 1. Exact current node.
    const current = nodeMap[player.currentNode];
    if (getCurrentJumpDestination(current)) {
        return player.currentNode;
    }

    // 2. Node we are already moving into.
    if (player.targetNode) {
        const target = nodeMap[player.targetNode];

        if (getCurrentJumpDestination(target)) {
            const distToTarget = Math.hypot(
                target.x - player.x,
                target.y - player.y
            );

            // Forgiving but not huge.
            if (distToTarget <= 115) {
                return player.targetNode;
            }
        }
    }

    // 3. Physical vicinity fallback.
    // This is the phone-friendly part.
    let bestId = null;
    let bestDist = Infinity;

    for (const id in nodeMap) {
        const node = nodeMap[id];
        if (!getCurrentJumpDestination(node)) continue;

        const d = Math.hypot(node.x - player.x, node.y - player.y);

        if (d < bestDist) {
            bestDist = d;
            bestId = id;
        }
    }

    // Tune this. I would start around player diameter + forgiveness.
    // Player radius is 22, so 70-95 is reasonable.
    if (bestId && bestDist <= 90) {
        return bestId;
    }

    return null;
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
    const fadeOut = lu.time > lu.duration - 0.35 ?
        Math.max((lu.duration - lu.time) / 0.35, 0) :
        1;
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
        drawHeartShape(ctx, h.x, h.y, h.size, 0.22 * alpha);
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
            ctx,
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

function drawLevelUpCard(title = "Level Up!") {
    const img = spriteStore.levelUpArt;

    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.fillStyle = "#fff7cc";
    ctx.font = "bold 64px Arial";
    ctx.strokeText(title, canvas.width / 2, canvas.height * 0.18);
    ctx.fillText(title, canvas.width / 2, canvas.height * 0.18);

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 4;
    ctx.strokeText("Tap or press a key to continue", canvas.width / 2, canvas.height * 0.86);
    ctx.fillText("Tap or press a key to continue", canvas.width / 2, canvas.height * 0.86);

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

function drawBackground() {
    const bg = getCurrentBackgroundImage();

    if (bg && bg.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#273b59";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawCoconutKongUnderlay() {
    if (state.scene !== "boss") return;

    const img = spriteStore.ckBackgroundUnderlay;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function drawCloudLayer() {
    // if (state.scene !== "main") return;

    const img = spriteStore.clouds;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const y = 0;
    const w = canvas.width;
    const h = 225;
    const x = state.cloudOffset || 0;

    ctx.drawImage(img, x, y, w, h);
    ctx.drawImage(img, x + w, y, w, h);
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
        drawHeart(ctx, x, y, size, isFilled ? "#d22" : "#fff");
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
        drawHeart(ctx, x, y, size, isFilled ? "#d22" : "#fff");
    }
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
    ctx.fillStyle = "#c8ffd8";

    const leftX = pad;
    const rightTextX = canvas.width - 110;

    // LEFT: banana score + level
    ctx.textAlign = "left";
    ctx.font = "28px Arial";
    ctx.fillText(
      `❤️ ${state.acceptanceScore || 0}   🍌 ${state.score}   ⛰️ ${state.level ?? 1}`,
        leftX,
        h / 2
      );

    // CENTER-ish: hearts
    if (isBossScene() && state.boss) {
        drawBossHeartHud();
    } else {
        drawAcceptanceHearts();
    }

    // RIGHT: monkey-head lives
    ctx.textAlign = "right";
    ctx.font = "28px Arial";
    ctx.fillText(`🐵 ${state.lives}`, rightTextX, h / 2);

    if (state.paused) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 64px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);

        ctx.restore();
    }

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
    ctx.fillText(
        state.isMuted ? "🔇" : "🔊",
        muteButton.x + muteButton.w / 2,
        muteButton.y + muteButton.h / 2 + 1
    );

    ctx.restore();
}

function drawOverlay() {
    if (state.mode === "playing" || state.mode === "sceneEnding") return;

    const bg = getOverlayBackgroundImage();

    ctx.save();

    if (bg && bg.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (state.mode === "gameOver") {
      drawLeaderboardPanel();
    }

    // ctx.fillStyle = "rgba(0,0,0,0.4)";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "#fff8dc";
    // ctx.textAlign = "center";
    // ctx.font = "bold 44px Arial";
    // ctx.fillText("Monkey Mountain Madness", canvas.width / 2, canvas.height / 2 - 40);

    // ctx.font = "30px Arial";
    // let line = "";

    // if (state.mode === "start") {
    //     line = "Tap or use spacebar to begin!";
    // } else if (state.mode === "gameOver") {
    //     line = "Lil' Jab was tossed too many times. Tap to try again.";
    // }

    // if (line) {
    //     ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 8);
    // }

    // ctx.font = "30px Arial";
    // ctx.fillStyle = "#fde68a";
    // ctx.fillText("Human detected. Banana etiquette unacceptable.", canvas.width / 2, canvas.height / 2 + 42);

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

const CAVE_REVEAL_DURATION = 1.0;
const SCENE_WIN_DURATION = 3.0;
const SCENE_INTRO_TIMING = {
    cardDuration: 2.35,
    overlayDuration: 2.0,
    overlayAlpha: 0.75,
    spotlightRadius: 115,
    spotlightSoftness: 110
};

function onSceneWin() {
    state.mode = "caveReveal";
    state.caveTimer = 0;
}

function showSceneWin() {
    state.mode = "sceneWin";
    state.sceneWinTimer = 0;

    const completionBonus = 100;

    // prevent double-add if function fires twice
    if (!state.sceneWinAwarded) {
        state.score += completionBonus;
        state.sceneWinBonus = completionBonus;
        state.sceneWinAwarded = true;
        addAcceptanceScore(100 + ((state.level || 1) * 25), "scene clear");
    }

    state.loadScreenImage =
        spriteStore.sceneCompleteCard ||
        spriteStore.sceneWinCard ||
        spriteStore.levelUpCard;
}

// function getSecretRoomBackgroundImage() {
//     const secret = getSecretRoomConfig();
//     const key = secret?.cutsceneBackgroundKey;

//     if (key && spriteStore[key]) {
//         return spriteStore[key];
//     }

//     return spriteStore.secretRoom_bb || null;
// }

function getSecretRoomBackgroundImage() {
    if (state.scene === "boss") {
        return spriteStore.secretRoom_ck;
    }
    return spriteStore.secretRoom_bb;
}

function drawSceneCompleteOverlay() {
    if (
        state.loadScreenImage &&
        state.loadScreenImage.complete &&
        state.loadScreenImage.naturalWidth > 0
    ) {
        ctx.drawImage(state.loadScreenImage, 0, 0, canvas.width, canvas.height);
    } else {
        drawLevelUpCard("Scene Complete");
        return;
    }

    const completionBonus = state.sceneWinBonus ?? 0;
    const collected = state.bananasCollectedThisScene ?? 0;
    const total = completionBonus + collected;

    const tireUnlocked = !!state.unlocks?.tireSwing;
    const lanternUnlocked = !!state.unlocks?.lantern;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";

    ctx.font = "bold 38px Arial";
    ctx.fillText(`🍌 Completion Bonus: +${completionBonus}`, 185, 315);
    ctx.fillText(`🍌 Collected: +${collected}`, 185, 405);
    ctx.fillText(`TOTAL: 🍌 ${total}`, 185, 505);

    ctx.font = "bold 34px Arial";
    ctx.fillText(
        `🛞 Tire Swing (${tireUnlocked ? "available" : "locked"})`,
        185,
        680
    );
    ctx.fillText(
        `🕯️ Lantern (${lanternUnlocked ? "available" : "locked"})`,
        185,
        755
    );

    ctx.restore();
}

function showBananaPickupPopup(x, y, age) {
    const ripeness = ripenessLabel(age);

    state.particles.push({
        kind: "pickupText",
        x,
        y: y - 56,
        t: 0,
        life: 1.8,
        text: `🍌 ${ripeness.points}x`,
        color: ripeness.color
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

        if (p.kind === "pickupText") {
            const progress = Math.min(p.t / (p.life || 0.9), 1);
            const alpha = 1 - progress;
            const scale = 1 + (1 - progress) * 0.18;
            const px = p.x - 10;
            const py = p.y - progress * 34;

            ctx.save();
            ctx.translate(px, py);
            ctx.scale(scale, scale);

            drawMessagePlate(
                p.text,
                0,
                0,
                alpha, {
                    font: "bold 48px Arial",
                    textColor: p.color || "#fff",
                    plateColor: "rgba(0,0,0,0.42)",
                    lineWidth: 5
                }
            );

            ctx.restore();
        }
    });
}

function showFloatingText(x, y, text, color = "#fff", life = 1.8) {
    state.particles.push({
        kind: "pickupText",
        x,
        y,
        t: 0,
        life,
        text,
        color
    });
}

function showHeartPickupPopup(x, y, count) {
    showFloatingText(
        x,
        y - 64,
        `❤️ ${count}/3`,
        "#ff7aa8",
        1.9
    );
}

function showHeartProgressPopup(count) {
    state.heartProgressPopup = {
        count,
        time: 0,
        duration: 2.5
    };
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
    if (!state.bananas?.length) return;

    for (const banana of state.bananas) {
        if (!banana || banana.collected) continue;
        drawBanana(banana.x, banana.y, banana.size || 1, banana.age || 0);
    }
}

function drawZookeeper() {
    const z = state.zookeeper;
    if (!z) return;

    const img = getZookeeper1Sprite();
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const sceneKey = getSceneKey();
    const box = ZOOKEEPER_LAYOUT[sceneKey].z1;

    const frameCount = 4;
    const frame = z.frame || 0;
    const frameWidth = img.width / frameCount;

    ctx.drawImage(
        img,
        frame * frameWidth, 0,
        frameWidth, img.height,
        box.x, box.y,
        box.w, box.h
    );
}

function drawZookeeper2() {
    const z = state.zookeeper2;
    if (!z) return;

    const img = getZookeeper2Sprite();
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const sceneKey = getSceneKey();
    const box = ZOOKEEPER_LAYOUT[sceneKey].z2;

    const frameCount = 4;
    const frame = z.frame || 0;
    const frameWidth = img.width / frameCount;

    ctx.drawImage(
        img,
        frame * frameWidth, 0,
        frameWidth, img.height,
        box.x, box.y,
        box.w, box.h
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

function handlePortalTravel(actor) {
    if (!actor || !actor.currentNode) return;
    if (actor === state.player && actor.portalCooldown > 0) return;
    if (state.cavePreview) return;

    const portal = resolveScenePortal(actor.currentNode);
    if (!portal) return;

    if (portal.type === "secret" && actor !== state.player) {
        return;
    }

    if (
        portal.type === "secret" &&
        state.scene === "boss" &&
        !state.boss?.mother?.carried
    ) {
        showFloatingText(
            state.player.x,
            state.player.y - 80,
            "Bring Mother!",
            "#fff7cc",
            1.5
        );
        return;
    }

    const nodeMap = getCurrentNodeMap();
    const dest = nodeMap[portal.to];
    if (!dest) return;

    if (portal.type === "cave" && actor === state.player) {
        beginCavePreview(actor.currentNode, portal.to);
        return;
    }

    const fromId = actor.currentNode;

    actor.currentNode = portal.to;
    actor.x = dest.x;
    actor.y = dest.y;
    actor.targetNode = null;

    if (portal.type === "secret") {
        actor.previousNode = null;
        actor.targetNode = null;
        actor.dir = {
            x: 0,
            y: 0
        };

        if (actor === state.player) {
            state.mode = "sceneEnding";
            state.hands = [];
            state.bananas = [];
            state.fieldHearts = [];
            state.flyingHearts = [];
            state.deliveryEvent = null;
            state.deliveryCrate = null;
            state.delayedPopups = [];
            state.nanaSnatchers = [];

            if (state.kongEvent) {
                state.kongEvent.active = false;
                state.kongEvent.phase = "idle";
            }

            if (state.deliveryAhhTimer) {
                clearTimeout(state.deliveryAhhTimer);
                state.deliveryAhhTimer = null;
            }

            state.mainSecretEntered = true;
            state.mainEnding = {
                time: 0,
                phase: "intro",
                frame: 0
            };

            state.mainMotherPose = "sit";
            state.mainMotherTimer = 0;

            state.player.invuln = 999;
            state.player.targetNode = null;
            state.player.dir = {
                x: 0,
                y: 0
            };

            state.catchAnim = null;

            stopAllMusic(sounds);
            cancelDeliveryAhh(state);
            debugLog(state, "[AUDIO] victory attempt");
            playSfx(sounds.victory, null, "victory");
        }

        return;
    }

    if (portal.type === "wrap") {
        actor.previousNode = fromId;

        if (tryConsumeQueuedTurn(actor)) return;

        const dirVec =
            actor.dir && (Math.abs(actor.dir.x) > 0.001 || Math.abs(actor.dir.y) > 0.001)
                ? actor.dir
                : null;

        const nextId = dirVec ? getBestNeighbor(actor.currentNode, dirVec, null) : null;

        if (nextId) {
            actor.targetNode = nextId;
            return;
        }

        tryContinueForward(actor);
        return;
    }

    actor.previousNode = null;
    actor.dir = {
        x: 0,
        y: 0
    };
}

function finishCavePreview() {
    const cp = state.cavePreview;
    if (!cp) return;

    const nodeMap = getCurrentNodeMap();
    const dest = nodeMap[cp.toNodeId || cp.targetNodeId];
    if (!dest || !state.player) {
        state.cavePreview = null;
        return;
    }

    const fromId = cp.fromNodeId || cp.sourceNodeId || state.player.currentNode;

    state.player.currentNode = cp.toNodeId || cp.targetNodeId;
    state.player.previousNode = fromId;
    state.player.targetNode = null;
    state.player.x = dest.x;
    state.player.y = dest.y;
    state.player.invuln = 2.5;
    state.player.portalCooldown = 0.35;
    state.cavePreview = null;

    // Try queued turn first, then push forward out of the cave
    if (!tryConsumeQueuedTurn(state.player)) {
        tryContinueForward(state.player);
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

function releaseTroopFromEntry() {
  const nodeMap = getCurrentNodeMap();
  const spawnNodeId = getCurrentEnemyEntryNodeId();
  if (!spawnNodeId || !nodeMap[spawnNodeId]) return;

  const colors = ["#7c5c46", "#6c4d39", "#8d6b52", "#6f5242"];
  const troop = new Troop(spawnNodeId, choose(colors), sharedDeps);
  troop.startNodeId = spawnNodeId;
  troop.speedMultiplier = 0.75;
  troop.intelligence = 0.30;
  troop.speed = troop.baseSpeed * troop.speedMultiplier;
  troop.hidden = false;
  troop.respawnTimer = 0;

  state.troops.push(troop);
}

function respawnTroopSafely(troop) {
  if (!troop || state.scene !== "main") return;

  const nodeMap = getCurrentNodeMap();
  const spawnNodeId = getCurrentEnemyEntryNodeId();

  if (!spawnNodeId || !nodeMap[spawnNodeId]) return;
  troop.startNodeId = spawnNodeId;
  troop.currentNode = spawnNodeId;
  troop.speed = troop.baseSpeed * troop.speedMultiplier;
  troop.previousNode = null;
  troop.targetNode = null;
  troop.x = nodeMap[spawnNodeId].x;
  troop.y = nodeMap[spawnNodeId].y;
  troop.dir = { x: 0, y: 0 };
  troop.frame = 0;
  troop.animTime = 0;
}

function updateEnemyRelease(dt) {
  if (state.scene !== "main") return;
  if (!state.enemyRelease) return;

  const r = state.enemyRelease;

  if (r.releasedCount < r.targetCount) {
    r.releaseTimer -= dt;
    if (r.releaseTimer <= 0) {
      releaseTroopFromEntry();
      r.releasedCount += 1;
      r.releaseTimer = r.releaseInterval;

      if (r.butterflyUnlocked && !r.butterflyReleased && r.releasedCount >= 1) {
        state.butterfly = createButterfly("BB5", getCurrentNodeMap());
        r.butterflyReleased = true;
      }

      if (r.pjUnlocked && !r.pjReleased && r.releasedCount >= 2) {
        state.pj = createPJ("BB24", getCurrentNodeMap());
        r.pjReleased = true;
      }
    }
    return;
  }

  r.reinforcementTimer -= dt;
  if (r.reinforcementTimer <= 0) {
    releaseTroopFromEntry();
    r.releasedCount += 1;
    r.reinforcementTimer = r.reinforcementInterval;
  }
}

function releaseNanaSnatcherFromEntry() {
  const nodeMap = getCurrentNodeMap();
  const spawnNodeId = getCurrentEnemyEntryNodeId();
  if (!spawnNodeId || !nodeMap[spawnNodeId]) return;

  const snatcher = createNanaSnatcher(spawnNodeId, nodeMap);
  state.nanaSnatchers.push(snatcher);
}

function updateNanaSnatchers(dt) {
  for (const snatcher of state.nanaSnatchers) {
    if (snatcher.hidden) {
      snatcher.respawnTimer -= dt;
      if (snatcher.respawnTimer <= 0) {
        const spawnNodeId = getCurrentEnemyEntryNodeId();
        const nodeMap = getCurrentNodeMap();
        const node = nodeMap[spawnNodeId];
        if (spawnNodeId && node) {
          snatcher.hidden = false;
          snatcher.active = true;
          snatcher.carryingBanana = false;
          snatcher.targetBananaId = null;
          snatcher.exitNodeId = null;
          snatcher.targetNode = null;
          snatcher.previousNode = null;
          snatcher.waitTime = 0;
          snatcher.frame = 0;
          snatcher.animTime = 0;
          snatcher.currentNode = spawnNodeId;
          snatcher.x = node.x;
          snatcher.y = node.y;
        }
      }
      continue;
    }

    updateNanaSnatcher(
      snatcher,
      dt,
      getCurrentNodeMap(),
      state.bananas,
      getCurrentEnemyEntryNodeId
    );
  }
}

function updateNanaSnatcherCollisions() {
  if (state.catchAnim) return;
  if (state.player?.invuln > 0) return;

  for (const snatcher of state.nanaSnatchers) {
    if (!snatcher.active || snatcher.hidden) continue;

    // PJ swats snatcher
    if (
      state.scene === "main" &&
      state.pj?.active &&
      Math.hypot(state.pj.x - snatcher.x, state.pj.y - snatcher.y) < 42
    ) {
      triggerPJSwat(state.pj);
      playSfx(sounds.grunt);
      showFloatingText(snatcher.x, snatcher.y - 36, "Shoo!", "#fff", 0.9);
      spawnPJRewardBunch(snatcher.x, snatcher.y, 8, 16, "snatcher");

      snatcher.hidden = true;
      snatcher.active = false;
      snatcher.respawnTimer = 2.0;

      // reset mission state so it doesn't resume an old cave route
      snatcher.carryingBanana = false;
      snatcher.targetBananaId = null;
      snatcher.exitNodeId = null;
      snatcher.targetNode = null;
      snatcher.previousNode = null;
      snatcher.waitTime = 0;

      continue;
    }

    // Punch collides with snatcher -> same catch logic as troops
    if (distance(state.player, snatcher) < 34) {
      startCatch(snatcher);
      break;
    }
  }
}

function updateSnatcherRelease(dt) {
  if (state.scene !== "main") return;
  if (!state.snatcherRelease) return;

  const r = state.snatcherRelease;

  if (r.releasedCount >= r.targetCount) return;

  r.releaseTimer -= dt;
  if (r.releaseTimer > 0) return;

  releaseNanaSnatcherFromEntry();
  r.releasedCount += 1;
  r.releaseTimer = r.releaseDelay;
}

function applyLevelConfig() {
  const targetCount = Math.max(2, state.level);

  state.enemyRelease = {
    targetCount,
    releasedCount: 0,
    releaseInterval: 5,
    releaseTimer: 3,
    reinforcementInterval: 60,
    reinforcementTimer: 60,
    butterflyUnlocked: !!state.unlocks?.butterfly,
    butterflyReleased: false,
    pjUnlocked: !!state.unlocks?.pj,
    pjReleased: false
  };

  const snatchersActive =
    state.scene === "main" &&
    state.level >= 2;

  state.snatcherRelease = snatchersActive
    ? {
        targetCount: Math.floor(Math.max(2, state.level) / 2),
        releasedCount: 0,
        releaseDelay: 5,
        releaseTimer: 5
      }
    : null;
}

function ripenessLabel(age) {
    if (age >= 9) return {
        label: "Golden",
        points: 3,
        color: "#facc15"
    };
    if (age >= 5) return {
        label: "Yellow",
        points: 2,
        color: "#fde047"
    };
    return {
        label: "Green",
        points: 1,
        color: "#4ade80"
    };
}

function beginGame() {
    debugLog(state, "[FLOW] beginGame called", {
        mode: state.mode,
        scene: state.scene
    });

    if (state.mode === "start") {
        if (DEBUG_LOOP_KONG_SCENE) {
            state.mode = "playing";
            state.levelIntro = null;
            state.bossIntro = null;
            showBossIntro(state.level || 1);
            return;
        }

        state.mode = "levelIntro";
        showLevelIntro(state.level);
        return;
    }

    if (state.mode === "sceneWin") {
        goToNextScene();
        return;
    }

    if (state.mode === "gameOver") {
        state.mode = "playing";
        startGame();
    }
}

const sharedDeps = {
    ctx,
    state,
    inputState,
    spriteStore,
    nodePos,
    choose,
    getBossScale,
    getCurrentNodeMap,
    getBestNeighbor,
    tryConsumeQueuedTurn,
    tryContinueForward,
    updateAnim,
    handlePortalTravel,
    drawSheetFrame,
    drawBanana
};

function resetActors() {
  clearQueuedDirectionCompat();
  queuedDirection = null;
  queuedDirectionName = null;

  const startNodeId = getSceneConfig().startNode;
  state.player = new Player(startNodeId, sharedDeps);
  state.troops = [];
}

function startGame() {
    state.mode = "playing";
    state.paused = false;
    state.scene = "main";
    state.boss = null;
    state.cardBackground = backgroundImage;
    state.loadScreenImage = getLevelCardImage(1);
    state.score = 0;
    state.acceptanceScore = 0;
    state.lives = 3;
    state.hearts = [];
    state.fieldHearts = [];
    state.flyingHearts = [];
    state.mainSecretUnlocked = false;
    state.mainSecretEntered = false;
    state.mainMotherPose = "sit";
    state.mainMotherTimer = 0;
    state.particles = [];
    state.catchAnim = null;
    state.acceptance = 0;
    // state.level = 1;
    state.level = DEBUG ? DEBUG_TEST_LEVEL : 1;    state.levelUp = null;
    state.levelIntro = null;
    state.bossIntro = null;
    state.hands = [];
    state.bananas = [];
    state.bananaTimestamps = [];
    state.zookeeper = {
        anim: "idle",
        frame: 0,
        time: 0,
        didThrowSound: false
    };
    state.zookeeper2 = {
        anim: "idle",
        frame: 0,
        time: 0,
        timer: rand(2.5, 6),
        action: "idle",
        actionTimer: 0
    };
    state.heartThrowTimer = 2.5;
    state.heartsThrown = 0;
    state.maxActiveHearts = 1;
    state.heartCooldown = 0;
    state.lastHeartNodeId = null;

    if (state.zookeeper) {
        state.zookeeper.action = "normal";
        state.zookeeper.actionTimer = 0;
    }
    refillBananas();
    resetActors();
    applyLevelConfig();
    // newRound();
    resetScene();
    debugLog(state, "[AUDIO] playSceneMusic startGame/main");
    playSceneMusic({
        sounds,
        isBossScene: false
    });
    state.bananaTimestamps = [];
    state.mainEnding = null;
    state.mainSecretEntered = false;
    state.mainMotherPose = "sit";
    state.mainMotherTimer = 0;
    state.pendingHeartThrow = null;
    state.secretRewardsFound = {};
    state.secretRewardPopups = [];
    state.bananaTimestamps = [];
    resetKongEvent(state);
    state.pjRewardBunches = [];
    state.dizzyTimer = 0;
    state.unlocks = {
      butterfly: false,
      pj: false,
      snatchers: false,
      kongEvent: false,
      lantern: false,
      tireSwing: false
  };
}

function newRound() {
    queuedDirection = null;
    queuedDirectionName = null;

    state.roundState = "waiting";
    state.catchAnim = null;

    state.player.reset(SCENE_CONFIGS.main.startNode);
    state.troops.forEach(t => t.reset());

    tossBanana();
}

function resetScene() {
    state.inputQueue = [];
    state.roundState = "waiting";
    state.catchAnim = null;

    const startNode = getSceneConfig().startNode;

    state.player.reset(startNode);
    state.troops.forEach(t => t.reset());

    if (state.scene === "main") {
        state.fieldHearts = [];
        state.acceptance = 0;
    }
    refillBananas();
    tossBanana();
    state.pjRewardBunches = [];
}

function getZookeeperThrowOrigin() {
    const sceneKey = getSceneKey();
    const box = ZOOKEEPER_LAYOUT[sceneKey].z1;
    return {
        x: box.x + 40,
        y: box.y + 130 + rand(-20, 20)
    };
}

function spawnNextBanana() {
    refillBananas();
}

function tossBanana() {
    const nodeMap = getCurrentNodeMap();

    const occupiedNodeIds = new Set(
        (state.bananas || []).map(b => b.nodeId)
    );

    const candidateNodeIds = getBananaNodeIds().filter(id => !occupiedNodeIds.has(id));
    if (!candidateNodeIds.length) return;

    const targetNodeId = choose(candidateNodeIds);
    const to = nodeMap[targetNodeId];

    if (!to) {
        console.warn("tossBanana: missing target node", state.scene, targetNodeId);
        return;
    }

    if (!state.zookeeper) {
        state.zookeeper = {
            anim: "idle",
            frame: 0,
            time: 0,
            didThrowSound: false
        };
    }

    state.zookeeper.anim = "throw";
    state.zookeeper.frame = 0;
    state.zookeeper.time = 0;
    state.zookeeper.didThrowSound = false;

    const throwFrom = getZookeeperThrowOrigin();

    const banana = {
        id: `banana_${performance.now()}_${Math.random().toString(36).slice(2, 7)}`,
        nodeId: targetNodeId,
        x: throwFrom.x,
        y: throwFrom.y,
        targetX: to.x,
        targetY: to.y,
        landed: false,
        age: 0,
        size: 1,
        collected: false
    };

    const hand = {
        id: banana.id,
        active: true,
        t: 0,
        duration: 0.9,
        from: throwFrom,
        to: {
            x: to.x,
            y: to.y
        }
    };

    state.bananas.push(banana);
    state.hands.push(hand);
}

function refillBananas() {
    while ((state.bananas?.length || 0) + (state.hands?.length || 0) < MAX_ACTIVE_BANANAS) {
        tossBanana();
    }
}

function ensureBananasAvailable() {
  const activeBananas = (state.bananas || []).filter(b => b && !b.collected).length;
  const activeHands = (state.hands || []).filter(h => h && h.active).length;

  if (activeBananas + activeHands > 1) return;

  tossBanana();
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
            // sounds.step?.play().catch(() => {});
            playSfx(sounds.step);
            z.didThrowSound = true;
        }
    } else {
        z.frame = 0;
    }
}

function updateZookeeper2(dt) {
    const z = state.zookeeper2;
    if (!z) return;

    z.time += dt;

    if (z.action === "hearts" || z.action === "gifts") {
        if (z.time < 0.12) z.frame = 0;
        else if (z.time < 0.24) z.frame = 1;
        else if (z.time < 0.38) z.frame = 2;
        else z.frame = 3;

        updateKeeperAction(z, dt);
        return;
    }

    z.timer -= dt;

    if (z.anim === "idlePeek") {
        if (z.time < 0.18) z.frame = 0;
        else if (z.time < 0.36) z.frame = 1;
        else if (z.time < 0.56) z.frame = 2;
        else if (z.time < 0.80) z.frame = 3;
        else {
            z.anim = "idle";
            z.frame = 0;
            z.time = 0;
            z.timer = rand(2.5, 6);
        }
    } else {
        z.frame = 0;

        if (z.timer <= 0) {
            z.anim = "idlePeek";
            z.frame = 0;
            z.time = 0;
        }
    }
}

function updateHeartThrowing(dt) {
    if (!canThrowHeart()) return;

    state.heartThrowTimer -= dt;
    if (state.heartThrowTimer > 0) return;

    const targetNodeId = chooseHeartTargetNodeId();
    if (!targetNodeId) return;

    triggerHeartThrow(state.zookeeper2, targetNodeId);

    state.heartThrowTimer = 4.0;
}

function getActiveHeartCount() {
    const flying = state.flyingHearts?.length || 0;
    const grounded = (state.fieldHearts || []).filter(h => !h.collected).length;
    return flying + grounded;
}

function updateHands(dt) {
    if (!state.hands?.length || !state.bananas?.length) return;

    for (let i = state.hands.length - 1; i >= 0; i--) {
        const hand = state.hands[i];
        const banana = state.bananas.find(b => b.id === hand.id);

        if (!banana) {
            state.hands.splice(i, 1);
            continue;
        }

        hand.t += dt / hand.duration;
        const t = clamp(hand.t, 0, 1);

        const p0 = hand.from;
        const p2 = hand.to;
        const peak = {
            x: (p0.x + p2.x) / 2 - 40,
            y: Math.min(p0.y, p2.y) - 140 - rand(0, 20)
        };

        const inv = 1 - t;
        banana.x = inv * inv * p0.x + 2 * inv * t * peak.x + t * t * p2.x;
        banana.y = inv * inv * p0.y + 2 * inv * t * peak.y + t * t * p2.y;

        if (t >= 1) {
            hand.active = false;
            banana.landed = true;
            banana.x = banana.targetX;
            banana.y = banana.targetY;

            state.particles.push({
                kind: "bounce",
                x: banana.x,
                y: banana.y + 12,
                t: 0
            });

            state.hands.splice(i, 1);
        }
    }
}

function updateBananas(dt) {
    if (!state.bananas?.length || !state.player) return;

    for (let i = state.bananas.length - 1; i >= 0; i--) {
        const banana = state.bananas[i];

        if (!banana.landed) continue;

        banana.age += dt;
        banana.size = 1 + Math.sin(banana.age * 5) * 0.08;

        if (distance(state.player, banana) >= 30) continue;

        const now = performance.now() / 1000;

        if (!Array.isArray(state.bananaTimestamps)) {
            state.bananaTimestamps = [];
        }

        state.bananaTimestamps.push(now);
        state.bananaTimestamps = state.bananaTimestamps.filter(
            t => now - t <= HIGH_FIVE_WINDOW
        );

        const highFiveCount = state.bananaTimestamps.filter(
            t => now - t <= HIGH_FIVE_WINDOW
        ).length;

        const hatTrickCount = state.bananaTimestamps.filter(
            t => now - t <= HAT_TRICK_WINDOW
        ).length;

        if (highFiveCount >= HIGH_FIVE_COUNT) {
            onHighFive();
            state.bananaTimestamps = [];
        } else if (hatTrickCount >= HAT_TRICK_COUNT) {
            onHatTrick();
            state.bananaTimestamps = [];
        }
        const ripeness = ripenessLabel(banana.age);
        const value = ripeness.points;

        state.score += value;
        state.bananasCollectedThisScene = (state.bananasCollectedThisScene || 0) + value;
        addAcceptanceScore(value, "banana pickup");
        showBananaPickupPopup(
            banana.x,
            banana.y,
            banana.age
        );

        playSfx(sounds.pickup);
        triggerZookeeper2("react");

        state.player.hasBanana = true;
        state.roundState = "chase";

        banana.collected = true;
        state.bananas.splice(i, 1);

        refillBananas();
        break;
    }
}

function spawnPJRewardBunch(x, y, minValue, maxValue, source = "pj") {
    if (state.scene !== "main") return;

    if (!state.pjRewardBunches) {
        state.pjRewardBunches = [];
    }

    const value = randInt(minValue, maxValue);

    state.pjRewardBunches.push({
        id: `pj_reward_${performance.now()}_${Math.random().toString(36).slice(2, 7)}`,
        source,
        x,
        y,
        value,
        age: 0,
        life: source === "snatcher" ? 13.5 : 11.0,
        collected: false
    });
}

function updatePJRewardBunches(dt) {
    if (!state.pjRewardBunches?.length) return;

    for (let i = state.pjRewardBunches.length - 1; i >= 0; i--) {
        const bunch = state.pjRewardBunches[i];

        bunch.age = (bunch.age || 0) + dt;

        if (bunch.age >= (bunch.life || 11)) {
            state.pjRewardBunches.splice(i, 1);
            continue;
        }

        if (
            state.player &&
            Math.hypot(state.player.x - bunch.x, state.player.y - bunch.y) < 54
        ) {
            collectPJRewardBunch(bunch);
            state.pjRewardBunches.splice(i, 1);
        }
    }
}

function collectPJRewardBunch(bunch) {
    if (!bunch) return;

    state.score += bunch.value;
    state.bananasCollectedThisScene =
        (state.bananasCollectedThisScene || 0) + bunch.value;

    addAcceptanceScore(bunch.value, `${bunch.source || "pj"} reward`);

    state.secretRewardPopups.push({
        nodeId: "pjReward",
        type: "bananaBunch",
        value: bunch.value,
        x: bunch.x,
        y: bunch.y - 12,
        time: 0,
        duration: 2.1
    });

    playSfx(sounds.score);
}

function drawPJRewardBunches() {
    if (!state.pjRewardBunches?.length) return;

    const img = spriteStore.bananaBunch;

    for (const bunch of state.pjRewardBunches) {
        const age = bunch.age || 0;
        const life = bunch.life || 11;

        const fadeStart = life * 0.72;
        let alpha = 1;

        if (age > fadeStart) {
            alpha = Math.max(0, 1 - (age - fadeStart) / (life - fadeStart));
        }

        const warning = age > fadeStart;
        const pulseSpeed = warning ? 0.018 : 0.006;
        const pulseAmount = warning ? 0.15 : 0.06;
        const pulse = 1 + Math.sin(performance.now() * pulseSpeed) * pulseAmount;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(bunch.x, bunch.y - 28);
        ctx.scale(pulse, pulse);

        if (warning) {
            const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 42);
            glow.addColorStop(0, "rgba(255,255,255,0.38)");
            glow.addColorStop(0.45, "rgba(250,204,21,0.22)");
            glow.addColorStop(1, "rgba(250,204,21,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, 42, 0, Math.PI * 2);
            ctx.fill();
        }

        if (img?.complete && img.naturalWidth > 0) {
            const w = bunch.source === "snatcher" ? 82 : 70;
            const h = w * (img.naturalHeight / img.naturalWidth);

            ctx.drawImage(
                img,
                -w / 2,
                -h / 2,
                w,
                h
            );
        } else {
            ctx.font = "46px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🍌", 0, 0);
        }

        ctx.restore();
    }
}

function onHighFive() {
    state.score += HIGH_FIVE_BONUS;
    showFloatingText(
        state.player.x,
        state.player.y - 70,
        `🖐️ HIGH FIVE! +${HIGH_FIVE_BONUS} 🍌`,
        "#7df9ff",
        2.2
    );
}

function onHatTrick() {
    state.score += HAT_TRICK_BONUS;
    showFloatingText(
        state.player.x,
        state.player.y - 20,
        `🎩 HAT TRICK! +${HAT_TRICK_BONUS} 🍌`,
        "#ffd700",
        2.0
    );
}

function showChillIntro() {
    state.loadScreenImage =
        spriteStore.chillHillCard ||
        spriteStore.chillHillBackground ||
        spriteStore.levelUpArt ||
        null;

    state.levelIntro = {
        level: state.level,
        time: 0,
        duration: 2.6,
        nextScene: "chill"
    };
}

function goToNextScene() {
    state.mode = "playing";
    state.sceneWinTimer = 0;

    // DEV: keep testing Banana Bonanza only.
    if (DEBUG_LOOP_MAIN_SCENE) {
        startMainScene();
        return;
    }

    // DEV: keep testing Coconut Kong only.
    // If a boss scene completes, restart boss.
    // If another scene somehow completes, send tester into boss.
    if (DEBUG_LOOP_KONG_SCENE) {
        showBossIntro(state.level);
        return;
    }

    if (state.scene === "main") {
        showBossIntro(state.level);
        return;
    }

    if (state.scene === "boss") {
        state.unlocks.butterfly = true;
        state.unlocks.pj = true;
        state.unlocks.kongEvent = true;

        showLevelIntro(state.level, "chill");
        return;
    }

    if (state.scene === "chill") {
        state.level += 1;
        showLevelUp(state.level);
        return;
    }
}

function getSceneKey() {
    if (state.scene === "boss") return "ck";
    if (state.scene === "chill") return "ch";
    return "bb";
}


function getZookeeper1Sprite() {
    const key = getSceneKey();
    return spriteStore[`zookeeper1_${key}`] || null;
}

function getZookeeper2Sprite() {
    const key = getSceneKey();

    if (state.zookeeper2?.action === "gifts") {
        return spriteStore[`zookeeper2_${key}_gifts`] || null;
    }

    if (state.zookeeper2?.action === "hearts") {
        return spriteStore[`zookeeper2_${key}_hearts`] || null;
    }

    return spriteStore[`zookeeper2_${key}_idle`] || spriteStore[`zookeeper2_${key}_hearts`] || null;
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

    // updateBossHeartCollection();
    pickupMotherIfSafe();

    // speed penalty while carrying
    if (state.scene === "boss") {
        const targetSpeed = mother.carried ? 210 : 300;
        state.player.speed += (targetSpeed - state.player.speed) * 0.2;
    }
    // if (
    //     mother.carried &&
    //     state.player.currentNode === bossConfig.goalNode &&
    //     state.boss.heartsCollected >= state.boss.requiredHearts
    // ) {
    //     endBossModeSuccess();
    // }
    return false;
}

function pickupMotherIfSafe() {
    if (state.boss?.motherPickupLock > 0) return;
    const mother = state.boss?.mother;
    if (!mother || mother.carried || !state.player) return;
    // if (!mother || mother.carried) return;

    if (mother.nodeId == null) return;

    const node = getCurrentNodeMap()[mother.nodeId];
    if (!node) return;

    const dist = Math.hypot(state.player.x - node.x, state.player.y - node.y);
    const danger = getBossDangerAtPlayer();

    if (dist <= 36) {
        mother.carried = true;
        state.player?.setCarryingMother(true);
        mother.nodeId = null;
    }
}

function drawBossMother() {
    if (!isBossScene() || !state.boss?.mother) return;

    const img = spriteStore.mother;

    const mother = state.boss.mother;
    if (mother.carried) return;
    if (!mother.nodeId) return;

    const node = getCurrentNodeMap()[mother.nodeId];
    if (!node) return;

    ctx.save();
    ctx.translate(node.x + 40, node.y + 40);

    const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.08;
    ctx.scale(pulse, pulse);

    const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, 190);
    glow.addColorStop(0, "rgba(255,255,180,0.63)");
    glow.addColorStop(0.18, "rgba(255,210,90,0.52)");
    glow.addColorStop(0.45, "rgba(255,140,30,0.32)");
    glow.addColorStop(0.75, "rgba(255,90,0,0.12)");
    glow.addColorStop(1, "rgba(255,60,0,0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.save();

    if (img && img.complete && img.naturalWidth > 0) {
        const cols = 4;
        const frameWidth = img.naturalWidth / cols;
        const frameHeight = img.naturalHeight;
        const frame = mother.groundPose ?? 0;

        ctx.drawImage(
            img,
            frame * frameWidth, 0,
            frameWidth, frameHeight,
            node.x - 44, node.y - 44,
            156, 156
        );
    } else {
        ctx.fillStyle = "#d8b38a";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function dropMother() {
    const mother = state.boss?.mother;
    if (!mother || !mother.carried) return;
    state.boss.motherPickupLock = 0.5;
    let dropNodeId = null;

    if (state.player) {
        dropNodeId = getNearestNodeId(
            state.player.x,
            state.player.y,
            bossNodes,
            120
        );
    }

    if (!dropNodeId) {
        dropNodeId = state.player?.currentNode || bossConfig.motherStartNode;
    }

    mother.carried = false;
    mother.nodeId = dropNodeId;
    mother.groundPose = Math.floor(Math.random() * 4);

    state.player?.setCarryingMother(false);
}

function resetBossPlayerToStart() {
    const start = bossNodes[bossConfig.startNode];
    if (!start || !state.player) return;

    clearQueuedDirectionCompat();
    queuedDirection = null;
    queuedDirectionName = null;

    state.player.invuln = 2.0;
    state.player.currentNode = bossConfig.startNode;
    state.player.previousNode = null;
    state.player.targetNode = null;
    state.player.x = start.x;
    state.player.y = start.y;
    state.player.dir = {
        x: 0,
        y: 0
    };
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
    state.player?.setCarryingMother(false);
}

function updateBossHeartCollection() {
    const boss = state.boss;
    const player = state.player;
    if (!boss || !player || !state.fieldHearts) return;

    for (const heart of state.fieldHearts) {
        if (heart.collected) continue;
        if (heart.nodeId !== player.currentNode) continue;

        heart.collected = true;
        boss.heartsCollected = Math.min(
            boss.requiredHearts || 3,
            (boss.heartsCollected || 0) + 1
        );

        addAcceptanceScore(50, "boss heart pickup");
        state.heartCooldown = 1.0;
        state.lastHeartNodeId = heart.nodeId;
        state.lastHeartPickupTime = performance.now() / 1000;

        playSfx(sounds.ahh);

        state.hearts.push({
            x: player.x,
            y: player.y - 10,
            t: 0
        });

        showHeartProgressPopup(boss.heartsCollected);
        break;
    }
}

function updatePlayer(dt) {
    if (!state.player) return;

    updatePlayerHop(dt);

    if (updatePlayerJump(dt)) {
        checkSecretReward();

        if (state.scene === "boss") {
            updateBossHeartCollection();
        } else {
            updateHeartCollection();
        }

        return;
    }
    const dizzyMult = state.dizzyTimer > 0 ? state.dizzySlowMultiplier : 1;
    state.player.speedMultiplierOverride = dizzyMult;

    state.player.update(dt);

    checkSecretReward();

    if (state.scene === "boss") {
        updateBossHeartCollection();
    } else {
        updateHeartCollection();
    }

    checkRopeReturn();

    if (state.player.portalCooldown > 0) {
        state.player.portalCooldown = Math.max(0, state.player.portalCooldown - dt);
    }

    if (
        state.player.movedThisRound &&
        state.roundState === "waiting" &&
        (state.bananas || []).some(b => b.landed)
    ) {
        state.roundState = "chase";
    }

    if (state.scene === "chill" && state.player.currentNode === chillConfig.goalNode) {
        onSceneWin();
        return;
    }
}

function startCatch(troop) {
    if (state.player?.invuln > 0) return;
    navigator.vibrate?.(120);
    state.catchAnim = {
        troop,
        startX: state.player.x,
        startY: state.player.y,
        endX: SCENE_CONFIGS.main.nodes[HOME_NODE].x,
        endY: SCENE_CONFIGS.main.nodes[HOME_NODE].y,        t: 0,
        duration: 0.8
    };

    state.player.dir = {
        x: 0,
        y: 0
    };
    playSfx(sounds.catch);
}

function updateMainEnding(dt) {
    if (!state.mainEnding) return;

    state.mainEnding.time += dt;

    const secret = getSecretRoomConfig();

    if (secret?.endingType === "butterfly") {
        if (state.mainEnding.time >= 3.0) {
            state.mainEnding.phase = "done";
            showSceneWin();
        }
        return;
    }

    if (state.mainEnding.phase === "intro") {
        if (state.mainEnding.time >= 0.45) {
            state.mainEnding.phase = "hug";
            state.mainEnding.time = 0;
            state.mainEnding.frame = 0;
        }
        return;
    }

    if (state.mainEnding.phase === "hug") {
        const fps = 12;
        const frameCount = 32;

        state.mainEnding.frame = Math.min(
            frameCount - 1,
            Math.floor(state.mainEnding.time * fps)
        );

        if (state.mainEnding.time >= 3.0) {
            state.mainEnding.phase = "done";
            showSceneWin();
        }
    }
}

function updateTroops(dt) {
  for (const troop of state.troops) {
    if (troop.hidden) {
      troop.respawnTimer -= dt;
      if (troop.respawnTimer <= 0) {
        troop.hidden = false;
        troop.respawnTimer = 0;
        respawnTroopSafely(troop);
      }
      continue;
    }

    troop.update(dt);
  }

  if (state.catchAnim) return;
  if (state.player?.invuln > 0) return;

  for (const troop of state.troops) {
    if (troop.hidden) continue;

    if (
      state.scene === "main" &&
      state.pj?.active &&
      Math.hypot(state.pj.x - troop.x, state.pj.y - troop.y) < 42
    ) {
      triggerPJSwat(state.pj);
      playSfx(sounds.grunt);
      showFloatingText(troop.x, troop.y - 36, "Shoo!", "#fff", 0.9);

      spawnPJRewardBunch(troop.x, troop.y, 4, 9, "troop");

      troop.hidden = true;
      troop.respawnTimer = 2.0;
      continue;
    }

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

function respawnPlayerHome() {
    if (!state.player) return;

    clearQueuedDirectionCompat();
    queuedDirection = null;
    queuedDirectionName = null;

    state.catchAnim = null;
    state.hands = [];
    state.bananas = [];

    state.player.reset(SCENE_CONFIGS.main.startNode);
    refillBananas();
    spawnNextBanana();
}

function updateBossCollisions() {
    const player = state.player;
    if (!player) return;
    if (player.invuln > 0) return;
    const mother = state.boss?.mother;

    if (!player || !mother) return;
    if (player.invuln > 0) return;

    for (const troop of state.troops) {
        if (Math.hypot(player.x - troop.x, player.y - troop.y) < 34) {
            if (mother.carried) {
                dropMotherAndResetPlayer();
            } else {
                restartBossLevel();
            }
            return;
        }
    }

  for (const coconut of state.coconuts) {
      if (coconut.hitPlayer) continue;

      if (Math.hypot(player.x - coconut.x, player.y - coconut.y) < 44) {
          if (isPlayerJumpDodgingCoconut()) {
              continue;
          }

          coconut.hitPlayer = true;
          coconut.done = true;

          state.dizzyTimer = state.dizzyDuration || 1.0;

          if (state.player) {
              state.player.speedMultiplierOverride =
                  state.dizzySlowMultiplier || 0.15;
          }

          playSfx(sounds.eOh);
          navigator.vibrate?.([40, 30, 40]);

          return;
      }
  }
}

function endBossModeSuccess() {
    state.boss = null;
    state.coconuts = [];
    state.troops = [];
    showSceneWin();
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

function chooseBossCoconutEntryForBaby(baby) {
    const nodeMap = getCurrentNodeMap();

    let best = null;
    let bestScore = Infinity;

    const dropX = baby.x + getBabyKongCoconutOffsetX(baby);
    const dropY = baby.y + BABY_KONG_DRAW_OFFSET_Y + 150;

    for (const lane of bossCoconutLanes) {
        for (let i = 0; i < lane.length - 1; i++) {
            const nodeId = lane[i];

            if (BABY_KONG_COCONUT_ENTRY_BLOCKLIST.has(nodeId)) {
                continue;
            }

            const node = nodeMap[nodeId];
            if (!node) continue;

            // Only consider nodes meaningfully below the coconut's start point.
            if (node.y <= dropY + 40) continue;

            const dx = Math.abs(node.x - dropX);
            const dy = node.y - dropY;

            // Favor mostly vertical drops over far horizontal jumps.
            const score = dx * 2.25 + dy * 0.35;

            if (score < bestScore) {
                bestScore = score;
                best = {
                    lane,
                    entryIndex: i,
                    node
                };
            }
        }
    }

    return best;
}

function getBabyKongCoconutOffsetX(baby) {
//    return baby.facing === "left" ? 30 : 90;
        return 0;
}

const BABY_KONG_COCONUT_ENTRY_BLOCKLIST = new Set([
  "CK10", // edge portal
  "CK25", // known magnet
  "CK29", // known magnet
  "CK32", // secret reward / magnet risk
  "CK43", // cave
  "CK44", // cave
  "CK45", // cave
  "CK46", // edge portal
  "CK47", // edge portal / right boundary
  "CK48", // edge portal
  "CK50"  // secret/pulsing hole
]);

function chooseBossCoconutLaneForBaby(baby) {
    const nodeMap = getCurrentNodeMap();

    let bestLane = bossCoconutLanes[0];
    let bestDist = Infinity;

    for (const lane of bossCoconutLanes) {
        const first = nodeMap[lane[0]];
        if (!first) continue;

        const d = Math.abs(first.x - baby.x);
        if (d < bestDist) {
            bestDist = d;
            bestLane = lane;
        }
    }

    return bestLane;
}

function updateBossCoconuts(dt) {
    const nodeMap = getCurrentNodeMap();

    for (const coconut of state.coconuts) {
        // First stage: coconut falls/travels from Baby Kong to the lane start.
        if (coconut.fallingFromBaby) {
            coconut.y += coconut.fallSpeed * dt;

            // Keep x fixed during the visual fall.
            if (coconut.y >= coconut.laneStartY) {
                coconut.x = coconut.laneStartX;
                coconut.y = coconut.laneStartY;
                coconut.fallingFromBaby = false;
                coconut.laneIndex = coconut.entryIndex ?? coconut.laneIndex ?? 0;
            }

            continue;
        }
        // if (coconut.droppingToLane) {
        //     const dx = coconut.targetX - coconut.x;
        //     const dy = coconut.targetY - coconut.y;
        //     const dist = Math.hypot(dx, dy);
        //     const step = coconut.speed * dt;

        //     if (dist <= step || dist < 1) {
        //         coconut.x = coconut.targetX;
        //         coconut.y = coconut.targetY;
        //         coconut.droppingToLane = false;
        //     } else {
        //         coconut.x += (dx / dist) * step;
        //         coconut.y += (dy / dist) * step;
        //     }

        //     continue;
        // }

        // Second stage: coconut rolls along its assigned CK lane.
        const nextIndex = coconut.laneIndex + 1;

        if (nextIndex >= coconut.lane.length) {
            coconut.done = true;
            continue;
        }

        const target = nodeMap[coconut.lane[nextIndex]];

        if (!target) {
            debugLog(state, "[BOSS] missing coconut target", {
                nodeId: coconut.lane[nextIndex],
                lane: coconut.lane
            });
            coconut.done = true;
            continue;
        }

        const dx = target.x - coconut.x;
        const dy = target.y - coconut.y;
        const dist = Math.hypot(dx, dy);
        const step = coconut.speed * dt;

        if (dist <= step || dist < 1) {
            coconut.x = target.x;
            coconut.y = target.y;
            coconut.laneIndex = nextIndex;
        } else {
            coconut.x += (dx / dist) * step;
            coconut.y += (dy / dist) * step;
        }
    }

    state.coconuts = state.coconuts.filter(coconut => !coconut.done);
}

function spawnBossCoconutFromBabyKong(baby) {
    const entry = chooseBossCoconutEntryForBaby(baby);

    if (!entry) {
        debugLog(state, "[BOSS] no Baby Kong coconut entry found", {
            babyX: baby.x,
            babyY: baby.y,
            facing: baby.facing
        });
        return;
    }

    const { lane, entryIndex, node } = entry;

    const startX = baby.x + getBabyKongCoconutOffsetX(baby);
    const startY = baby.y + BABY_KONG_DRAW_OFFSET_Y + 150;

    state.coconuts.push({
        source: "babyKong",

        lane,
        laneIndex: entryIndex,

        // Start under Baby Kong's hands/chest.
        x: startX,
        y: startY,

        fallingFromBaby: true,
        fallSpeed: 560,

        // This is now a nearby CK path entry, not lane[0] / CK47.
        laneStartX: node.x,
        laneStartY: node.y,
        entryIndex,

        speed: 300,
        hitPlayer: false
    });
}

function updateBossMode(dt) {
    if (!state.boss) return;
    updateHands(dt);
    updateBananas(dt);
    ensureBananasAvailable();
    updateZookeeper(dt);
    updateZookeeper2(dt);
    updateHeartThrowing(dt);
    updateKeeperAction(state.zookeeper, dt);
    updateKeeperAction(state.zookeeper2, dt);
    updatePendingHeartThrow(dt);
    updateFlyingHearts(dt);
    updateFieldHeartLifetime(dt);
    updatePlayer(dt);
    if (!state.boss) return;
    updateBossSecretReveal(dt);
    updateTroops(dt);
    if (!state.boss) return;

    updateBossMother(dt);
    if (!state.boss || state.scene !== "boss") return;

    updateBabyKong(dt);

    // state.boss.coconutTimer += dt;

    // if (state.boss.coconutTimer >= 2.4) {
    //     state.boss.coconutTimer = 0;
    //     spawnBossCoconut();
    // }

    updateBossCoconuts(dt);
    if (!state.boss || state.scene !== "boss") return;

    updateBossCollisions();
    updateParticles(dt);

    if (state.heartProgressPopup) {
        state.heartProgressPopup.time += dt;
        if (state.heartProgressPopup.time >= state.heartProgressPopup.duration) {
            state.heartProgressPopup = null;
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
        const gotHighScore = maybeStartHighScoreEntry();

        state.mode = "gameOver";
        state.loadScreenImage = getGameOverCardImage();
        state.gameOverTimer = 0;
        state.gameOverDuration = 8;

        if (sounds.music) {
          sounds.music.pause();
          sounds.music.currentTime = 0;
        }
        if (sounds.bossMusic) {
          sounds.bossMusic.pause();
          sounds.bossMusic.currentTime = 0;
        }

        playSfx(sounds.gameOver, null, "gameOver");

        if (gotHighScore) {
          const initials = normalizeInitials(
            prompt("New high score! Enter 3 initials:") || "AAA"
          );

          const updated = insertHighScore(
            state.leaderboard,
            initials || "AAA",
            state.acceptanceScore || 0
          );

          state.leaderboard = updated;
          saveLeaderboard(updated);
        }
        } else {
            respawnPlayerHome();
        }
    }
}

function maybeStartHighScoreEntry() {
  const entries = state.leaderboard || [];
  const score = state.acceptanceScore || 0;

  if (!isHighScore(score, entries)) return false;

  state.enteringHighScore = true;
  state.highScoreInitials = "AAA";
  state.pendingHighScore = score;
  return true;
}

function updateParticles(dt) {
    state.hearts.forEach(h => h.t += dt);
    state.hearts = state.hearts.filter(h => h.t < 1.1);

    state.particles.forEach(p => p.t += dt);

    state.particles = state.particles.filter(p => {
        const maxLife = p.life ?? 1;
        return p.t < maxLife;
    });
    if (state.secretRewardPopups?.length) {
        for (const popup of state.secretRewardPopups) {
            popup.time += dt;
        }

        state.secretRewardPopups = state.secretRewardPopups.filter(
            popup => popup.time < popup.duration
        );
    }
}

function update(dt) {
    if (state.paused) return;

    if (state.levelUp) {
        updateLevelUp(dt);
        return;
    }

    if (state.mode === "caveReveal") {
        state.caveTimer = (state.caveTimer || 0) + dt;
        if (state.caveTimer >= CAVE_REVEAL_DURATION) {
            showSceneWin();
        }
        return;
    }

    if (state.levelIntro) {
        updateLevelIntro(dt);
        return;
    }

    if (state.bossIntro) {
        updateBossIntro(dt);
        return;
    }

    if (state.mode === "sceneEnding") {
        updateMainEnding(dt);
        return;
    }

    if (state.mode === "sceneWin") {
        state.sceneWinTimer = (state.sceneWinTimer || 0) + dt;
        if (state.sceneWinTimer >= SCENE_WIN_DURATION) {
            goToNextScene();
        }
        return;
    }

    if (state.cavePreview) {
        state.cavePreview.time += dt;
        if (state.cavePreview.time >= state.cavePreview.duration) {
            finishCavePreview();
        }
        return;
    }

    if (state.mode === "gameOver") {
      state.gameOverTimer += dt;

      if (state.gameOverTimer >= state.gameOverDuration) {
        state.mode = "start";
        state.cardBackground = spriteStore.gameStartCard;
        state.loadScreenImage = getLevelCardImage(1);
        state.gameOverTimer = 0;
      }

      return;
    }

    if (state.mode !== "playing") return;

    state.heartCooldown = Math.max(0, (state.heartCooldown || 0) - dt);

    if (state.dizzyTimer > 0) {
      state.dizzyTimer = Math.max(0, state.dizzyTimer - dt);
    }

    if (state.scene === "boss") {
        updateBossMode(dt);
        updateClouds(dt);
        return;
    }

    if (state.scene === "chill") {
        updateHands(dt);
        updateBananas(dt);

        if (!state.catchAnim) {
            updatePlayer(dt);
        }

        if (state.player) {
            updateTroops(dt);
        }


        updateZookeeper(dt);
        updateZookeeper2(dt);
        updateHeartThrowing(dt);

        updateKeeperAction(state.zookeeper, dt);
        // updateKeeperAction(state.zookeeper2, dt);
        updatePendingHeartThrow(dt);
        updateFlyingHearts(dt);
        updateFieldHeartLifetime(dt);
        updateCatch(dt);
        updateParticles(dt);

        checkChillHillDebugWin();
        return;
    }

    updateClouds(dt);
    updateHands(dt);
    updateBananas(dt);

  state.deliveryTimer -= dt;

if ((state.scene === "main" || state.scene === "boss")) {
    state.deliveryTimer -= dt;
    if (state.deliveryTimer <= 0 && !state.deliveryEvent && !state.deliveryCrate) {
        spawnDeliveryEvent(state, getCurrentNodeMap);
    }

    updateDeliveryEvent(state, dt, getCurrentNodeMap, sounds);
    updateDeliveryCrate(state, dt, sounds);
}
  if (state.scene === "main" && state.butterfly) {
        updateButterfly(state.butterfly, dt, getCurrentNodeMap(), choose);
    }

    if (state.scene === "main" && state.pj) {
      // updatePJ(state.pj, dt, getCurrentNodeMap(), choose);
      updatePJ(state.pj, dt, getCurrentNodeMap(), state.butterfly, choose);
    }

    if (state.delayedPopups?.length) {
        for (let i = state.delayedPopups.length - 1; i >= 0; i--) {
            const item = state.delayedPopups[i];
            item.delay -= dt;

            if (item.delay <= 0) {
                state.secretRewardPopups.push(item.popup);
                state.delayedPopups.splice(i, 1);
            }
        }
    }

    if (!state.catchAnim) {
        updatePlayer(dt);
    }

    if (state.scene === "main") {
      if (state.scene === "main" && state.kongEvent && !state.kongEvent.introDone) {
        startKongBalloonIntro(state);
      }

      updateKongEvent(state, dt, getCurrentNodeMap);
      updateKongEventCollisions(state, playSfx, sounds);
      maybeTriggerKongEvent(state, getCurrentNodeMap);
      updateEnemyRelease(dt);
      updateSnatcherRelease(dt);
      updateNanaSnatchers(dt);
      updateNanaSnatcherCollisions();
      ensureBananasAvailable();
    }

    if (state.player) {
        updateTroops(dt);
    }

    updatePJRewardBunches(dt);

    if (state.player?.invuln > 0) {
        state.player.invuln = Math.max(0, state.player.invuln - dt);
    }

    if (state.heartProgressPopup) {
        state.heartProgressPopup.time += dt;
        if (state.heartProgressPopup.time >= state.heartProgressPopup.duration) {
            state.heartProgressPopup = null;
        }
    }

    updateZookeeper(dt);
    updateZookeeper2(dt);
    updateHeartThrowing(dt);
    updatePendingHeartThrow(dt);
    updateFlyingHearts(dt);
    updateFieldHeartLifetime(dt);
    updateCatch(dt);
    updateParticles(dt);
}

// ======================================================
// RENDER
// ======================================================

function drawCoconutKongBosses() {
    if (state.scene !== "boss") return;

    const bossImg = spriteStore.bossKong;

    if (bossImg?.complete && bossImg.naturalWidth > 0) {
        // You said bossKong can be placed at 0,0.
        ctx.drawImage(bossImg, 0, 0);
    }

    const baby = state.boss?.babyKong;

    if (baby) {
        drawBabyKong(baby);
    } else {
        const babyImg = spriteStore.babyKong;

        if (babyImg?.complete && babyImg.naturalWidth > 0) {
            // You said static babyKong can be placed at 804,0.
            ctx.drawImage(babyImg, 804, 0);
        }
    }
}

const BABY_KONG_DRAW_OFFSET_X = 0;
const BABY_KONG_DRAW_OFFSET_Y = -180;

function drawBabyKong(baby) {
    if (!baby) return;

    const isDropping = baby.state === "dropping";

    const img = isDropping
        ? spriteStore.babyKongDrop
        : spriteStore.babyKongWalk;

    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const cols = isDropping ? 4 : 5;
    const rows = isDropping ? 3 : 5;
    const totalFrames = isDropping ? 12 : 25;

    const frame = Math.max(0, Math.min(totalFrames - 1, baby.frame || 0));

    const frameWidth = img.naturalWidth / cols;
    const frameHeight = img.naturalHeight / rows;

    const col = frame % cols;
    const row = Math.floor(frame / cols);

    const drawW = 220;
    const drawH = drawW * (frameHeight / frameWidth);

    ctx.save();

    ctx.translate(
        baby.x + BABY_KONG_DRAW_OFFSET_X,
        baby.y + BABY_KONG_DRAW_OFFSET_Y
    );

    if (baby.facing === "left") {
        ctx.scale(-1, 1);
    }

    ctx.drawImage(
        img,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        -drawW / 2,
        0,
        drawW,
        drawH
    );

    ctx.restore();
}

function drawMainEndingOverlay() {
    const ending = state.mainEnding;
    if (!ending) return;

    const bg = getSecretRoomBackgroundImage();
    const t = ending.time || 0;

    if (bg?.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#05030a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const roomGlow = ctx.createRadialGradient(
        cx, cy, 80,
        cx, cy, 780
    );

    roomGlow.addColorStop(0, "rgba(255,230,245,0.10)");
    roomGlow.addColorStop(0.42, "rgba(40,20,65,0.18)");
    roomGlow.addColorStop(1, "rgba(0,0,0,0.58)");

    ctx.fillStyle = roomGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const secret = getSecretRoomConfig();

    if (secret?.endingType === "butterfly") {
        drawSecretRoomButterflyFlutter(cx - 230, cy + 20, t);
        drawSecretRoomPJDance(cx + 220, cy + 300, t);
    } else {
        if (ending.phase === "intro") {
            drawSecretRoomMotherSit(cx, cy + 120);
        } else {
            drawSecretRoomMotherHug(cx, cy + 120, ending.frame || 0);
        }
    }

    ctx.restore();
}

function drawSecretRoomMotherSit(cx, cy) {
    const img = spriteStore.motherSit;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const drawW = 360;
    const drawH = drawW * (img.naturalHeight / img.naturalWidth);

    ctx.drawImage(
        img,
        cx - drawW / 2,
        cy - drawH / 2,
        drawW,
        drawH
    );
}

function drawSecretRoomButterflyFlutter(cx, cy, t) {
    const img = spriteStore.butterfly;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const cols = 4;
    const frameW = img.naturalWidth / cols;
    const frameH = img.naturalHeight;
    const frame = Math.floor(t * 10) % cols;

    const orbitX = Math.cos(t * 1.7) * 70;
    const orbitY = Math.sin(t * 2.4) * 26 + Math.sin(t * 5.5) * 8;

    const drawW = 170;
    const drawH = drawW * (frameH / frameW);

    ctx.drawImage(
        img,
        frame * frameW, 0, frameW, frameH,
        cx + orbitX - drawW / 2,
        cy + orbitY - drawH / 2,
        drawW, drawH
    );
}

function drawSecretRoomPJDance(x, y, t) {
    const img = spriteStore.pjDance;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const cols = 4;
    const rows = 5;
    const totalFrames = cols * rows;

    const frame = Math.floor(t * 10) % totalFrames;

    const frameW = img.naturalWidth / cols;
    const frameH = img.naturalHeight / rows;

    const sx = (frame % cols) * frameW;
    const sy = Math.floor(frame / cols) * frameH;

    const bounce = Math.sin(t * 7) * 8;

    const drawW = 520;
    const drawH = drawW * (frameH / frameW);

    ctx.save();

    ctx.drawImage(
        img,
        sx,
        sy,
        frameW,
        frameH,
        x - drawW / 2,
        y - drawH / 2 + bounce -300,
        drawW,
        drawH
    );

    ctx.restore();
}

function drawSecretRoomMotherHug(cx, cy, frame = 0) {
    const img = spriteStore.motherHug;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const cols = 8;
    const rows = 4;
    const frameCount = 32;
    const safeFrame = Math.max(0, Math.min(frameCount - 1, frame));

    const frameWidth = img.naturalWidth / cols;
    const frameHeight = img.naturalHeight / rows;

    const col = safeFrame % cols;
    const row = Math.floor(safeFrame / cols);

    const drawW = 420;
    const drawH = drawW * (frameHeight / frameWidth);

    ctx.drawImage(
        img,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        cx - drawW / 2,
        cy - drawH / 2,
        drawW,
        drawH
    );
}

function drawSecretHolePulse() {
    const secret = getSecretRoomConfig();
    if (!secret) return;
    if (!secret.pulseAfterUnlock) return;
    if (!isSecretRoomUnlocked()) return;
    if (state.mainEnding) return;

    const node = getCurrentNodeMap()[secret.lockedNodeId];
    if (!node) return;

    const t = performance.now() * 0.0055;
    const pulse = (Math.sin(t) + 1) * 0.5;

    const radius = 72 + pulse * 20;
    const x = node.x;
    const y = node.y - radius * 0.28;

    ctx.save();

    // main hot-pink glow
    const glow = ctx.createRadialGradient(
        x, y, 8,
        x, y, radius
    );
    glow.addColorStop(0, "rgba(255,245,210,0.92)");
    glow.addColorStop(0.18, "rgba(255,170,235,0.72)");
    glow.addColorStop(0.45, "rgba(255,105,210,0.48)");
    glow.addColorStop(0.75, "rgba(255,80,190,0.22)");
    glow.addColorStop(1, "rgba(255,80,190,0)");

    ctx.globalAlpha = 0.82 + pulse * 0.18;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // bright inner core
    const coreR = 26 + pulse * 8;
    const core = ctx.createRadialGradient(
        x, y, 2,
        x, y, coreR
    );
    core.addColorStop(0, "rgba(255,255,230,0.95)");
    core.addColorStop(0.35, "rgba(255,210,245,0.78)");
    core.addColorStop(1, "rgba(255,120,220,0)");

    ctx.globalAlpha = 0.7 + pulse * 0.2;
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawMainSecretMother() {
    if (state.scene !== "main") return;
    if (!state.mainSecretEntered) return;
    if (state.mainEnding) return;

    const node = getCurrentNodeMap()["BB26"];
    if (!node) return;

    const img =
        state.mainMotherPose === "hug" ?
        spriteStore.motherHug :
        spriteStore.motherSit;

    if (!img || !img.complete || img.naturalWidth <= 0) return;

    ctx.drawImage(
        img,
        node.x - 96,
        node.y - 120,
        192,
        192
    );
}

function drawActors() {
    state.player?.draw();
    state.troops.forEach(t => t.draw());
    drawHearts();
    drawParticles();
}

function updateBossSecretReveal(dt) {
    const reveal = state.boss?.secretReveal;
    if (!reveal) return;

    if (!reveal.exploding) return;

    reveal.timer += dt;

    const fps = 20;
    const totalFrames = 32;
    reveal.frame = Math.min(totalFrames - 1, Math.floor(reveal.timer * fps));

    if (reveal.timer >= reveal.duration) {
        reveal.exploding = false;
        reveal.exposed = true;
        reveal.frame = totalFrames - 1;
    }
}

function drawBossSecretRevealLayer() {
    const reveal = state.boss?.secretReveal;
    if (!reveal?.unlocked) return;

    // Once unlocked, show the overlay on the gameplay map.
    const overlay = spriteStore.secretRoom_ck_overlay;
    if (overlay?.complete && overlay.naturalWidth > 0) {
        ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
    }

    // While exploding, draw the explosion sprite animation.
    if (reveal.exploding) {
        drawExplosionSprite(786, 1569, reveal.frame);
    }
}

function drawBossSecretRevealOverlay() {
    if (state.scene !== "boss") return;

    const reveal = state.boss?.secretReveal;
    if (!reveal) return;

    // Once unlocked, draw the static overlay over the map to expose the hole area.
    if (reveal.unlocked) {
        const overlay = spriteStore.secretRoom_ck_overlay;
        if (overlay?.complete && overlay.naturalWidth > 0) {
            ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        }
    }

    // While exploding, draw explosion sprite on top.
    if (reveal.exploding) {
        const img = spriteStore.explosion;
        if (!img || !img.complete || img.naturalWidth <= 0) return;

        const cols = 8;
        const rows = 4;
        const totalFrames = 32;
        const frame = Math.min(totalFrames - 1, reveal.frame || 0);

        const frameW = img.naturalWidth / cols;
        const frameH = img.naturalHeight / rows;

        const sx = (frame % cols) * frameW;
        const sy = Math.floor(frame / cols) * frameH;

        const drawW = 320;
        const drawH = 320;

        const cx = 786;
        const cy = 1569;

        ctx.drawImage(
            img,
            sx, sy, frameW, frameH,
            cx - drawW / 2,
            cy - drawH / 2,
            drawW,
            drawH
        );
    }
}

function drawExplosionSprite(x, y, frameIndex) {
    const img = spriteStore.explosion;
    if (!img || !img.complete || img.naturalWidth <= 0) return;

    const cols = 8;
    const rows = 4;
    const totalFrames = 32;

    const frame = Math.max(0, Math.min(totalFrames - 1, frameIndex));
    const fw = img.naturalWidth / cols;
    const fh = img.naturalHeight / rows;

    const sx = (frame % cols) * fw;
    const sy = Math.floor(frame / cols) * fh;

    const scale = 1.5;
    const drawW = fw * scale;
    const drawH = fh * scale;

    ctx.drawImage(
        img,
        sx, sy, fw, fh,
        Math.round(x - drawW / 2),
        Math.round(y - drawH / 2),
        drawW,
        drawH
    );
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    if (state.screenShake?.timer > 0) {
        const mag = state.screenShake.magnitude * (state.screenShake.timer / state.screenShake.duration);
        const dx = (Math.random() * 2 - 1) * mag;
        const dy = (Math.random() * 2 - 1) * mag;
        ctx.translate(dx, dy);
    }

    if (state.mode === "start") {
        drawStartCard(ctx);
        return;
    }

    if (state.mode === "sceneEnding") {
        drawMainEndingOverlay();
        drawDebugConsole();
        return;
    }

    const showingTransitionCard = !!state.levelUp ||
        !!state.bossIntro ||
        !!state.levelIntro ||
        state.mode === "sceneWin" ||
        state.mode === "caveReveal";

    if (showingTransitionCard) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (state.mode === "caveReveal") {
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = "bold 48px Arial";
            ctx.fillText("Cave Explodes", canvas.width / 2, canvas.height / 2);
            return;
        }

        if (state.mode === "sceneWin") {
            drawSceneCompleteOverlay();
            return;
        }
        drawBossIntroOverlay();
        drawLevelIntroOverlay();
        drawLevelUpOverlay();
        return;
    }
    if (state.scene === "boss") {
        drawCoconutKongUnderlay();
        drawCloudLayer();
        drawCoconutKongBosses();
        drawBossSecretRevealLayer();
        drawDeliveryEvent(ctx, state, spriteStore);
        drawDeliveryCrate(ctx, state, spriteStore);
    }
    drawBackground();

    if (state.scene === "boss") {
        drawBabyKongPathDebug();
    }

    if (state.scene === "main") {
      drawCloudLayer();
    }
    drawZookeeper();
    drawZookeeper2();
    drawDeliveryCrate(ctx, state, spriteStore);
    drawDeliveryEvent(ctx, state, spriteStore);
    drawBananaState();
    drawFlyingHearts();
    drawFieldHearts();
    drawPJRewardBunches();
    if (state.scene === "boss") {
        drawBossSecretRevealOverlay();
    }
    drawActors();
    drawDizzyRings();
    drawMainSecretMother();
    drawSecretHolePulse();

    if (state.scene === "boss") {
        for (const coconut of (state.coconuts || [])) {
            drawBossCoconut(coconut);
        }
        drawBossMother();
    }
    // === debug
    if (DEBUG) {
        drawPathOverlay(ctx, getCurrentNodeMap());
        drawNodeDebugOverlay(getCurrentNodeMap());
        drawNodeLabels();
        drawNodeHighlights();

     //   drawJumpDebugPanel();
    }
    // ===

    drawMainEndingOverlay();
    drawSecretRewardSparkles();
    drawSecretRewardPopups();
    drawHeartProgressPopup();
    drawKongEvent(ctx, state, spriteStore, getCurrentNodeMap);
    for (const snatcher of state.nanaSnatchers) {
      drawNanaSnatcher(ctx, snatcher, spriteStore);
    }
    if (state.butterfly) {
      drawButterfly(ctx, state.butterfly, spriteStore);
    }
    if (state.pj) {
      drawPJ(ctx, state.pj, spriteStore);
    }
    drawHudOverlay();
    drawCavePreview();
    drawDebugConsole();
    drawOverlay();

    ctx.restore();
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
let threeFingerGestureArmed = false;

canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    unlockAudioOnce();

    if (state.mode === "caveReveal") {
        showSceneWin();
        return;
    }

    if (state.mode === "start" || state.mode === "gameOver") {
        beginGame();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (pointInRect(x, y, muteButton)) {
        toggleMute();
        return;
    }

    if (state.showDebugConsole && state.debugTestButton && pointInRect(x, y, state.debugTestButton)) {
        runAudioTest();
        return;
    }

    if (state.showDebugConsole && state.debugCopyButton && pointInRect(x, y, state.debugCopyButton)) {
        copyDebugLogsToClipboard(state);
        return;
    }

    if (state.showDebugConsole && state.debugClearButton && pointInRect(x, y, state.debugClearButton)) {
        clearDebugLogs(state);
        return;
    }

    // Do NOT jump on pointerdown.
    // Wait until pointerup so we can tell tap from swipe.
    touchStart = {
        x,
        y,
        startX: x,
        startY: y,
        time: performance.now(),
        moved: false
    };

    swipeHandled = false;
}, {
    passive: false
});

canvas.addEventListener("pointerup", (e) => {
    if (!touchStart) {
        swipeHandled = false;
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const dx = x - touchStart.startX;
    const dy = y - touchStart.startY;
    const dist = Math.hypot(dx, dy);

    const wasTap =
        !swipeHandled &&
        !touchStart.moved &&
        dist < SWIPE_THRESHOLD;

    if (
        wasTap &&
        state.scene === "boss" &&
        state.mode === "playing"
    ) {
        tryPlayerJump();
    }

    touchStart = null;
    swipeHandled = false;
}, {
    passive: true
});
canvas.addEventListener("pointercancel", () => {
    touchStart = null;
    swipeHandled = false;
}, {
    passive: true
});

document.addEventListener("keydown", (e) => {
  if (e.key === "k" || e.key === "K") {
      const cycle = ["banana", "girl", "godzilla"];
      state.debugKongBalloonIndex = ((state.debugKongBalloonIndex || -1) + 1) % cycle.length;
      forceTriggerKongEvent(state, getCurrentNodeMap, cycle[state.debugKongBalloonIndex]);
      e.preventDefault();
  }

if (e.key.toLowerCase() === "j") {
    tryPlayerJump();
    e.preventDefault();
    return;
}

  if (e.code === "Space" || e.key === " ") {
    if (tryPlayerJump()) {
        e.preventDefault();
        return;
    }
  }

  if (e.key === "`" || e.key === "~") {
      state.showDebugConsole = !state.showDebugConsole;
      e.preventDefault();
  }

   if (state.mode === "caveReveal") {
        showSceneWin();
        return;
    }
    if (e.key === "c" || e.key === "C") {
        startChillHill();
        e.preventDefault();
    }
    if (e.key === "p" || e.key === "p") {
        if (e.key.toLowerCase() === "p") {
            state.paused = !state.paused;
        }
        e.preventDefault();
    }

    if (e.key === "n" || e.key === "N") {
        showBossIntro(state.level ?? 1);
        e.preventDefault();
    }
    if (e.key === "ArrowLeft") {
        setQueuedDirectionCompat(-1, 0, "left");
        e.preventDefault();
    } else if (e.key === "ArrowRight") {
        setQueuedDirectionCompat(1, 0, "right");
        e.preventDefault();
    } else if (e.key === "ArrowUp") {
        setQueuedDirectionCompat(0, -1, "up");
        e.preventDefault();
    } else if (e.key === "ArrowDown") {
        setQueuedDirectionCompat(0, 1, "down");
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

canvas.addEventListener("pointermove", (e) => {
    if (!touchStart) return;

    canvas.style.touchAction = "none";

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    handleSwipeMove(x, y);
}, {
    passive: false
});

function handleSwipeMove(x, y) {
    if (!touchStart) return;

    const dx = x - touchStart.x;
    const dy = y - touchStart.y;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
        return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            setQueuedDirectionCompat(1, 0, "right");
        } else {
            setQueuedDirectionCompat(-1, 0, "left");
        }
    } else {
        if (dy > 0) {
            setQueuedDirectionCompat(0, 1, "down");
        } else {
            setQueuedDirectionCompat(0, -1, "up");
        }
    }

    touchStart = {
        x,
        y
    };
}

canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 3 && !threeFingerGestureArmed) {
        e.preventDefault();
        threeFingerGestureArmed = true;
        toggleDebugConsole();
    }
}, {
    passive: false
});

canvas.addEventListener("touchend", () => {
    if (threeFingerGestureArmed) {
        threeFingerGestureArmed = false;
    }
}, {
    passive: true
});

canvas.addEventListener("touchcancel", () => {
    if (threeFingerGestureArmed) {
        threeFingerGestureArmed = false;
    }
}, {
    passive: true
});
// ======================================================
// LOOP
// ======================================================

function loop(ts) {
    try {
        const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
        state.lastTime = ts;
        update(dt || 0);
        draw();
    // } catch (err) {
    //     console.error("LOOP CRASH", err);
    //     console.log("scene:", state.scene);
    //     console.log("boss:", state.boss);
    //     console.log("player:", state.player);
    //     debugger;
    //     return; // stop the loop so the error stays visible


    // }
    } catch (err) {
    console.error("LOOP CRASH", err);
    console.log("scene:", state.scene);
    console.log("boss:", state.boss);
    console.log("player:", state.player);
    return;
}
    requestAnimationFrame(loop);
}
// ======================================================
// STARTUP
// ======================================================
validateGraph();
state.loadScreenImage = getLevelCardImage(1);
debugLog(state, "[BOOT] game initialized");
requestAnimationFrame(loop);
