// config.js

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 1536;

export const DEBUG = false;
export let NODE_DEBUG = true;

export const SWIPE_THRESHOLD = 24;

export const HAT_TRICK_WINDOW = 1.25; // seconds
export const HAT_TRICK_COUNT = 3;
export const HAT_TRICK_BONUS = 10; // bananas or points

export const HOME_NODE = "A";
export const BANANA_NODE_IDS = ["D", "E", "F", "G", "J", "K", "M", "L", "N", "P"];

export const MUTE_BUTTON = {
  x: 0,
  y: 0,
  w: 54,
  h: 36
};

export function setNodeDebug(value) {
  NODE_DEBUG = !!value;
}