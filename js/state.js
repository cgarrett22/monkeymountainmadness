// state.js

export function createInitialState() {
  return {
    mode: "start",
    cardBackground: null,
    loadScreenImage: null,
    levelIntro: null,
    lastTime: 0,
    score: 0,
    acceptanceScore: 0,
    lives: 3,
    acceptance: 0,
    leaderboard: [],
    enteringHighScore: false,
    highScoreInitials: "",
    pendingHighScore: null,
    leaderboardLoaded: false,
    isMuted: false,
    nextAcceptanceUnlock: 3,
    player: null,
    troops: [],
    bananas: [],
    hands: [],
    hearts: [],
    particles: [],
    catchAnim: null,
    zookeeper: { anim: "idle", frame: 0, time: 0, didThrowSound: false },
    zookeeper2: { anim: "idle", frame: 0, time: 0, timer: 3.5 },
    scene: "main",
    cloudOffset: 0,
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
    secretRewardsFound: {},
    secretRewardPopups: [],
    bananaTimestamps: [],
    heartProgressPopup: null,
    deliveryEvent: null,
    deliveryCrate: null,
    deliveryTimer: 18,
    delayedPopups: [],
    pjRewardBunches: [],
    gameOverTimer: 0,
    gameOverDuration: 8,
    debugLogs: [],
    showDebugConsole: false,
    debugCopyButton: null,
    debugClearButton: null,
    debugTestButton: null,
    audioTestTimers: [],
    audioTestActive: false,
    audioUnlockInProgress: false,
    butterfly: null,
    pj: null,
    enemyRelease: null,
    nanaSnatchers: [],
    snatcherRelease: null,
    kongEvent: {
      introDone: false,
      introBalloons: [],
      active: false,
      type: null, // "kongChasesBalloon" | "balloonChasesKong"
      balloonType: null, // "banana" | "girl" | "godzilla"
      phase: "idle", // idle | intro | squat | run
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
    },
    dizzyTimer: 0,
    dizzyDuration: 1.0,
    dizzySlowMultiplier: 0.15,
    unlocks: {
      butterfly: false,
      pj: false,
      snatchers: false,
      kongEvent: false,
      lantern: false,
      tireSwing: false
    },
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