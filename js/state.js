// state.js

export function createInitialState() {
  return {
    mode: "start",
    cardBackground: null,
    loadScreenImage: null,
    levelIntro: null,
    lastTime: 0,
    score: 0,
    lives: 3,
    acceptance: 0,
    isMuted: false,
    nextAcceptanceUnlock: 3,
    player: null,
    troops: [],
    banana: null,
    hand: null,
    hearts: [],
    particles: [],
    catchAnim: null,
    zookeeper: { anim: "idle", frame: 0, time: 0, didThrowSound: false },
    zookeeper2: { anim: "idle", frame: 0, time: 0, timer: 3.5 },
    scene: "main",
    boss: null,
    bossIntro: null,
    roundState: "waiting",
    cavePreview: null,
    level: 1,
    levelUp: null,
    coconuts: [],
    fieldHearts: [],
    flyingHearts: [],
    heartCooldown: 0,
    lastHeartNodeId: null,
    lastHeartPickupTime: 0,
    mainEnding: null,
    mainSecretUnlocked: false,
    mainSecretEntered: false,
    mainMotherPose: "sit",
    mainMotherTimer: 0,
    pendingHeartThrow: null,
    //shrubBonusesFound: {},
    //bananaBunchPopup: null,
    secretRewardsFound: {},
    secretRewardPopups: [],
    bananaTimestamps: [],
    heartProgressPopup: null,
    deliveryEvent: null,
    deliveryCrate: null,
    deliveryTimer: 18,
  };
}

export function createKeysState() {
  return {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  };
}

export function createInputState() {
  return {
    musicStarted: false,
    touchStart: null,
    swipeHandled: false,
    queuedDirection: null,
    queuedDirectionName: null
  };
}

export function setQueuedDirection(inputState, x, y, name) {
  inputState.queuedDirection = { x, y };
  inputState.queuedDirectionName = name;
}

export function clearQueuedDirection(inputState) {
  inputState.queuedDirection = null;
  inputState.queuedDirectionName = null;
}