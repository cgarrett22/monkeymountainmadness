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

  spriteStore.clouds = new Image();
  spriteStore.clouds.src = "sprites/clouds.webp";  
  
  spriteStore.butterfly = new Image();
  spriteStore.butterfly.src = "sprites/butterfly-sprite.webp";  

  spriteStore.palPJ = new Image();
  spriteStore.palPJ.src = "sprites/pj-sprite.webp";  

  spriteStore.pjSwat = new Image();
  spriteStore.pjSwat.src = "sprites/pj-swat-sprite.webp";  

  return spriteStore;
}

export function loadSounds(state) {
  const sounds = {};

  // Short SFX via Howler
  sounds.pickup = new Howl({
    src: ["assets/squeak.m4a"],
    volume: 0.55,
    rate: 0.5,
    preload: true
  });

  sounds.score = new Howl({
    src: ["assets/score.m4a"],
    volume: 0.20,
    rate: 2,
    preload: true
  });

  sounds.ahh = new Howl({
    src: ["assets/ahh.m4a"],
    volume: 0.2,
    rate: 3.4,
    preload: true
  });

  sounds.victory = new Howl({
    src: ["assets/victory.m4a"],
    volume: 0.75,
    preload: true
  });

  sounds.catch = new Howl({
    src: ["assets/catch.m4a"],
    volume: 0.75,
    preload: true
  });

  sounds.step = new Howl({
    src: ["assets/step.m4a"],
    volume: 0.25,
    preload: true
  });

  sounds.panic = new Howl({
    src: ["assets/panic.m4a"],
    volume: 0.75,
    preload: true
  });

  sounds.eOh = new Howl({
    src: ["assets/e-oh.m4a"],
    volume: 0.75,
    preload: true
  });

  sounds.grunt = new Howl({
    src: ["assets/grunt.m4a"],
    volume: 0.75,
    preload: true
  });

  sounds.gameOver = new Howl({
    src: ["assets/game-over.m4a"],
    volume: 0.75,
    preload: true
  });

  // Keep music as HTMLAudio for now
  sounds.music = new Audio("assets/jungle_jumpin.m4a");
  sounds.music.loop = true;
  sounds.music.volume = 0.75;

  sounds.bossMusic = new Audio("assets/boss-loop.mp3");
  sounds.bossMusic.loop = true;

  applyMuteState(sounds, state);
  return sounds;
}

export function applyMuteState(sounds, state) {
  for (const key in sounds) {
    const sound = sounds[key];
    if (!sound) continue;

    // Howler sound
    if (typeof sound.mute === "function") {
      sound.mute(state.isMuted);
      continue;
    }

    // HTMLAudio element
    if ("muted" in sound) {
      sound.muted = state.isMuted;
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

export function playSfx(sound, volume = null, debugName = "") {
  if (!sound) return;

  try {
    // Howler
    if (typeof sound.play === "function" && typeof sound.volume === "function" && !(sound instanceof HTMLAudioElement)) {
      const id = sound.play();

      if (volume != null) {
        sound.volume(volume, id);
      }

      return id;
    }

    // HTMLAudio fallback
    if (sound instanceof HTMLAudioElement) {
      sound.pause();
      sound.currentTime = 0;

      if (volume != null) {
        sound.volume = volume;
      }

      const p = sound.play();

      if (debugName && p?.catch) {
        p.catch(err => console.log(`${debugName} failed`, err));
      }

      return;
    }
  } catch (err) {
    if (debugName) {
      console.log(`${debugName} play failed`, err);
    }
  }
}
