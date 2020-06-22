"use strict";

import Palettes from "./palettes.js";

class Player {
  constructor(x, y, x_size, y_size, color, palette) {
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = color;
    this.layer = 2;
    this.previous = [];
    this.previous_check = {};
    this.palette = palette;
    this.followers = 0;
    this.default_wait_time = 180;
    this.wait_time = this.default_wait_time;
    this.max_health = 5;
    this.health = this.max_health;
    this.paused = false;
    this.muted = false;
    this.coins = 0;
    this.kills = 0;
    this.level = 0;
  }

  init = creek => {
    this.creek = creek;
    creek.utilities.setup_throttle("player_attack", 300);
    creek.utilities.setup_throttle("player_move", 90);
    creek.utilities.setup_throttle("player_pause", 90);
  };

  get_key = (x, y) => `${x}-${y}`;

  draw = (context, interpolation) => {
    let size = null;
    let x = null;
    let y = null;
    let ticks = this.creek.time.ticks;
    let prev = null;
    let player = this.creek.resources.get_image("player");

    context.fillStyle = "red";
    context.fillRect(
      this.x * this.x_size,
      this.y * this.y_size,
      this.x_size,
      6
    );
    context.fillStyle = "#00ff00";
    context.fillRect(
      this.x * this.x_size,
      this.y * this.y_size,
      this.x_size * (this.health / this.max_health),
      6
    );
    context.drawImage(
      player.img,
      this.x * this.x_size,
      this.y * this.y_size,
      this.x_size,
      this.y_size
    );
    context.clearRect(50, context.canvas.height - 30, 352, 35);
    context.font = "28px serif";
    context.fillStyle = "white";
    context.fillText(
      `coins: ${this.coins}   kills: ${this.kills}  level: ${this.level + 1}`,
      70,
      context.canvas.height - 5
    );

    if (this.health < 1) {
      const data = this.creek.data;
      const map = data.maps.current_map;
      const mid_map_height = map.pixel_height / 2 + 30; // half of map height w/ 1-tile offset
      const mid_map_width = map.pixel_width / 2 + 30; // half of map width w/ 1-tile offset

      context.font = "44px serif";
      const defeatString = `PLAYER DEFEATED!`;
      const defeatMeasure = context.measureText(defeatString);
      const defeatHeight =
        defeatMeasure.actualBoundingBoxAscent +
        defeatMeasure.actualBoundingBoxDescent;
      context.fillStyle = "#222";

      context.fillRect(
        0,
        // 30px above mid-height, at line-top, and 10px for padding
        mid_map_height - 30 - defeatMeasure.actualBoundingBoxAscent - 10,
        map.pixel_width,
        // the height of the line above+below + 10px padding above+below
        defeatHeight + 20
      );
      context.fillStyle = "red";

      context.fillText(
        defeatString,
        mid_map_width - defeatMeasure.width / 2,
        mid_map_height - 30
      );

      context.font = "28px serif";
      const refreshString = `refresh to play again...`;
      const refreshMeasure = context.measureText(refreshString);
      const refreshHeight =
        refreshMeasure.actualBoundingBoxAscent +
        refreshMeasure.actualBoundingBoxDescent;
      context.fillStyle = "#222";
      context.fillRect(
        0,
        mid_map_height + 30 - refreshMeasure.actualBoundingBoxAscent - 10,
        map.pixel_width,
        // the height of the line above+below + 10px padding above+below
        refreshHeight + 18
      );
      context.fillStyle = "red";

      context.fillText(
        refreshString,
        mid_map_width - refreshMeasure.width / 2,
        mid_map_height + 30
      );
    }
  }

  update = creek => {
    const time = creek.time;
    const controls = creek.controls;
    const maze = creek.data.maze;
    const enemies = creek.data.enemies;
    const utilities = creek.utilities;
    const key = maze.get_key;
    const tile = maze.tiles[key(this.x, this.y)];
    const n = maze.tiles[key(this.x, this.y - 1)];
    const s = maze.tiles[key(this.x, this.y + 1)];
    const e = maze.tiles[key(this.x + 1, this.y)];
    const w = maze.tiles[key(this.x - 1, this.y)];
    const nw = maze.tiles[key(this.x - 1, this.y - 1)];
    const ne = maze.tiles[key(this.x + 1, this.y - 1)];
    const sw = maze.tiles[key(this.x - 1, this.y + 1)];
    const se = maze.tiles[key(this.x + 1, this.y + 1)];

    if (!n) debugger;

    let new_x = this.x;
    let new_y = this.y;
    let move_distance = 1;
    let vdir = null;
    let hdir = null;
    let prev_check = null;

    if (
      (controls.check_key("Escape") || controls.check_key("KeyP")) &&
      utilities.use_throttle("player_pause")
    ) {
      this.paused = !this.paused;
      if (this.paused) {
        creek.audio.pause_all();
      } else {
        creek.audio.unpause_all();
      }
    }

    if (this.paused) return;

    if (controls.check_key("KeyM") && utilities.use_throttle("player_pause")) {
      this.muted = !this.muted;
      if (this.muted) {
        creek.audio.mute_all();
      } else {
        creek.audio.unmute_all();
      }
    }

    if (this.health < 1) {
      console.log("player lost!");
      creek.data.game_running = false;
    }

    if (
      controls.check_key("Space") &&
      utilities.use_throttle("player_attack")
    ) {
      enemies.give_damage_xy(this.x, this.y);
      creek.audio.play("slash");
    }

    if (controls.check_key("ArrowUp")) {
      vdir = "n";
    } else if (controls.check_key("ArrowDown")) {
      vdir = "s";
    }

    if (controls.check_key("ArrowLeft")) {
      hdir = "w";
    } else if (controls.check_key("ArrowRight")) {
      hdir = "e";
    }

    if (navigator.maxTouchPoints !== 0) {
      let mouse = controls.get_mouse();
      let context = creek.context_manager;
      let width = context_manager.width;
      let height = context_manager.height;
      let third_x = width / 3;
      let third_y = height / 3;
      let top_third_x = width - third_x;
      let top_third_y = height - third_y;

      if (!mouse.pressed) {
        return;
      }

      if (mouse.x < third_x) {
        hdir = "w";
      } else if (mouse.x > top_third_x) {
        hdir = "e";
      }

      if (mouse.y < third_y) {
        vdir = "n";
      } else if (mouse.y > top_third_y) {
        vdir = "s";
      }
    }

    if (vdir === null && hdir === null) {
      return;
      this.wait_time = this.default_wait_time;
    }

    if (hdir === "w" && !w.wall) {
      new_x = this.x - move_distance;
    } else if (hdir === "e" && !e.wall) {
      new_x = this.x + move_distance;
    }

    if (vdir === "n" && !n.wall) {
      new_y = this.y - move_distance;
    } else if (vdir === "s" && !s.wall) {
      new_y = this.y + move_distance;
    }

    if (vdir === "n") {
      if ((hdir === "w" && nw.wall) || (hdir === "e" && ne.wall)) {
        this.wait_time = this.default_wait_time;
        return;
      }
    } else if (vdir === "s") {
      if ((hdir === "w" && sw.wall) || (hdir === "e" && se.wall)) {
        this.wait_time = this.defalt_wait_time;
        return;
      }
    }

    if (
      (this.last_vdir || this.last_hdir) &&
      !utilities.use_throttle("player_move")
    ) {
      // don't move more than once / wait time ms in the same direction
      return;
    }

    if (
      (vdir && this.last_vdir === vdir) ||
      (hdir && this.last_hdir === hdir)
    ) {
      this.wait_time = 40;
    } else {
      this.wait_time = this.default_wait_time;
    }

    this.last_vdir = vdir;
    this.last_hdir = hdir;
    this.last_x = this.x;
    this.last_y = this.y;
    this.x = new_x;
    this.y = new_y;

    maze.visit(this.x, this.y, 1, true);
    maze.reveal(this.x, this.y, 3);
    maze.reveal(this.x - 1, this.y - 1, 0);
    maze.reveal(this.x + 1, this.y - 1, 0);
    maze.reveal(this.x - 1, this.y + 1, 0);
    maze.reveal(this.x + 1, this.y + 1, 0);

    this.moved_at = time.ticks;
  }
}

export default Player;
