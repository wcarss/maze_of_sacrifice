"use strict";

import Maps from "./maps.js";

class Start {
  constructor(creek, x, y, size) {
    this.creek = creek;
    this.x = x;
    this.y = y;
    this.x_size = size;
    this.y_size = size;
    this.layer = 1;
  }

  draw = (context, interpolation) => {
    const grass = this.creek.resources.get_image("grass");
    const temple = this.creek.resources.get_image("temple");
    context.drawImage(
      grass.img,
      this.x * this.x_size,
      this.y * this.y_size,
      this.x_size,
      this.y_size
    );
    context.drawImage(
      temple.img,
      this.x * this.x_size,
      this.y * this.y_size,
      this.x_size,
      this.y_size
    );
  };

  update = creek => {
    const controls = creek.controls;
    const data = creek.data;
    const player = data.player;
    const maps = data.maps;
    const current_map = maps.current_map;
    const last_map_id = current_map.last_map_id;
    const drawer = creek.drawer;

    if (
      controls.check_key("Space") &&
      last_map_id !== undefined &&
      player.x === this.x &&
      player.y === this.y &&
      (player.last_x && player.last_y)
    ) {
      drawer.clearScreen();
      creek.audio.play("level");
      current_map.exit_x = this.x;
      current_map.exit_y = this.y;
      maps.change_map(
        last_map_id,
        maps.maps[last_map_id].exit_x,
        maps.maps[last_map_id].exit_y
      );
      data.break_update_loop = true;
    }
  };

  get rect() {
    return {
      x: this.x * this.x_size,
      y: this.y * this.y_size,
      x_size: this.x_size,
      y_size: this.y_size,
    };
  }
}

class End {
  constructor(creek, x, y, size) {
    this.creek = creek;
    this.x = x;
    this.y = y;
    this.x_size = size;
    this.y_size = size;
    this.layer = 1;
    this.last_level = 12;
  }

  draw = (context, interpolation) => {
    const grass = this.creek.resources.get_image("grass");
    const temple = this.creek.resources.get_image("temple");
    context.drawImage(
      grass.img,
      this.x * this.x_size,
      this.y * this.y_size,
      this.x_size,
      this.y_size
    );
    context.drawImage(
      temple.img,
      this.x * this.x_size,
      this.y * this.y_size,
      this.x_size,
      this.y_size
    );
  };

  update = creek => {
    const controls = creek.controls;
    const data = creek.data;
    const player = data.player;
    const current_map_id = data.maps.current_map_id;
    const current_map = data.maps.current_map;
    const next_map_id = current_map.next_map_id;
    const drawer = creek.drawer;

    if (player.paused) return;

    if (
      controls.check_key("Space") &&
      player.x === this.x &&
      player.y === this.y &&
      (player.last_x && player.last_y)
    ) {
      drawer.clearScreen();
      creek.audio.play("level");
      current_map.exit_x = this.x;
      current_map.exit_y = this.y;
      if (next_map_id === Maps.make_id(0)) {
        data.maps.maps[next_map_id].last_map_id = current_map_id;
      }
      data.maps.change_map(next_map_id);
      data.break_update_loop = true;
    }
  };

  get rect() {
    return {
      x: this.x * this.x_size,
      y: this.y * this.y_size,
      x_size: this.x_size,
      y_size: this.y_size,
    };
  }
}

export { Start, End };
