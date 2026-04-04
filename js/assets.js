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

  spriteStore.zookeeper1 = new Image();
  spriteStore.zookeeper1.src = "sprites/zookeeper-1.png";

  spriteStore.zookeeper2 = new Image();
  spriteStore.zookeeper2.src = "sprites/zookeeper-2.png";

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

  spriteStore.gameOverCard = new Image();
  spriteStore.gameOverCard.src = "assets/game-over-card.png";

  spriteStore.youWinCard = new Image();
  spriteStore.youWinCard.src = "assets/you-win-card.png";

  spriteStore.gameStartCard = new Image();
  spriteStore.gameStartCard.src = "assets/game-start-card.png";

  spriteStore.lilJabMotherRun = new Image();
  spriteStore.lilJabMotherRun.src = "sprites/mother-carried-sprite.png";  

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