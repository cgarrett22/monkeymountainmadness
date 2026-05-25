// FILE: js/scene-data-ichi-cafe.js
// ===== Generated scene support config - review/tune these guesses =====

export const ICHI_CAFE_BANANA_NODE_IDS = [
  "IC1",
  "IC6",
  "IC15",
  "IC16",
  "IC19",
  "IC21",
  "IC22"
];

export const ichiCafeConfig = {
  startNode: "IC1",
  goalNode: "IC25"
};

export const ichiCafePortals = {
  cave: {
    IC13: "IC24",
    IC24: "IC13"
  },
  wrap: {
  }
};

export const ichiCafeEnemyEntryNodeIds = [];

export const ichiCafeSecretRewards = {
  IC5: {
    type: "bananaBunch",
    x: 1017,
    y: 529,
    min: 20,
    max: 40,
    respawnSeconds: 6
  },
  IC28: {
    type: "bananaBunch",
    x: 384,
    y: 1365,
    min: 20,
    max: 40,
    respawnSeconds: 6
  }
};

export const ichiCafeSecretRoom = {
  visibleBeforeUnlock: true,
  lockedNodeId: "IC25",
  entryNodeId: "IC25",
  destinationNodeId: "IC25",
  unlockCondition: "heartsComplete",
  pulseAfterUnlock: true,
  completionType: "sceneEnd",
  cutsceneBackgroundKey: "secretRoom_ic",
  endingType: "sceneEnd"
};

export const ichiCafeCardMeta = {
  title: "Ichi Cafe",
  sceneType: "utilityBonus",
  backgroundKey: "ichiCafeBackground",
  overlayColor: "#2d52a5",
  fontColor: "#ffffff",
  fixedIconKey: "cardSafePlaceIcon",
  instructions: [
    { text: "GRAB BONUS BANANAS", icon: "banana" },
    { text: "BUMP THE KEEPERS", icon: "ticket" },
    { text: "FIND YOUR SAFE PLACE", icon: "safeBlock" }
  ]
};



// ===== assets.js patch/checklist for Ichi Cafe =====
// [ ] spriteStore.ichiCafeBackground -> assets/ichi-cafe.webp
// [ ] spriteStore.cardSafePlaceIcon -> assets/card-safe-place-icon.webp
// [ ] spriteStore.secretRoom_ic -> sprites/secret-room-ic.webp
// [ ] spriteStore.utilityKeeperBananaCrateWalk -> sprites/utility-keeper-banana-crate-walk.webp
// [ ] spriteStore.utilityKeeperHeartCrateWalk -> sprites/utility-keeper-heart-crate-walk.webp
// [ ] spriteStore.utilityKeeperFaintHearts -> sprites/utility-keeper-faint-hearts.webp

// Optional helper. Add once, then use for new assets if desired:
// function loadImageWithWarning(spriteStore, key, src) {
//   const img = new Image();
//   img.onload = () => console.log(`[ASSET OK] ${key}: ${src}`);
//   img.onerror = () => console.warn(`[ASSET MISSING] ${key}: ${src}`);
//   img.src = src;
//   spriteStore[key] = img;
//   return img;
// }

// Add inside loadSprites():
// loadImageWithWarning(spriteStore, "ichiCafeBackground", "assets/ichi-cafe.webp");
// loadImageWithWarning(spriteStore, "cardSafePlaceIcon", "assets/card-safe-place-icon.webp");
// loadImageWithWarning(spriteStore, "secretRoom_ic", "sprites/secret-room-ic.webp");
// loadImageWithWarning(spriteStore, "utilityKeeperBananaCrateWalk", "sprites/utility-keeper-banana-crate-walk.webp");
// loadImageWithWarning(spriteStore, "utilityKeeperHeartCrateWalk", "sprites/utility-keeper-heart-crate-walk.webp");
// loadImageWithWarning(spriteStore, "utilityKeeperFaintHearts", "sprites/utility-keeper-faint-hearts.webp");


// // Add to dynamic card registry, once that exists:
// ichiCafe: ichiCafeCardMeta,

// // ===== Optional browser asset test for Ichi Cafe =====
// Promise.all(["assets/ichi-cafe.webp", "assets/card-safe-place-icon.webp", "sprites/secret-room-ic.webp", "sprites/utility-keeper-banana-crate-walk.webp", "sprites/utility-keeper-heart-crate-walk.webp", "sprites/utility-keeper-faint-hearts.webp"].map(src => new Promise(resolve => {
//   const img = new Image();
//   img.onload = () => resolve({ src, ok: true });
//   img.onerror = () => resolve({ src, ok: false });
//   img.src = src + "?v=" + Date.now();
// }))).then(results => console.table(results));