// assets.js

export function createBackgroundImage() {
  const backgroundImage = new Image();
  backgroundImage.src = "assets/monkeymountain.webp";
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

  spriteStore.zookeeper2_bb_idle = new Image();
  spriteStore.zookeeper2_bb_idle.src = "sprites/zookeeper2-bb-idle.png";

  spriteStore.zookeeper2_ck_idle = new Image();
  spriteStore.zookeeper2_ck_idle.src = "sprites/zookeeper2-ck-idle.png";

  spriteStore.zookeeper2_ch_idle = new Image();
  spriteStore.zookeeper2_ch_idle.src = "sprites/zookeeper2-ch-idle.png";

  spriteStore.levelUpArt = new Image();
  spriteStore.levelUpArt.src = "assets/levelup-monkeys.webp";

  spriteStore.mother = new Image();
  spriteStore.mother.src = "assets/mother-plush.webp";

  spriteStore.bossBackground = new Image();
  spriteStore.bossBackground.src = "assets/boss-mountain.webp";

  spriteStore.bananaBonanzaCard = new Image();
  spriteStore.bananaBonanzaCard.src = "assets/banana-bonanza-card.webp";

  spriteStore.coconutKongCard = new Image();
  spriteStore.coconutKongCard.src = "assets/coconut-kong-card.webp";

  spriteStore.chillHillCard = new Image();
  spriteStore.chillHillCard.src = "assets/chill-hill-card.webp";

  spriteStore.chillHillBackground = new Image();
  spriteStore.chillHillBackground.src = "assets/chill-hill.webp";

  spriteStore.sceneCompleteCard = new Image();
  spriteStore.sceneCompleteCard.src = "assets/scene-complete-card.webp";

  spriteStore.gameOverCard = new Image();
  spriteStore.gameOverCard.src = "assets/game-over-card.webp";

  spriteStore.youWinCard = new Image();
  spriteStore.youWinCard.src = "assets/you-win-card.webp";

  spriteStore.gameStartCard = new Image();
  spriteStore.gameStartCard.src = "assets/game-start-card.webp";

  spriteStore.lilJabMotherRun = new Image();
  spriteStore.lilJabMotherRun.src = "sprites/mother-carried-sprite.png";  

  spriteStore.motherSit = new Image();
  spriteStore.motherSit.src = "sprites/mother-sit.webp";

  spriteStore.motherHug = new Image();
  spriteStore.motherHug.src = "sprites/mother-hug.webp";

  spriteStore.nanaSnatchers = new Image();
  spriteStore.nanaSnatchers.src = "sprites/nana-snatchers.webp";  

  spriteStore.nanaSnatchersSnatched = new Image();
  spriteStore.nanaSnatchersSnatched.src = "sprites/nana-snatchers-snatched.webp";  

  spriteStore.bananaBunch = new Image();
  spriteStore.bananaBunch.src = "sprites/banana-bunch.webp";  

  spriteStore.deliveryCrate = new Image();
  spriteStore.deliveryCrate.src = "sprites/banana-crate.webp";  

  spriteStore.deliveryDude = new Image();
  spriteStore.deliveryDude.src = "sprites/delivery-dude.webp";  

  spriteStore.deliveryDudeFaints = new Image();
  spriteStore.deliveryDudeFaints.src = "sprites/delivery-faint.webp";  

  return spriteStore;
}

export function loadSounds(state) {
  const sounds = {};

  sounds.pickup = new Audio("assets/pickup.mp3");
  sounds.pickup.volume = 0.15;

  sounds.catch = new Audio("assets/catch.mp3");
  sounds.catch.volume = 0.75;

  sounds.score = new Audio("assets/score.mp3");
  sounds.score.volume = 0.20;

  sounds.step = new Audio("assets/step.mp3");
  sounds.step.volume = 0.25;

  sounds.panic = new Audio("assets/panic.mp3");
  sounds.panic.volume = 0.75;

  sounds.ahh = new Audio("assets/ahh.mp3");
  sounds.ahh.volume = 0.15;
  sounds.ahh.playbackRate = 2.4;

  sounds.victory = new Audio("assets/victory.mp3");
  sounds.victory.volume = 0.75;

  sounds.eOh = new Audio("assets/e-oh.mp3");

  sounds.music = new Audio("assets/jungle_jumpin.mp3");
  sounds.music.loop = true;
  sounds.music.volume = 0.75;


  sounds.bossMusic = new Audio("assets/boss-loop.mp3");
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

export function playSfx(sound, volume = null, debugName = "") {
  if (!sound) return;

  try {
    const s = sound.cloneNode();

    s.volume = volume != null ? volume : sound.volume;
    s.playbackRate = sound.playbackRate || 1;
    s.muted = !!sound.muted;
    s.preservesPitch = sound.preservesPitch ?? true;

    const p = s.play();

    if (debugName && p?.catch) {
      p.catch(err => console.log(`${debugName} failed`, err));
    }
  } catch (err) {
    if (debugName) {
      console.log(`${debugName} clone/play failed`, err);
    }
  }
}