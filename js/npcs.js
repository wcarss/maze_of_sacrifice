function random_int(num) {
  return parseInt(Math.floor(Math.random()*num));
}

class NPCs {
  get_key(x, y) {
    return `${x}_${y}`;
  }

  constructor (number, width, height, x_size, y_size, palette) {
    this.npcs = [];
    this.number = number;
    this.found = 0;
    this.map_width = width;
    this.map_height = height;
    this.palette = palette;
    this.npc_id_lookup = {};

    let x = random_int(width-1)+1,
      y = random_int(height-1)+1,
      positions = {};

    positions[this.get_key(1, 1)] = true;
    positions[this.get_key(width-1, height-1)] = true;

    for (let i = 0; i < number; i++) {
      while (positions[this.get_key(x, y)]) {
        x = random_int(width-1)+1;
        y = random_int(height-1)+1;
      }
      positions[this.get_key(x, y)] = true;
      this.npcs.push(new NPC(`npc_${i}`, x, y, x_size, y_size, palette))
      this.npc_id_lookup[`npc_${i}`] = this.npcs.length-1;
    }
  }

  static lookup_sound(num) {
    
    const sounds = {
      0 : "pickup_c",
      1 : "pickup_c_sharp",
      2 : "pickup_d",
      3 : "pickup_e_flat",
      4 : "pickup_e",
      5 : "pickup_f",
      6 : "pickup_f_sharp",
      7 : "pickup_g",
      8 : "pickup_g_sharp",
      9 : "pickup_a",
      10 : "pickup_b_flat",
      11 : "pickup_b",
      12 : "pickup_c_2",
      13 : "pickup_c_sharp_2",
      14 : "pickup_d_2",
      15 : "pickup_e_flat_2",
      16 : "pickup_e_2",
      17 : "pickup_f_2",
    }

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
  constructor (id, x, y, x_size, y_size, palette) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = random_int(palette.length);
    this.layer = 2;
    this.active = true;
  }

  draw (context, interpolation) {
    if (this.active) {
      context.fillStyle = this.color;
      context.fillRect(this.x*this.x_size+6, this.y*this.y_size+6, this.x_size-12, this.y_size-12);
    }
  }

  update (creek) {
    if (!this.active) return;

    const player = creek.get('data').get('player');

    if (player.x === this.x && player.y === this.y) {
      player.followers += 1;
      creek.get('audio').play(NPCs.lookup_sound(player.followers));
      this.active = false;
    }
  }
};

export default NPCs;
