// config.js
export const DEBUG_TEST_LEVEL = 1;

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

export const DEBUG = false;
export const DEBUG_LOOP_MAIN_SCENE = false;
export const DEBUG_LOOP_KONG_SCENE = false;
export let NODE_DEBUG = false;

export const SWIPE_THRESHOLD = 16;

export const HAT_TRICK_WINDOW = 3; // seconds
export const HAT_TRICK_COUNT = 3;
export const HAT_TRICK_BONUS = 10; // bananas or points

export const HIGH_FIVE_WINDOW = 5; // seconds
export const HIGH_FIVE_COUNT = 5;
export const HIGH_FIVE_BONUS = 50; // bananas or points

export const HOME_NODE = "BB1";

export const MUTE_BUTTON = {
  x: 0,
  y: 0,
  w: 54,
  h: 36
};

export function setNodeDebug(value) {
  NODE_DEBUG = !!value;
}

export const ZONE_MAP_ZONES = {
  // primates
  bananaBonanza: {
    id: "bananaBonanza",
    label: "Banana Bonanza",
    type: "scene",
    scene: "main",
    overlayKey: "zoneOverlayBB",
    unlocked: true,
    bounds: { x: 217, y: 759, w: 310, h: 252 }
  },

  monkeyForest: {
    id: "monkeyForest",
    label: "Monkey Forest",
    type: "scene",
    scene: "monkeyForest",
    overlayKey: "zoneOverlayMF",
    unlocked: false,
    bounds: { x: 305, y: 473, w: 272, h: 271 }
  },

  chillHill: {
    id: "chillHill",
    label: "Chill Hill Thrill",
    type: "scene",
    scene: "chill",
    overlayKey: "zoneOverlayCH",
    unlocked: false,
    bounds: { x: 436, y: 192, w: 190, h: 300 }
  },

  coconutKong: {
    id: "coconutKong",
    label: "Coconut Kong",
    type: "scene",
    scene: "boss",
    overlayKey: "zoneOverlayCK",
    unlocked: false,
    bounds: { x: 136, y: 995, w: 340, h: 250 }
  },
  
  // top group
  pandaCity: {
    id: "pandaCity",
    label: "Panda City",
    type: "scene",
    scene: "pandaCity",
    overlayKey: "zoneOverlayPC",
    unlocked: false,
    bounds: { x: 660, y: 256, w: 330, h: 230 }
  },
  
  madBirds: {
    id: "madBirds",
    label: "Mad Birds",
    type: "scene",
    scene: "madBirds",
    overlayKey: "zoneOverlayMB",
    unlocked: false,
    bounds: { x: 731, y: 446, w: 258, h: 204 }
  },
  
  somethingFishy: {
    id: "somethingFishy",
    label: "Something Fishy",
    type: "scene",
    scene: "somethingFishy",
    overlayKey: "zoneOverlaySF",
    unlocked: false,
    bounds: { x: 658, y: 686, w: 240, h: 213 }
  },
  
  // right side
  jungleFever: {
    id: "jungleFever",
    label: "Jungle Fever",
    type: "scene",
    scene: "jungleFever",
    overlayKey: "zoneOverlayJF",
    unlocked: false,
    bounds: { x: 756, y: 950, w: 216, h: 190 }
  },
  
  catCountry: {
    id: "catCountry",
    label: "Cat Country",
    type: "scene",
    scene: "catCountry",
    overlayKey: "zoneOverlayCC",
    unlocked: false,
    bounds: { x: 520, y: 1144, w: 225, h: 325 }
  },
  
  savannaNana: {
    id: "savannaNana",
    label: "Savanna 'Nana",
    type: "scene",
    scene: "savannaNana",
    overlayKey: "zoneOverlaySN",
    unlocked: false,
    bounds: { x: 795, y: 1180, w: 240, h: 375 }
  },
  
  // utilities
  giftShop: {
    id: "giftShop",
    label: "Gift Shop",
    type: "shop",
    overlayKey: "zoneOverlayGS",
    unlocked: false,
    bounds: { x: 115, y: 1280, w: 200, h: 240 }
  },

  ticketTime: {
    id: "ticketTime",
    label: "Ticket Time",
    type: "tickets",
    overlayKey: "zoneOverlayTT",
    unlocked: false,
    bounds: { x: 527, y: 1525, w: 250, h: 235 }
  },

  ichiscrachiCafe: {
    id: "ichiscrachiCafe",
    label: "Ichiscrachi Café",
    type: "utility",
    overlayKey: "zoneOverlayIC",
    unlocked: false,
    bounds: { x: 270, y: 1485, w: 250, h: 265 }
  }
};

export const ZONE_MAP_CLICK_ORDER = [
  "coconutKong",
  "chillHill",
  "bananaBonanza",
  "monkeyForest",
  "pandaCity",
  "madBirds",
  "somethingFishy",
  "jungleFever",
  "catCountry",
  "savannaNana",
  "giftShop",
  "ichiscrachiCafe",
  "ticketTime"
];