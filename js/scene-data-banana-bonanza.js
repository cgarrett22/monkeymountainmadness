// scene-data-banana-bonanza.js
export const bananaBonanzaPortals = {
  cave: {
    N31: "N30",
    N30: "N28",
    N28: "N31"
  },
  wrap: {
    N14: "N19",
    N19: "N14",
    N22: "N25",
    N25: "N22"
  }
};

export const bananaBonanzaSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "N36",
  entryNodeId: "N35",
  destinationNodeId: "N26",
  unlockCondition: "heartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "mainSecretRoom"
};