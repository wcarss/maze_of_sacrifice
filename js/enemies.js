function random_int(num) {
  return parseInt(Math.floor(Math.random()*num));
}

class Enemies {
  get_key(x, y) {
    return `${x}_${y}`;
  }

  constructor (creek, number, width, height, x_size, y_size, palette, maze) {
    this.creek = creek;
    this.enemies = [];
    this.number = number;
    this.dead = 0;
    width *= 2;
    height *= 2;
    this.map_width = width;
    this.map_height = height;
    this.palette = palette;
    this.enemy_id_lookup = {};

    let x = random_int(width-1)+1,
      y = random_int(height-1)+1,
      positions = {};

    positions[this.get_key(2, 2)] = true;
    positions[this.get_key(width-2, height-2)] = true;

    for (let i = 0; i < number; i++) {
      while (positions[this.get_key(x, y)] || maze.tiles[maze.get_key(x, y)].wall) {
        x = random_int(width-2)+1;
        y = random_int(height-2)+1;
      }
      positions[this.get_key(x, y)] = true;
      this.enemies.push(new Enemy(creek, `enemy_${i}`, x, y, x_size, y_size, palette))
      this.enemy_id_lookup[`enemy_${i}`] = this.enemies.length-1;
    }
  }

  static lookup_sound(num) {
    const sounds = {
    }
  }

  get_enemies() {
    return this.enemies;
  }

  get_enemy(id) {
    return this.enemies[this.enemy_id_lookup[id]];
  }

  give_damage_xy(x, y) {
    let enemy = null;

    for (let enemy_index in this.enemies) {
      for (let i = x-1; i <= x+1; i++) {
        for (let j = y-1; j <= y+1; j++) {
          enemy = this.enemies[enemy_index];
          if (enemy && enemy.x === i && enemy.y === j) {
            enemy.give_damage();
          }
        }
      }
    }
  }
}

class Enemy {
  constructor (creek, id, x, y, x_size, y_size, palette) {
    this.creek = creek;
    this.id = id;
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = "red"; // random_int(palette.length);
    this.layer = 2;
    this.max_health = 3;
    this.health = 3;
    this.active = true;
    this.destination = {};
    this.moved_at = 0;
  }

  draw (context, interpolation) {
    if (this.active) {
      let skeleton = this.creek.get('resources').get_image('skeleton');
      context.fillStyle = "red";
      context.fillRect(this.x*this.x_size, (this.y)*this.y_size, this.x_size, 6);
      context.fillStyle = "#00ff00";
      context.fillRect(this.x*this.x_size, (this.y)*this.y_size, this.x_size*(this.health/this.max_health), 6);
      context.drawImage(skeleton.img, this.x*this.x_size, this.y*this.y_size, this.x_size, this.y_size);
    }
  }

  set_new_destination() {
    this.destination.x = 1;
    this.destination.y = 1;
  }

  give_damage() {
    console.log(`${this.id} takes 1 damage, health is ${this.health}`);
    this.health -= 1;
  }

  update (creek) {
    const time = creek.get('time'),
      player = creek.get('data').get('player'),
      maze = creek.get('data').get('grid'),
      key = maze.get_key;

    if (!this.active) return;

    if (this.health < 1) {
      this.active = false;
    }

    if (!this.destination || (this.x === this.destination.x && this.y === this.destination.y)) {
      this.set_new_destination();
    }

    if (time.ticks - this.moved_at > (Math.random()*400)+400) {
      this.moved_at = time.ticks;
      this.last_x = this.x;
      this.last_y = this.y;
      if (Math.random() > 0.5) {
        if (player.x > this.x) this.x += 1;
        if (player.x < this.x) this.x -= 1;
      } else {
        if (player.y > this.y) this.y += 1;
        if (player.y < this.y) this.y -= 1;
      }

      if (maze.tiles[key(this.x, this.y)].wall) {
        this.x = this.last_x;
        this.y = this.last_y;
      }

      if (this.last_color) {
        this.color = this.last_color;
        this.last_color = null;
      } else if (player.x === this.x && player.y === this.y) {
        player.health -= 1;
        console.log(`player takes 1 damage; player's health now ${player.health}`);
        this.last_color = this.color;
        this.color = 'white';
  //      creek.get('audio').play(NPCs.lookup_sound(player.followers));
        this.x = this.last_x;
        this.y = this.last_y;
      }
    }


  }
};

export default Enemies;
