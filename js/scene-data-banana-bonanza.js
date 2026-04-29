// scene-data-banana-bonanza.js
export const bananaBonanzaPortals = {
  cave: {
    BB31: "BB30",
    BB30: "BB28",
    BB28: "BB31"
  },
  wrap: {
    BB14: "BB19",
    BB19: "BB14",
    BB22: "BB25",
    BB25: "BB22"
  }
};

export const bananaBonanzaEnemyEntryNodeIds = ["BB31", "BB30", "BB28"];

export const bananaBonanzaSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "BB36",
  entryNodeId: "BB35",
  destinationNodeId: "BB26",
  unlockCondition: "heartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "secretRoom_bb"
};