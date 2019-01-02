import Palettes from './palettes.js';

class Player {
  constructor(creek, x, y, x_size, y_size, color, palette) {
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = color;
    this.layer = 2;
    this.previous = [];
    this.previous_check = {};
    this.palette = palette;
    this.creek = creek;
    this.followers = 0;
    this.default_wait_time = 180;
    this.wait_time = this.default_wait_time;
    this.max_health = 5;
    this.health = this.max_health;
  }

  get_key (x, y) {
    return `${x}-${y}`;
  }

  draw(context, interpolation) {
    let size = null,
      x = null,
      y = null,
      ticks = this.creek.get('time').ticks,
      prev = null;

    let player = this.creek.get('resources').get_image('player');
    context.fillStyle = "red";
    context.fillRect(this.x*this.x_size, (this.y)*this.y_size, this.x_size, 6);
    context.fillStyle = "#00ff00";
    context.fillRect(this.x*this.x_size, (this.y)*this.y_size, this.x_size*(this.health/this.max_health), 6);
    context.drawImage(player.img, this.x*this.x_size, this.y*this.y_size, this.x_size, this.y_size);
  }

  update(creek) {
    const time = creek.get('time'),
      controls = creek.get('controls'),
      grid = creek.get('data').get('grid'),
      enemies = creek.get('data').get('enemies'),
      key = grid.get_key,
      tile = grid.tiles[key(this.x, this.y)],
      n  = grid.tiles[key(this.x, this.y-1)],
      s  = grid.tiles[key(this.x, this.y+1)],
      e  = grid.tiles[key(this.x+1, this.y)],
      w  = grid.tiles[key(this.x-1, this.y)],
      nw = grid.tiles[key(this.x-1, this.y-1)],
      ne = grid.tiles[key(this.x+1, this.y-1)],
      sw = grid.tiles[key(this.x-1, this.y+1)],
      se = grid.tiles[key(this.x+1, this.y+1)];

    let new_x = this.x,
      new_y = this.y,
      move_distance = 1,
      vdir = null,
      hdir = null,
      prev_check = null;

    if (this.health < 1) {
      console.log('player lost!');
      creek.get('data').set('game_running', false);
    }

    if (controls.check_key('Space') && (!this.attacked_at || (time.ticks - this.attacked_at > 350))) {
      this.attacked_at = time.ticks;
      enemies.give_damage_xy(this.x, this.y);
      creek.get('audio').play('slash');
    }

    if (controls.check_key('ArrowUp')) {
      vdir = 'n';
    } else if (controls.check_key('ArrowDown')) {
      vdir = 's';
    }

    if (controls.check_key('ArrowLeft')) {
      hdir = 'w';
    } else if (controls.check_key('ArrowRight')) {
      hdir = 'e';
    }

    if (navigator.maxTouchPoints !== 0) {
      let mouse = controls.get_mouse();
      let context = creek.get('context'),
        width = context.get_width(),
        height = context.get_height(),
        third_x = width/3,
        third_y = height/3,
        top_third_x = width-third_x,
        top_third_y = height-third_y;

      if (!mouse.pressed) {
        return;
      }

      if (mouse.x < third_x) {
        hdir = 'w';
      } else if (mouse.x > top_third_x) {
        hdir = 'e';
      }

      if (mouse.y < third_y) {
        vdir = 'n';
      } else if (mouse.y > top_third_y) {
        vdir = 's';
      }
    }

    if (vdir === null && hdir === null) {
      return;
      this.wait_time = this.default_wait_time;
    }

    if (hdir === 'w' && !w.wall) {
      new_x = this.x - move_distance;
    } else if (hdir ==='e' && !e.wall) {
      new_x = this.x + move_distance;
    }

    if (vdir === 'n' && !n.wall) {
      new_y = this.y - move_distance;
    } else if (vdir === 's' && !s.wall) {
      new_y = this.y + move_distance;
    }

    if (vdir === 'n') {
      if ((hdir === 'w' && nw.wall) || (hdir === 'e' && ne.wall)) {
        this.wait_time = this.default_wait_time;
        return;
      }
    } else if (vdir === 's') {
      if ((hdir === 'w' && sw.wall) || (hdir === 'e' && se.wall)) {
        this.wait_time = this.defalt_wait_time;
        return;
      }
    }

    if (((this.last_vdir || this.last_hdir) && this.moved_at) && (time.ticks - this.moved_at < this.wait_time)) {
      // don't move more than once / wait time ms in the same direction
      return;
    }

    if ((vdir && this.last_vdir === vdir) || (hdir && this.last_hdir === hdir)) {
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

    grid.visit(this.x, this.y, 1, true);
    grid.reveal(this.x, this.y, 3);
    grid.reveal(this.x-1, this.y-1, 0);
    grid.reveal(this.x+1, this.y-1, 0);
    grid.reveal(this.x-1, this.y+1, 0);
    grid.reveal(this.x+1, this.y+1, 0);

    this.moved_at = time.ticks;
  }
}

export default Player;
