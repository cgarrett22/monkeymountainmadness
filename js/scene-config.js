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
import { bossConfig } from "./scene-data-boss.js";
import { chillConfig } from "./scene-data-chill.js";

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
    secretRoom: null,
    portals: {
      cave: {
        M0C: "M1C",
        M1C: "M0C"
      },
      wrap: {}
    }
  },

  chill: {
    nodes: chillNodes,
    startNode: chillConfig.startNode,
    secretRoom: null,
    portals: {
      cave: {},
      wrap: {}
    }
  }
};