export const TICKET_TIME_BANANA_NODE_IDS = [
  "TT7",
  "TT11",
  "TT13",
  "TT18",
  "TT20",
  "TT25",
  "TT29",
  "TT30"
];

export const ticketTimeConfig = {
  startNode: "TT1",
  goalNode: "TT28"
};

export const ticketTimePortals = {
  cave: {
    TT34: "TT23",
    TT23: "TT34"
  },
  wrap: {}
};

export const ticketTimeEnemyEntryNodeIds = [
  // Leave empty for now unless you want enemies emerging in this utility scene.
  // "TT34",
  // "TT23"
];

export const ticketTimeSecretRewards = {
  TT31: {
    type: "bananaBunch",
    x: 587,
    y: 751,
    min: 5,
    max: 10
  },
  TT33: {
    type: "bananaBunch",
    x: 146,
    y: 1713,
    min: 5,
    max: 10
  }
};

export const ticketTimeSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "TT28",
  entryNodeId: "TT28",
  destinationNodeId: "TT28",
  unlockCondition: "heartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "secretRoom_tt",
  endingType: "sceneEnd"
};