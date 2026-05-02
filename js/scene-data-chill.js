// scene-data-chill.js

export const CHILL_BANANA_NODE_IDS = [
  "CH9",
  "CH12",
  "CH13",
  "CH26",
  "CH27",
  "CH33",
  "CH38",
  "CH49",
  "CH50",
  "CH53"
];

export const chillConfig = {
  startNode: "N71",
  goalNode: "CH1"
};

export const chillPortals = {
  cave: {
    CH23: "CH51",
    CH51: "CH23",
    CH22: "CH25",
    CH25: "CH22",
    CH5: "CH4",
    CH4: "CH5"
  },
  wrap: {
    CH37: "CH11",
    CH11: "CH37",
    CH56: "CH40",
    CH40: "CH56"
  }
};

export const chillEnemyEntryNodeIds = ["Ch22", "CH51"];


export const chillSecretRewards = {
  CH44: {
    type: "bananaBunch",
    x: 1014,
    y: 951,
    min: 5,
    max: 10
  },
  CH46: {
    type: "bananaBunch",
    x: 669,
    y: 1453,
    min: 5,
    max: 10
  },
    CH47: {
    type: "bananaBunch",
    x: 185,
    y: 1438,
    min: 5,
    max: 10
  }
};

export const chillSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "CH1",
  entryNodeId: "CH1",
  destinationNodeId: "CH1",
  unlockCondition: "heartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "secretRoom_ch",
  endingType: "chillJab"
};