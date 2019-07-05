"use strict";

class CreekImage {
  constructor(
    id,
    width,
    height,
    url,
    source_x,
    source_y,
    source_width,
    source_height
  ) {
    this.id = id;
    this.width = width;
    this.height = height;
    this.url = url || `resources/images/${id}.png`;
    this.source_x = source_x || 0;
    this.source_y = source_y || 0;
    this.source_width = source_width || width;
    this.source_height = source_height || height;
  }

  get() {
    return {
      type: "image",
      url: this.url,
      id: this.id,
      source_x: this.source_x,
      source_y: this.source_y,
      source_width: this.source_width,
      source_height: this.source_height,
      width: this.width,
      height: this.height
    };
  }
}

class CreekSound {
  constructor(id, url, muted, volume, looping) {
    url = url || `resources/sounds/${id}.wav`;
    muted = muted || false;
    volume = volume || 0.6;
    looping = looping || false;

    this.id = id;
    this.url = url;
    this.muted = muted;
    this.volume = volume;
    this.looping = looping;
  }

  get() {
    return {
      type: "sound",
      url: this.url,
      id: this.id,
      muted: this.muted,
      volume: this.volume,
      looping: this.looping
    };
  }
}

const Resources = [
  new CreekSound("pickup").get(),
  new CreekSound("pickup_c").get(),
  new CreekSound("pickup_c_sharp").get(),
  new CreekSound("pickup_d").get(),
  new CreekSound("pickup_e_flat").get(),
  new CreekSound("pickup_e").get(),
  new CreekSound("pickup_f").get(),
  new CreekSound("pickup_f_sharp").get(),
  new CreekSound("pickup_g").get(),
  new CreekSound("pickup_g_sharp").get(),
  new CreekSound("pickup_a").get(),
  new CreekSound("pickup_b_flat").get(),
  new CreekSound("pickup_b").get(),
  new CreekSound("pickup_c_2").get(),
  new CreekSound("pickup_c_sharp_2").get(),
  new CreekSound("pickup_d_2").get(),
  new CreekSound("pickup_e_flat_2").get(),
  new CreekSound("pickup_e_2").get(),
  new CreekSound("pickup_f_2").get(),
  new CreekSound("pickup_success_c_2").get(),
  new CreekSound("pickup_success_f_2").get(),
  new CreekSound("level").get(),
  new CreekSound("bwuh").get(),
  new CreekSound("bwuh_2").get(),
  new CreekSound("bwuh_low").get(),
  new CreekSound("slash").get(),
  new CreekSound(
    "cave_hopping",
    "resources/sounds/cave_hopping_longer.mp3",
    false,
    0.6,
    true
  ).get(),
  new CreekImage("player", 32, 32).get(),
  new CreekImage(
    "temple",
    32,
    32,
    "resources/images/tileset.png",
    368,
    192,
    16,
    16
  ).get(),
  new CreekImage(
    "coin",
    32,
    32,
    "resources/images/coin.png",
    0,
    0,
    48,
    48
  ).get(),
  new CreekImage("reticle_black", 32, 32).get(),
  new CreekImage("reticle_red", 32, 32).get(),
  new CreekImage("reticle_green", 32, 32).get(),
  new CreekImage(
    "grass",
    32,
    32,
    "resources/images/tileset.png",
    303,
    48,
    16,
    16
  ).get(),
  new CreekImage(
    "brush",
    32,
    32,
    "resources/images/tileset.png",
    64,
    159,
    16,
    16
  ).get(),
  new CreekImage(
    "dirt",
    32,
    32,
    "resources/images/tileset.png",
    352,
    48,
    16,
    16
  ).get(),
  new CreekImage(
    "mountains",
    32,
    32,
    "resources/images/tileset.png",
    64,
    224,
    16,
    16
  ).get(),
  new CreekImage(
    "pave_stone",
    32,
    32,
    "resources/images/tileset.png",
    208,
    80,
    16,
    16
  ).get(),
  new CreekImage(
    "purple_walk_1",
    32,
    32,
    "resources/images/tileset.png",
    192,
    0,
    16,
    16
  ).get(),
  new CreekImage(
    "purple_walk_2",
    32,
    32,
    "resources/images/tileset.png",
    192,
    16,
    16,
    16
  ).get(),
  new CreekImage(
    "purple_walk_3",
    32,
    32,
    "resources/images/tileset.png",
    208,
    0,
    16,
    16
  ).get(),
  new CreekImage(
    "purple_walk_4",
    32,
    32,
    "resources/images/tileset.png",
    208,
    16,
    16,
    16
  ).get(),
  new CreekImage(
    "sand",
    32,
    32,
    "resources/images/tileset.png",
    160,
    32,
    16,
    16
  ).get(),
  new CreekImage(
    "snow",
    32,
    32,
    "resources/images/tileset.png",
    304,
    96,
    16,
    16
  ).get(),
  new CreekImage(
    "tree",
    32,
    32,
    "resources/images/tileset.png",
    304,
    128,
    16,
    16
  ).get(),
  new CreekImage(
    "trees",
    32,
    32,
    "resources/images/tileset.png",
    16,
    224,
    16,
    16
  ).get(),
  new CreekImage(
    "water",
    32,
    32,
    "resources/images/tileset.png",
    16,
    64,
    16,
    16
  ).get(),
  new CreekImage(
    "barrell",
    32,
    32,
    "resources/images/tileset.png",
    400,
    144,
    16,
    16
  ).get(),
  new CreekImage(
    "bush",
    32,
    32,
    "resources/images/tileset.png",
    288,
    144,
    16,
    16
  ).get(),
  new CreekImage(
    "dead_tree",
    32,
    32,
    "resources/images/tileset.png",
    320,
    128,
    16,
    16
  ).get(),
  new CreekImage(
    "treasure",
    32,
    32,
    "resources/images/tileset.png",
    448,
    16,
    16,
    16
  ).get(),
  new CreekImage(
    "gravel",
    32,
    32,
    "resources/images/tileset.png",
    192,
    128,
    16,
    16
  ).get(),
  new CreekImage(
    "hill",
    32,
    32,
    "resources/images/tileset.png",
    48,
    192,
    16,
    16
  ).get(),
  new CreekImage(
    "shards",
    32,
    32,
    "resources/images/tileset.png",
    432,
    48,
    16,
    16
  ).get(),
  new CreekImage(
    "small_tree",
    32,
    32,
    "resources/images/tileset.png",
    0,
    192,
    16,
    16
  ).get(),
  new CreekImage(
    "stump",
    32,
    32,
    "resources/images/tileset.png",
    336,
    128,
    16,
    16
  ).get(),
  new CreekImage(
    "bones",
    32,
    32,
    "resources/images/tileset.png",
    448,
    48,
    16,
    16
  ).get(),
  new CreekImage(
    "skeleton",
    32,
    32,
    "resources/images/dragon_warrior_monsters.png",
    24,
    202,
    24,
    24
  ).get()
];

export default Resources;
