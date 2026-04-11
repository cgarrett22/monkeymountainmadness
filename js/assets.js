// assets.js

export function createBackgroundImage() {
  const backgroundImage = new Image();
  backgroundImage.src = "assets/monkeymountain.png";
  return backgroundImage;
}

export function loadSprites() {
  const spriteStore = {};

  spriteStore.lilJabRun = new Image();
  spriteStore.lilJabRun.src = "sprites/jab-sprite.png";

  spriteStore.troopRun = new Image();
  spriteStore.troopRun.src = "sprites/troop-sprite.png";

  spriteStore.zookeeper1_bb = new Image();
  spriteStore.zookeeper1_bb.src = "sprites/zookeeper1-bb.png";

  spriteStore.zookeeper1_ck = new Image();
  spriteStore.zookeeper1_ck.src = "sprites/zookeeper1-ck.png";

  spriteStore.zookeeper1_ch = new Image();
  spriteStore.zookeeper1_ch.src = "sprites/zookeeper1-ch.png";

  spriteStore.zookeeper2_bb_gifts = new Image();
  spriteStore.zookeeper2_bb_gifts.src = "sprites/zookeeper2-bb-gifts.png";

  spriteStore.zookeeper2_bb_hearts = new Image();
  spriteStore.zookeeper2_bb_hearts.src = "sprites/zookeeper2-bb-hearts.png";

  spriteStore.zookeeper2_ck_gifts = new Image();
  spriteStore.zookeeper2_ck_gifts.src = "sprites/zookeeper2-ck-gifts.png";

  spriteStore.zookeeper2_ck_hearts = new Image();
  spriteStore.zookeeper2_ck_hearts.src = "sprites/zookeeper2-ck-hearts.png";

  spriteStore.zookeeper2_ch_gifts = new Image();
  spriteStore.zookeeper2_ch_gifts.src = "sprites/zookeeper2-ch-gifts.png";

  spriteStore.zookeeper2_ch_hearts = new Image();
  spriteStore.zookeeper2_ch_hearts.src = "sprites/zookeeper2-ch-hearts.png";

  // spriteStore.zookeeperHearts = new Image();
  // spriteStore.zookeeperHearts.src = "sprites/zookeeper-hearts.png";

  // spriteStore.zookeeperGifts = new Image();
  // spriteStore.zookeeperGifts.src = "sprites/zookeeper-gifts.png";

  spriteStore.levelUpArt = new Image();
  spriteStore.levelUpArt.src = "assets/levelup-monkeys.png";

  spriteStore.mother = new Image();
  spriteStore.mother.src = "assets/mother-plush.png";

  spriteStore.bossBackground = new Image();
  spriteStore.bossBackground.src = "assets/boss-mountain.png";

  spriteStore.bananaBonanzaCard = new Image();
  spriteStore.bananaBonanzaCard.src = "assets/banana-bonanza-card.png";

  spriteStore.coconutKongCard = new Image();
  spriteStore.coconutKongCard.src = "assets/coconut-kong-card.png";

  spriteStore.chillHillCard = new Image();
  spriteStore.chillHillCard.src = "assets/chill-hill-card.png";

  spriteStore.chillHillBackground = new Image();
  spriteStore.chillHillBackground.src = "assets/chill-hill.png";

  spriteStore.sceneCompleteCard = new Image();
  spriteStore.sceneCompleteCard.src = "assets/scene-complete-card.png";

  spriteStore.gameOverCard = new Image();
  spriteStore.gameOverCard.src = "assets/game-over-card.png";

  spriteStore.youWinCard = new Image();
  spriteStore.youWinCard.src = "assets/you-win-card.png";

  spriteStore.gameStartCard = new Image();
  spriteStore.gameStartCard.src = "assets/game-start-card.png";

  spriteStore.lilJabMotherRun = new Image();
  spriteStore.lilJabMotherRun.src = "sprites/mother-carried-sprite.png";  

  spriteStore.motherSit = new Image();
  spriteStore.motherSit.src = "sprites/mother-sit.png";

  spriteStore.motherHug = new Image();
  spriteStore.motherHug.src = "sprites/mother-hug.png";

  spriteStore.nanaSnatchers = new Image();
  spriteStore.nanaSnatchers.src = "sprites/nana-snatchers.png";  

  spriteStore.nanaSnatchersSnatched = new Image();
  spriteStore.nanaSnatchersSnatched.src = "sprites/nana-snatchers-snatched.png";  

  return spriteStore;
}

export function loadSounds(state) {
  const sounds = {};

  sounds.pickup = new Audio("assets/pickup.mp3");
  sounds.pickup.volume = 0.75;

  sounds.catch = new Audio("assets/catch.mp3");
  sounds.catch.volume = 0.75;

  sounds.score = new Audio("assets/score.mp3");
  sounds.score.volume = 0.75;

  sounds.step = new Audio("assets/step.mp3");

  sounds.panic = new Audio("assets/panic.mp3");
  sounds.panic.volume = 0.75;

  sounds.music = new Audio("assets/jungle_jumpin.ogg");
  sounds.music.loop = true;

  sounds.bossMusic = new Audio("assets/boss-loop.ogg");
  sounds.bossMusic.loop = true;

  applyMuteState(sounds, state);

  return sounds;
}

export function applyMuteState(sounds, state) {
  for (const key in sounds) {
    if (sounds[key]) {
      sounds[key].muted = state.isMuted;
    }
  }
}

export function stopAllMusic(sounds) {
  if (sounds.music) {
    sounds.music.pause();
    sounds.music.currentTime = 0;
  }

  if (sounds.bossMusic) {
    sounds.bossMusic.pause();
    sounds.bossMusic.currentTime = 0;
  }
}

export function playSceneMusic({ sounds, isBossScene }) {
  stopAllMusic(sounds);

  const track = isBossScene ? sounds.bossMusic : sounds.music;
  if (track) {
    track.play().catch(() => {});
  }
}

export function playMusicOnce(inputState, sounds) {
  if (inputState.musicStarted || !sounds.music) return;

  inputState.musicStarted = true;
  sounds.music.currentTime = 0;
  sounds.music.play().catch(() => {});
}