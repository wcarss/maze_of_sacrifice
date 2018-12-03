function random_int(num) {
  return parseInt(Math.floor(Math.random()*num));
}

class NPCs {
  get_key(x, y) {
    return `${x}_${y}`;
  }

  constructor (number, width, height, x_size, y_size, palette) {
    this.npcs = [];
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
      this.active = false;
    }
  }
};

export default NPCs;
