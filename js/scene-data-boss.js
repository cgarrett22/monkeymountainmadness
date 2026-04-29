// scene-data-boss.js

export const bossConfig = {
  startNode: "CK1",
  goalNode: "CK50",
  motherStartNode: "CK12",
  roamingTroopStartNodes: ["CK25"],
  coconutThrowerNode: "CK47",
  bananaNodes: [
    "CK4",
    "CK12",
    // "CK13",
    "CK17",
    "CK21",
    "CK25",
    "CK35",
    "CK37",
    "CK40",
    "CK41"
  ]
};

export const bossCoconutLanes = [
  // ["CK30", "CK29", "CK28", "CK24", "CK22", "CK37", "CK36", "CK40", "CK39", "CK4", "CK1", "CK2", "CK3"],
  ["CK30", "CK31", "CK32", "CK33", "CK34", "CK41", "CK40", "CK39", "CK4", "CK1", "CK2", "CK3"],
  // ["CK42", "CK20", "CK23", "CK22", "CK37", "CK36", "CK40", "CK39", "CK4", "CK1", "CK2", "CK3"],
  ["CK29", "CK28", "CK24", "CK25", "CK22", "CK37", "CK36", "CK40", "CK39", "CK4", "CK1", "CK2", "CK3"],
  ["CK23", "CK20", "CK21", "CK18", "CK17", "CK16", "CK15", "CK14", "CK13", "CK12", "CK49", "CK4", "CK1", "CK2", "CK3"],
  ["CK17", "CK16", "CK15", "CK14"]
];

export const coconutKongEnemyEntryNodeIds = ["CK43", "CK44", "CK45"];


export const babyKongPath = [
  { id: "CK1", x: 140, y: 324 },
  { id: "CK1A", x: 200, y: 270 },
  { id: "CK2", x: 295, y: 240 },
  { id: "CK3", x: 430, y: 220 },
  { id: "CK4", x: 525, y: 268 },
  { id: "CK5", x: 599, y: 339 },
  { id: "CK6", x: 675, y: 351 },
  { id: "CK7", x: 774, y: 424 },
  { id: "CK8", x: 880, y: 477 }
];

export const coconutKongPortals = {
  cave: {
    CK43: "CK44",
    CK44: "CK45",
    CK45: "CK43"
  },
  wrap: {
    CK10: "CK48",
    CK48: "CK10",
    CK47: "CK46",
    CK46: "CK47"
  }
};

export const coconutKongSecretRewards = {
  CK3: {
    type: "bananaBunch",
    x: 131,
    y: 1260,
    min: 5,
    max: 10
  },
  CK42: {
    type: "bananaBunch",
    x: 782,
    y: 538,
    min: 5,
    max: 10
  }
};

export const coconutKongSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "CK50",
  entryNodeId: "CK50",
  destinationNodeId: "CK50",
  unlockCondition: "bossHeartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "secretRoom_ck",
  endingType: "butterfly"
};
