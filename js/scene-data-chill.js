export const CHILL_BANANA_NODE_IDS = [
  "CH1",
  "CH5",
  "CH9",
  "CH10",
  "CH13",
  "CH15",
  "CH17",
  "CH25",
  "CH37",
  "CH40"
];

export const chillConfig = {
  startNode: "CH26",
  goalNode: "CH38"
};

export const chillPortals = {
  // Best-guess edge wraps based on near-edge x positions and closest vertical pairing.
  wrap: {
    CH3: "CH44",
    CH44: "CH3",
    CH14: "CH8",
    CH8: "CH14",
    CH39: "CH6",
    CH6: "CH39"
  },

  // Best guess. There are four leftover non-secret cave candidates, not three.
  cave: {
    CH30: "CH32",
    CH32: "CH29",
    CH29: "CH30"
  }
};

export const chillEnemyEntryNodeIds = [
  "CH14",
  "CH29",
  "CH30",
  "CH32"
];

export const chillSecretRewards = {
  CH22: {
    type: "bananaBunch",
    x: 1000,
    y: 950,
    min: 5,
    max: 10
  },
  CH23: {
    type: "bananaBunch",
    x: 730,
    y: 1506,
    min: 5,
    max: 10
  },
  CH24: {
    type: "bananaBunch",
    x: 309,
    y: 1540,
    min: 5,
    max: 10
  }
};

export const chillDeliveryRoute = [
  "CH3",
  "CH2",
  "CH31",
  "CH1",
  "CH27",
  "CH5",
  "CH6"
];

export const chillSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "CH38",
  entryNodeId: "CH38",
  destinationNodeId: "CH38",
  unlockCondition: "heartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "secretRoom_ch",
  endingType: "chillJab"
};