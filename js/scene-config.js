// scene-config.js

import { HOME_NODE } from "./config.js";
import {
  bananaBonanzaSecretRoom,
  bananaBonanzaPortals,
  bananaBonanzaEnemyEntryNodeIds
} from "./scene-data-banana-bonanza.js";
import { bananaBonanzaNodes } from "./scene-data-banana-bonanza-nodes.js";
import { bossNodes } from "./scene-data-boss-nodes.js";
import { chillNodes } from "./scene-data-chill-nodes.js";
import {
  bossConfig,
  coconutKongPortals,
  coconutKongSecretRoom,
  coconutKongEnemyEntryNodeIds
} from "./scene-data-boss.js";

import {
  chillConfig,
  chillPortals,
  chillSecretRoom,
  chillEnemyEntryNodeIds
} from "./scene-data-chill.js";

export const SCENE_CONFIGS = {
  main: {
    nodes: bananaBonanzaNodes,
    startNode: HOME_NODE,
    secretRoom: bananaBonanzaSecretRoom,
    portals: bananaBonanzaPortals,
    enemyEntryNodeIds: bananaBonanzaEnemyEntryNodeIds
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
      requiredForExit: false
    }
  }
};