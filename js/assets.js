// assets.js

export function createBackgroundImage() {
  const backgroundImage = new Image();
  backgroundImage.src = "assets/monkeymountain.webp";
  return backgroundImage;
}

export function loadSprites() {
  const spriteStore = {};

  // game start 
  // Start/title screen layered assets
  spriteStore.titleBackground = new Image();
  spriteStore.titleBackground.src = "assets/title-background.webp";

  spriteStore.titleBack = new Image();
  spriteStore.titleBack.src = "assets/title-back.svg";

  spriteStore.titlePunch = new Image();
  spriteStore.titlePunch.src = "assets/title-punch.webp";

  spriteStore.titleFront = new Image();
  spriteStore.titleFront.src = "assets/title-front.svg";

  // Keep old single-card fallback for now
  spriteStore.gameStartCard = new Image();
  spriteStore.gameStartCard.src = "assets/game-start-card.webp";

  // game sprites
  spriteStore.lilJabRun = new Image();
  spriteStore.lilJabRun.src = "sprites/jab-sprite.webp";

  spriteStore.troopRun = new Image();
  spriteStore.troopRun.src = "sprites/troop-sprite.webp";

  spriteStore.zookeeper1_bb = new Image();
  spriteStore.zookeeper1_bb.src = "sprites/zookeeper1-bb.webp";

  spriteStore.zookeeper1_ck = new Image();
  spriteStore.zookeeper1_ck.src = "sprites/zookeeper1-ck.webp";

  spriteStore.zookeeper1_ch = new Image();
  spriteStore.zookeeper1_ch.src = "sprites/zookeeper1-ch.webp";

  spriteStore.zookeeper2_bb_gifts = new Image();
  spriteStore.zookeeper2_bb_gifts.src = "sprites/zookeeper2-bb-gifts.webp";

  spriteStore.zookeeper2_bb_hearts = new Image();
  spriteStore.zookeeper2_bb_hearts.src = "sprites/zookeeper2-bb-hearts.webp";

  spriteStore.zookeeper2_ck_gifts = new Image();
  spriteStore.zookeeper2_ck_gifts.src = "sprites/zookeeper2-ck-gifts.webp";

  spriteStore.zookeeper2_ck_hearts = new Image();
  spriteStore.zookeeper2_ck_hearts.src = "sprites/zookeeper2-ck-hearts.webp";

  spriteStore.zookeeper2_ch_gifts = new Image();
  spriteStore.zookeeper2_ch_gifts.src = "sprites/zookeeper2-ch-gifts.webp";

  spriteStore.zookeeper2_ch_hearts = new Image();
  spriteStore.zookeeper2_ch_hearts.src = "sprites/zookeeper2-ch-hearts.webp";

  spriteStore.zookeeper2_bb_idle = new Image();
  spriteStore.zookeeper2_bb_idle.src = "sprites/zookeeper2-bb-idle.webp";

  spriteStore.zookeeper2_ck_idle = new Image();
  spriteStore.zookeeper2_ck_idle.src = "sprites/zookeeper2-ck-idle.webp";

  spriteStore.zookeeper2_ch_idle = new Image();
  spriteStore.zookeeper2_ch_idle.src = "sprites/zookeeper2-ch-idle.webp";

  spriteStore.utilityZookeeperBananaCrateWalk = new Image();
  spriteStore.utilityZookeeperBananaCrateWalk.src = "sprites/utility-zookeeper-banana-walk.webp";

  spriteStore.utilityZookeeperHeartCrateWalk = new Image();
  spriteStore.utilityZookeeperHeartCrateWalk.src = "sprites/utility-zookeeper-heart-walk.webp";

  spriteStore.utilityZookeeperBananaFaint = new Image();
  spriteStore.utilityZookeeperBananaFaint.src = "sprites/utility-zookeeper-banana-faint.webp";

  spriteStore.utilityZookeeperHeartFaint = new Image();
  spriteStore.utilityZookeeperHeartFaint.src = "sprites/utility-zookeeper-heart-faint.webp";

  spriteStore.levelUpArt = new Image();
  spriteStore.levelUpArt.src = "assets/levelup-monkeys.webp";

  spriteStore.mother = new Image();
  spriteStore.mother.src = "assets/mother-plush.webp";

  spriteStore.ckBackground = new Image();
  spriteStore.ckBackground.src = "assets/boss-mountain.webp";  

  spriteStore.ckBackgroundUnderlay = new Image();
  spriteStore.ckBackgroundUnderlay.src = "assets/ck-coconuts-underlay.webp";

  spriteStore.bossKong = new Image();
  spriteStore.bossKong.src = "sprites/boss-kong.webp";

  spriteStore.babyKongWalk = new Image();
  spriteStore.babyKongWalk.src = "sprites/baby-kong-walk.webp";

  spriteStore.babyKongDrop = new Image();
  spriteStore.babyKongDrop.src = "sprites/baby-kong-drop.webp";
  
  spriteStore.secretRewardPJ = new Image();
  spriteStore.secretRewardPJ.src = "sprites/secret-reward-pj.webp";

  spriteStore.secretRewardIC = new Image();
  spriteStore.secretRewardIC.src = "sprites/secret-reward-pj.webp";


  // spriteStore.bananaBonanzaCard = new Image();
  // spriteStore.bananaBonanzaCard.src = "assets/banana-bonanza-card.webp";

  // spriteStore.bananaBonanzaCardMother = new Image();
  // spriteStore.bananaBonanzaCardMother.src = "assets/banana-bonanza-card-mother.webp";

  // spriteStore.coconutKongCard = new Image();
  // spriteStore.coconutKongCard.src = "assets/coconut-kong-card.webp";

  // spriteStore.chillHillCard = new Image();
  // spriteStore.chillHillCard.src = "assets/chill-hill-card.webp";

  spriteStore.chillHillBackground = new Image();
  spriteStore.chillHillBackground.src = "assets/chill-hill.webp";

  spriteStore.monkeyForestBackground = new Image();
  spriteStore.monkeyForestBackground.src = "assets/monkey-forest.webp";

  spriteStore.sceneCompleteCard = new Image();
  spriteStore.sceneCompleteCard.src = "assets/scene-complete-card.webp";

  spriteStore.gameOverCard = new Image();
  spriteStore.gameOverCard.src = "assets/game-over-card.webp";

  spriteStore.youWinCard = new Image();
  spriteStore.youWinCard.src = "assets/you-win-card.webp";

  spriteStore.gameStartCard = new Image();
  spriteStore.gameStartCard.src = "assets/game-start-card.webp";

  spriteStore.lilJabMotherRun = new Image();
  spriteStore.lilJabMotherRun.src = "sprites/mother-carried-sprite.webp";  

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

  spriteStore.pjDance = new Image();
  spriteStore.pjDance.src = "sprites/pj-dance-sprite.webp";  

  spriteStore.kong = new Image();
  spriteStore.kong.src = "sprites/kong.webp";  

  spriteStore.kongSquat = new Image();
  spriteStore.kongSquat.src = "sprites/kong-squat.webp";  

  spriteStore.kongRunning = new Image();
  spriteStore.kongRunning.src = "sprites/kong-run-sprite.webp";  

  spriteStore.kongJumping = new Image();
  spriteStore.kongJumping.src = "sprites/kong-jump-sprite.webp";  

  spriteStore.bananaBalloon = new Image();
  spriteStore.bananaBalloon.src = "sprites/banana-balloon.webp";  

  spriteStore.girlKongBalloon = new Image();
  spriteStore.girlKongBalloon.src = "sprites/girl-kong-balloon.webp";  

  spriteStore.godzillaBalloon = new Image();
  spriteStore.godzillaBalloon.src = "sprites/godzilla-balloon.webp";  

  spriteStore.bananaBalloonSprite = new Image();
  spriteStore.bananaBalloonSprite.src = "sprites/banana-balloon-sprite.webp";  

  spriteStore.girlKongBalloonSprite = new Image();
  spriteStore.girlKongBalloonSprite.src = "sprites/girl-kong-balloon-sprite.webp";  

  spriteStore.godzillaBalloonSprite = new Image();
  spriteStore.godzillaBalloonSprite.src = "sprites/godzilla-balloon-sprite.webp";  

  spriteStore.secretRoom_bananas = new Image();
  spriteStore.secretRoom_bananas.src = "sprites/secret-room-bananas.webp";  

  spriteStore.secretRoom_bb = new Image();
  spriteStore.secretRoom_bb.src = "sprites/secret-room-bb.webp";  

  spriteStore.secretRoom_ck = new Image();
  spriteStore.secretRoom_ck.src = "sprites/secret-room-ck.webp";  

  spriteStore.explosion = new Image();
  spriteStore.explosion.src = "sprites/explosion.webp";  

  spriteStore.secretRoom_ch = new Image();
  spriteStore.secretRoom_ch.src = "sprites/secret-room-ch.webp";  

  spriteStore.secretRoom_ch_jab = new Image();
  spriteStore.secretRoom_ch_jab.src = "sprites/jab-secret-room-ch.webp";  

  spriteStore.ticketTimeBackground = new Image();
  spriteStore.ticketTimeBackground.src = "assets/ticket-time.webp";

  spriteStore.ticketTimeCard = new Image();
  spriteStore.ticketTimeCard.src = "assets/ticket-time-card.webp";

  spriteStore.ichiCafeBackground = new Image();
  spriteStore.ichiCafeBackground.src = "assets/ichi-cafe.webp";

  // scene cards
  spriteStore.cardSafePlaceIcon = new Image();
  spriteStore.cardSafePlaceIcon.src = "assets/card-safe-place.webp";


  // === intro sprites

  // spriteStore.introBackground = new Image();
  // spriteStore.introBackground.src = "sprites/intro/introBackground.webp";  

  spriteStore.introBackgroundClose = new Image();
  spriteStore.introBackgroundClose.src = "sprites/intro/introAltBG.webp";  

  spriteStore.introJabBlinking = new Image();
  spriteStore.introJabBlinking.src = "sprites/intro/introJabBlinking.webp";  

  spriteStore.introJabWeeping = new Image();
  spriteStore.introJabWeeping.src = "sprites/intro/introJabWeeping.webp";  

  spriteStore.introBrokenHeart = new Image();
  spriteStore.introBrokenHeart.src = "sprites/intro/introBrokenHeart.webp";

  spriteStore.introHeart = new Image();
  spriteStore.introHeart.src = "sprites/intro/intro-heart.webp";

  spriteStore.introJabDirectional = new Image();
  spriteStore.introJabDirectional.src = "sprites/intro/introJabDirectional.webp";  

  spriteStore.introZookeepers = new Image();
  spriteStore.introZookeepers.src = "sprites/intro/introZookeepers.webp";  

  spriteStore.introThoughtBubble = new Image();
  spriteStore.introThoughtBubble.src = "sprites/intro/introThoughtBubble.webp";  

  spriteStore.introMother = new Image();
  spriteStore.introMother.src = "sprites/intro/introMother.webp"; 
  
  // scene card watermarks
  spriteStore.bananaBonanzaIcon = new Image();
  spriteStore.bananaBonanzaIcon.src = "assets/bananaBonanzaIcon.svg";  

  spriteStore.chillHillIcon = new Image();
  spriteStore.chillHillIcon.src = "assets/chillHillIcon.svg";  

  spriteStore.coconutKongIcon = new Image();
  spriteStore.coconutKongIcon.src = "assets/coconutKongIcon.svg";  

  spriteStore.monkeyForestIcon = new Image();
  spriteStore.monkeyForestIcon.src = "assets/monkeyForestIcon.svg";  

  spriteStore.ticketTimeIcon = new Image();
  spriteStore.ticketTimeIcon.src = "assets/ticketTimeIcon.svg";  

  spriteStore.ichiCafeIcon = new Image();
  spriteStore.ichiCafeIcon.src = "assets/ichiCafeIcon.svg";  

  // card instruction icons
  spriteStore.cardSafePlaceIcon = new Image();
  spriteStore.cardSafePlaceIcon.src = "assets/card-safe-place-icon.webp";

  spriteStore.cardMotherIcon = new Image();
  spriteStore.cardMotherIcon.src = "assets/card-mother-icon.webp";

  spriteStore.cardHeartIcon = new Image();
  spriteStore.cardHeartIcon.src = "assets/card-heart-icon.webp";

  // === zone map ===
spriteStore.zoneMapBase = new Image();
spriteStore.zoneMapBase.src = "assets/zones/zone-map-base.webp";

spriteStore.zoneOverlayBB = new Image();
spriteStore.zoneOverlayBB.src = "assets/zones/zone-overlay-bb.webp";

spriteStore.zoneOverlayCH = new Image();
spriteStore.zoneOverlayCH.src = "assets/zones/zone-overlay-ch.webp";

spriteStore.zoneOverlayCK = new Image();
spriteStore.zoneOverlayCK.src = "assets/zones/zone-overlay-ck.webp";

spriteStore.zoneOverlayMF = new Image();
spriteStore.zoneOverlayMF.src = "assets/zones/zone-overlay-mf.webp";

spriteStore.zoneOverlayPC = new Image();
spriteStore.zoneOverlayPC.src = "assets/zones/zone-overlay-pc.webp";

spriteStore.zoneOverlayMB = new Image();
spriteStore.zoneOverlayMB.src = "assets/zones/zone-overlay-mb.webp";

spriteStore.zoneOverlaySG = new Image();
spriteStore.zoneOverlaySG.src = "assets/zones/zone-overlay-sf.webp";

spriteStore.zoneOverlayJF = new Image();
spriteStore.zoneOverlayJF.src = "assets/zones/zone-overlay-jf.webp";

spriteStore.zoneOverlayCC = new Image();
spriteStore.zoneOverlayCC.src = "assets/zones/zone-overlay-cc.webp";

spriteStore.zoneOverlaySN = new Image();
spriteStore.zoneOverlaySN.src = "assets/zones/zone-overlay-sn.webp";

spriteStore.zoneOverlayIC = new Image();
spriteStore.zoneOverlayIC.src = "assets/zones/zone-overlay-ic.webp";

spriteStore.zoneOverlayGS = new Image();
spriteStore.zoneOverlayGS.src = "assets/zones/zone-overlay-gs.webp";

spriteStore.zoneOverlayTT = new Image();
spriteStore.zoneOverlayTT.src = "assets/zones/zone-overlay-tt.webp";

  return spriteStore;
}
  
function loadImageWithWarning(spriteStore, key, src) {
  const img = new Image();
  img.onload = () => console.log(`[ASSET OK] ${key}: ${src}`);
  img.onerror = () => console.warn(`[ASSET MISSING] ${key}: ${src}`);
  img.src = src;
  spriteStore[key] = img;
  return img;
}

export function loadSounds(state) {
  const sounds = {};

  // Short SFX via Howler
  sounds.hiMommy = new Howl({
    src: ["assets/introHiMommy.m4a"],
    volume: 1.0,
    preload: true
  });

  sounds.introLoop = new Howl({
    src: ["assets/introLoop.m4a"],
    volume: 0.50,
    rate: 1.12,
    preload: true
  });

  // zones
  sounds.conga = new Howl({
    src: ["assets/zone-conga.m4a"],
    volume: 0.80,
    rate: 1,
    loop: true,
    preload: true
  });

  sounds.gong = new Howl({
    src: ["assets/gong.m4a"],
    volume: 0.65,
    rate: 1.5,
    preload: true
  });

// end zones

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
    rate: 1,
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

  sounds.love = new Howl({
    src: ["assets/love.m4a"],
    volume: 0.85,
    preload: true
  });

  sounds.grunt = new Howl({
    src: ["assets/grunt.m4a"],
    volume: 0.75,
    preload: true
  });

  sounds.thud = new Howl({
    src: ["assets/thud.m4a"],
    volume: 1,
    preload: true
  });

  sounds.gameOver = new Howl({
    src: ["assets/game-over.m4a"],
    volume: 0.75,
    preload: true
  });

  sounds.explosion = new Howl({
    src: ["assets/explosion.m4a"],
    volume: 0.75,
    preload: true
  });

    // Music via Howler for better mobile/iOS behavior
  sounds.music = new Howl({
    src: ["assets/retro-arcade.mp3"],
    volume: 0.75,
    loop: true,
    preload: true,
    html5: true
  });

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

export function playSceneMusic({ sounds }) {
  stopAllMusic(sounds);

  const track = sounds.music;
  if (!track) {
    console.log("[AUDIO] scene music missing: sounds.music");
    return null;
  }

  try {
    if (typeof track.seek === "function") {
      track.seek(0);
    }

    const id = track.play();

    if (id == null) {
      console.log("[AUDIO] scene music play returned no id");
    }

    return id;
  } catch (err) {
    console.log("[AUDIO] scene music play threw", err);
    return null;
  }
}

export function stopAllMusic(sounds) {
  const tracks = [sounds.music];

  for (const track of tracks) {
    if (!track) continue;

    try {
      if (typeof track.stop === "function") {
        track.stop();
      }

      if (typeof track.seek === "function") {
        track.seek(0);
      }
    } catch (err) {
      console.log("[AUDIO] stopAllMusic failed", err);
    }
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
