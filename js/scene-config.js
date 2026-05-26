// scene-config.js

// banana bonanza
import { HOME_NODE } from "./config.js";

import {
  bananaBonanzaSecretRoom,
  bananaBonanzaPortals,
  bananaBonanzaEnemyEntryNodeIds
} from "./scene-data-banana-bonanza.js";
import { bananaBonanzaNodes } from "./scene-data-banana-bonanza-nodes.js";

// boss/coconut kong
import { bossNodes } from "./scene-data-boss-nodes.js";
import { chillNodes } from "./scene-data-chill-nodes.js";
import {
  bossConfig,
  coconutKongPortals,
  coconutKongSecretRoom,
  coconutKongEnemyEntryNodeIds
} from "./scene-data-boss.js";

// chill
import {
  chillConfig,
  chillPortals,
  chillSecretRoom,
  chillEnemyEntryNodeIds
} from "./scene-data-chill.js";


// ticketTime
import { ticketTimeNodes } from "./scene-data-ticket-time-nodes.js";

import {
  ticketTimeConfig,
  ticketTimePortals,
  ticketTimeSecretRoom,
  ticketTimeEnemyEntryNodeIds
} from "./scene-data-ticket-time.js";

// ===== scene-config.js patch for Ichi Cafe =====
import { ichiCafeNodes } from "./scene-data-ichi-cafe-nodes.js";
import { ichiCafeConfig, ichiCafePortals, ichiCafeSecretRoom, ichiCafeEnemyEntryNodeIds } from "./scene-data-ichi-cafe.js";

// ===== scene-config.js patch for Monkey Forest =====
import { monkeyForestNodes } from "./scene-data-monkey-forest-nodes.js";
import {
  monkeyForestConfig,
  monkeyForestPortals,
  monkeyForestSecretRoom,
  monkeyForestEnemyEntryNodeIds,
  monkeyForestCardMeta
} from "./scene-data-monkey-forest.js";

export const SCENE_CARD_CONFIGS = {
  main: {
    title: "BANANA BONANZA",
    backgroundKey: "mainBackground",
    zoneColor: "#a487ff",
    textColor: "#ffffff",

    objectives: [
      { text: "COLLECT 3 HEARTS", iconKey: "heart" },
      { text: "FIND YOUR SAFE PLACE", iconKey: "safePlace" }
    ],

    introduction: {
      title: "Introducing The Bullies",
      text: "Collect your hearts and bananas, but avoid the bullies or you may get tossed!",
      imageKey: "troopRun",
      sheet: { cols: 4, rows: 3, frame: 1 },
      maxW: 430,
      maxH: 360
    },

    watermarkImageKey: "bananaBonanzaIcon",
    watermarkAlpha: 0.15,
    watermarkMaxSize: 850,

    fallbackImageKey: "cardSafePlaceIcon"
  },

  boss: {
    title: "COCONUT KONG",
    backgroundKey: "ckBackground",
    zoneColor: "#a487ff",
    textColor: "#ffffff",

    objectives: [
      { text: "COLLECT 3 HEARTS", iconKey: "heart" },
      { text: "KEEP MOTHER SAFE", iconKey: "mother" },
      { text: "FIND YOUR SAFE PLACE", iconKey: "safePlace" }
    ],

    introduction: {
      title: "Introducing Baby Kong",
      text: "Baby Kong drops coconuts from above. Watch the paths and jump when you need to!",
      imageKey: "babyKongDrop",
      sheet: { cols: 4, rows: 3, frame: 0 },
      maxW: 430,
      maxH: 380
    },

    watermarkImageKey: "coconutKongIcon",
    watermarkAlpha: 0.15,
    watermarkMaxSize: 850,

    fallbackImageKey: "cardSafePlaceIcon"
  },

  chill: {
    title: "CHILL HILL",
    backgroundKey: "chillHillBackground",
    zoneColor: "#a487ff",
    textColor: "#ffffff",

    objectives: [
      { text: "COLLECT 3 HEARTS", iconKey: "heart" },
      { text: "KEEP MOTHER SAFE", iconKey: "mother" },
      { text: "FIND YOUR SAFE PLACE", iconKey: "safePlace" }
    ],

    introduction: {
      title: "Introducing Mother Oran",
      text: "Find Mother and keep her with you. She’ll help keep you safe. Pick her up quickly if she’s dropped!",
      imageKey: "motherSit",
      maxW: 430,
      maxH: 430
    },

    watermarkImageKey: "chillHillIcon",
    watermarkAlpha: 0.15,
    watermarkMaxSize: 850,

    fallbackImageKey: "cardSafePlaceIcon"
  },

  monkeyForest: monkeyForestCardMeta,

  ticketTime: {
    title: "TICKET TIME",
    backgroundKey: "ticketTimeBackground",
    zoneColor: "#22b8d8",
    textColor: "#ffffff",

    objectives: [
      { text: "COLLECT 3 HEARTS", iconKey: "heart" },
      { text: "KEEP MOTHER SAFE", iconKey: "mother" },
      { text: "FIND YOUR SAFE PLACE", iconKey: "safePlace" }
    ],

    introduction: null,

    watermarkImageKey: "ticketTimeIcon",
    watermarkAlpha: 0.15,
    watermarkMaxSize: 850,

    fallbackImageKey: "cardSafePlaceIcon"
  },

  ichiCafe: {
    title: "ICHI CAFE",
    backgroundKey: "ichiCafeBackground",
    zoneColor: "#a487ff",
    textColor: "#ffffff",

    objectives: [
      { text: "COLLECT 3 HEARTS", iconKey: "heart" },
      { text: "KEEP MOTHER SAFE", iconKey: "mother" },
      { text: "FIND YOUR SAFE PLACE", iconKey: "safePlace" }
    ],

    introduction: null,

    watermarkImageKey: "ichiCafeIcon",
    watermarkAlpha: 0.15,
    watermarkMaxSize: 850,

    fallbackImageKey: "cardSafePlaceIcon"
  },
};

export const SCENE_CONFIGS = {
  main: {
  nodes: bananaBonanzaNodes,
  startNode: HOME_NODE,
  secretRoom: bananaBonanzaSecretRoom,
  portals: bananaBonanzaPortals,
  enemyEntryNodeIds: bananaBonanzaEnemyEntryNodeIds,
  mother: {
    enabledAfterAcquired: true,
    startNode: "BB24", // tune if placement feels wrong
    requiredForExit: true
  }
},

  boss: {
    nodes: bossNodes,
    startNode: bossConfig.startNode,
    secretRoom: coconutKongSecretRoom,
    portals: coconutKongPortals,
    enemyEntryNodeIds: coconutKongEnemyEntryNodeIds,
    mother: {
      enabledAfterAcquired: true,
      startNode: bossConfig.motherStartNode,
      requiredForExit: true
    }
  },

  chill: {
    nodes: chillNodes,
    startNode: chillConfig.startNode,
    secretRoom: chillSecretRoom,
    portals: chillPortals,
    enemyEntryNodeIds: chillEnemyEntryNodeIds,
    mother: {
      enabledAfterAcquired: true,
      startNode: "CH13", // tune later if placement feels wrong
      requiredForExit: true 
    }
  },

  ticketTime: {
    nodes: ticketTimeNodes,
    startNode: ticketTimeConfig.startNode,
    secretRoom: ticketTimeSecretRoom,
    portals: ticketTimePortals,
    enemyEntryNodeIds: ticketTimeEnemyEntryNodeIds,
    mother: {
      enabledAfterAcquired: true,
      startNode: "TT30",
      requiredForExit: true
    }
  },
  // Add inside SCENE_CONFIGS:
  ichiCafe: {
    nodes: ichiCafeNodes,
    startNode: ichiCafeConfig.startNode,
    secretRoom: ichiCafeSecretRoom,
    portals: ichiCafePortals,
    enemyEntryNodeIds: ichiCafeEnemyEntryNodeIds,
    systems: {
      troops: false,
      nanaSnatchers: false,
      delivery: false,
      kongEvent: false,
      utilityKeepers: true,
      trafficHazards: false,
      swim: false
    },
    utilityBonus: {
      enabled: true,
      duration: 45,
      secretRewardMultiplier: 4,
      secretRewardRespawnSeconds: 6,
      utilityKeeperLoot: true
    },
    mother: {
      enabledAfterAcquired: true,
      startNode: "IC1",
      requiredForExit: true
    }
  },
  monkeyForest: {
    nodes: monkeyForestNodes,
    startNode: monkeyForestConfig.startNode,
    secretRoom: monkeyForestSecretRoom,
    portals: monkeyForestPortals,
    enemyEntryNodeIds: monkeyForestEnemyEntryNodeIds,
    systems: {
      troops: true,
      nanaSnatchers: false,
      delivery: true,
      kongEvent: false,
      utilityKeepers: false,
      trafficHazards: false,
      swim: false
    },
    mother: {
      enabledAfterAcquired: true,
      // startNode: monkeyForestConfig.startNode,
      startNode: "MF22",
      requiredForExit: true
    }
  },
};
