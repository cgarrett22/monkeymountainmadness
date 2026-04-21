// config.js
export const DEBUG_TEST_LEVEL = 1;

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

export const DEBUG = false;
export const DEBUG_LOOP_MAIN_SCENE = true;
export let NODE_DEBUG = true;

export const SWIPE_THRESHOLD = 16;

export const HAT_TRICK_WINDOW = 3; // seconds
export const HAT_TRICK_COUNT = 3;
export const HAT_TRICK_BONUS = 10; // bananas or points

export const HIGH_FIVE_WINDOW = 5; // seconds
export const HIGH_FIVE_COUNT = 5;
export const HIGH_FIVE_BONUS = 50; // bananas or points

export const HOME_NODE = "N1";

export const MUTE_BUTTON = {
  x: 0,
  y: 0,
  w: 54,
  h: 36
};

export function setNodeDebug(value) {
  NODE_DEBUG = !!value;
}