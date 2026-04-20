// scene-data-boss.js

export const bossConfig = {
  startNode: "START",
  goalNode: "GOAL",
  motherStartNode: "L2D",
  roamingTroopStartNodes: ["R1T", "L4U"],
  coconutThrowerNode: "TOP",
  bananaNodes: ["R1T", "L3D", "L2D", "R2T", "L5D"]
};

export const bossCoconutLanes = [
  ["TOP", "L5D", "M1", "L6D", "L1U", "L1D", "START"],
  ["TOP", "L4U", "L4D", "L3U", "L3D", "M0", "L2U", "L2D"],
  ["TOP", "L4U", "L4D", "L3U", "L3D", "SC2", "SC1", "S1D"],
  ["TOP", "R2T", "R2B", "L2U", "L2D"]
];