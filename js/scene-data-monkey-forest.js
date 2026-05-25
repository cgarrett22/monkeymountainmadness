export const MONKEY_FOREST_BANANA_NODE_IDS = [
  "MF3",
  "MF5",
  "MF8",
  "MF9",
  "MF11",
  "MF12",
  "MF15",
  "MF18",
  "MF20",
  "MF21",
  "MF23",
  "MF24",
  "MF42",
  "MF51",
  "MF52",
  "MF53"
];

export const monkeyForestConfig = {
  startNode: "MF1",
  goalNode: "MF33"
};

export const monkeyForestPortals = {
  cave: {
    MF27: "MF7",
    MF7: "MF27"
  },
  wrap: {
    MF39: "MF37",
    MF37: "MF39",
    MF13: "MF38",
    MF38: "MF13",
    MF31: "MF32",
    MF32: "MF31"
  }
};

export const monkeyForestEnemyEntryNodeIds = ["MF27", "MF39", "MF37", "MF38", "MF13", "MF32", "MF7", "MF31"];

export const monkeyForestSecretRewards = {
  MF34: {
    type: "bananaBunch",
    x: 732,
    y: 1182,
    min: 5,
    max: 10
  },
  MF35: {
    type: "bananaBunch",
    x: 81,
    y: 1035,
    min: 5,
    max: 10
  },
  MF36: {
    type: "bananaBunch",
    x: 989,
    y: 1724,
    min: 5,
    max: 10
  }
};

export const monkeyForestDeliveryRoute = [
  "MF48",
  "MF10",
  "MF50",
  "MF11",
  "MF44",
  "MF1",
  "MF52",
  "MF2",
  "MF3",
  "MF4",
  "MF53",
  "MF49"
];

export const monkeyForestSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "MF33",
  entryNodeId: "MF33",
  destinationNodeId: "MF33",
  unlockCondition: "heartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "secretRoom_mf",
  endingType: "sceneEnd"
};

export const monkeyForestCardMeta = {
  title: "MONKEY FOREST",
  backgroundKey: "monkeyForestBackground",
  zoneColor: "#A58BFF",
  textColor: "#ffffff",

  objectives: [
    { text: "COLLECT 3 HEARTS", iconKey: "heart" },
    { text: "CARRY MOM ALONG", iconKey: "mother" },
    { text: "FIND YOUR SAFE PLACE", iconKey: "safePlace" }
  ],

  introduction: {
  title: "Introducing Delivery Dude",
  text: "Meet the banana delivery man. Bump into him and he may drop a crate of bonus bananas!",
  imageKey: "deliveryDude",
  sheet: { cols: 4, rows: 3, frame: 1 },
  maxW: 430,
  maxH: 430
},
  fallbackImageKey: "cardSafePlaceIcon"
};
