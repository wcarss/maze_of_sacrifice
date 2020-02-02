function random_int(num) {
  return parseInt(Math.floor(Math.random() * num));
}

class NPCs {
  get_key(x, y) {
    return `${x}_${y}`;
  }

  constructor(creek, number, width, height, size, maze) {
    this.creek = creek;
    this.npcs = [];
    this.number = number;
    this.found = 0;
    width *= 2;
    height *= 2;
    this.map_width = width;
    this.map_height = height;
    this.npc_id_lookup = {};

    let x = random_int(width - 1) + 1;
    let y = random_int(height - 1) + 1;
    let positions = {};

    positions[this.get_key(2, 2)] = true;
    positions[this.get_key(width - 2, height - 2)] = true;

    for (let i = 0; i < number; i++) {
      while (
        positions[this.get_key(x, y)] ||
        maze.tiles[maze.get_key(x, y)].wall
      ) {
        x = random_int(width - 2) + 1;
        y = random_int(height - 2) + 1;
      }
      positions[this.get_key(x, y)] = true;
      this.npcs.push(new NPC(creek, `npc_${i}`, x, y, size));
      this.npc_id_lookup[`npc_${i}`] = this.npcs.length - 1;
    }
  }

  static lookup_sound(num) {
    const sounds = {
      0: "pickup_c",
      1: "pickup_c_sharp",
      2: "pickup_d",
      3: "pickup_e_flat",
      4: "pickup_e",
      5: "pickup_f",
      6: "pickup_f_sharp",
      7: "pickup_g",
      8: "pickup_g_sharp",
      9: "pickup_a",
      10: "pickup_b_flat",
      11: "pickup_b",
      12: "pickup_c_2",
      13: "pickup_c_sharp_2",
      14: "pickup_d_2",
      15: "pickup_e_flat_2",
      16: "pickup_e_2",
      17: "pickup_f_2"
    };

    if (num !== 0 && num % 16 == 0) {
      return "pickup_success_f_2";
    } else if (num !== 0 && num % 8 == 0) {
      return "pickup_success_c_2";
    } else {
      return sounds[num % 16];
    }
  }

  get_npcs() {
    return this.npcs;
  }

  get_npc(id) {
    return this.npcs[this.npc_id_lookup[id]];
  }
}

class NPC {
  constructor(creek, id, x, y, size) {
    this.creek = creek;
    this.id = id;
    this.x = x;
    this.y = y;
    this.x_size = size;
    this.y_size = size;
    this.layer = 2;
    this.active = true;
  }

  draw(context, interpolation) {
    if (this.active) {
      let coin = this.creek.get("resources").get_image("coin"),
        maze = this.creek.get("data").get("maze"),
        tile = maze.tiles[maze.get_key(this.x, this.y)];
      if (tile.visited || tile.revealed) {
        context.drawImage(
          coin.img,
          this.x * this.x_size,
          this.y * this.y_size,
          this.x_size,
          this.y_size
        );
      }
      if (!tile.visited && tile.revealed) {
        context.globalAlpha = 0.3;
        context.fillStyle = "black";
        context.fillRect(
          this.x * this.x_size,
          this.y * this.y_size,
          this.x_size,
          this.y_size
        );
        context.globalAlpha = 1;
      }
    }
  }

  update(creek) {
    if (!this.active) return;

    const player = creek.get("data").get("player");

    if (player.paused) return;

    if (player.x === this.x && player.y === this.y) {
      player.health += 1;
      player.followers += 1;
      if (player.health > player.max_health) {
        player.health = player.max_health;
      }
      creek.get("audio").play(NPCs.lookup_sound(player.followers));
      this.active = false;
    }
  }
}

export default NPCs;
