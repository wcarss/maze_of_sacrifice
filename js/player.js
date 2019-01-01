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

    /*context.globalAlpha = 0.52;
    for (let i = 0; i < this.previous.length; i++) {
      x = this.previous[i][0];
      y = this.previous[i][1];

      prev = this.previous_check[this.get_key(x, y)];
      if (!prev) continue;

      if (!prev.drew_trail_at || ticks - prev.drew_trail_at > 2000) {
        prev.color_index = prev.color_index === undefined ? 0 : (prev.color_index + 1) % this.palette.length;
        prev.color = this.palette[prev.color_index]; // parseInt(Math.floor(Math.random()*this.palette.length))];
        prev.drew_trail_at = ticks;
        this.previous_check[this.get_key(x, y)] = prev;
      }
      context.fillStyle = prev.color;
      size = 20-prev.size;
      context.fillRect(x*this.x_size+size, y*this.y_size+size, this.x_size-size*2, this.y_size-size*2);
    }
    this.drew_trail_at = ticks;*/

    context.globalAlpha = 1;
    context.fillStyle = 'black';
    context.fillRect(
      this.x*this.x_size+6+2*(this.max_health-this.health),
      this.y*this.y_size+6+2*(this.max_health-this.health),
      this.x_size-(12+4*(this.max_health-this.health)),
      this.y_size-(12+4*(this.max_health-this.health))
    );
    context.fillStyle = this.color;
    context.fillRect(
      this.x*this.x_size+8+2*(this.max_health-this.health),
      this.y*this.y_size+8+2*(this.max_health-this.health),
      this.x_size-(16+4*(this.max_health-this.health)),
      this.y_size-(16+4*(this.max_health-this.health))
    );
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

    if (controls.check_key('Space') && (!this.attacked_at || (time.ticks - this.attacked_at > 500))) {
      this.attacked_at = time.ticks;
      enemies.give_damage_xy(this.x, this.y);
      this.last_color = this.color;
      this.color = "white";
    } else if (this.last_color) {
      this.color = this.last_color;
      this.last_color = null;
    }

/* for ice-world/sliding puzzle style
 *
 * if (this.last_hdir === 'w' && !w.wall) {
      hdir = 'w';
      new_x = this.x - move_distance;
      this.last_vdir = null;
    } else if (this.last_hdir === 'e' && !e.wall) {
      hdir = 'e';
      new_x = this.x + move_distance;
      this.last_vdir = null;
    }

    if (this.last_vdir === 'n' && !n.wall) {
      vdir = 'n';
      new_y = this.y - move_distance;
      this.last_hdir = null;
    } else if (this.last_vdir === 's' && !s.wall) {
      vdir = 's';
      new_y = this.y + move_distance;
      this.last_hdir = null;
    }
  *
  */

    if ((!hdir && !vdir) && navigator.maxTouchPoints !== 0) {
      let mouse = controls.get_mouse();
      let context = creek.get('context'),
        width = context.get_width(),
        height = context.get_height(),
        third_x = width/3,
        third_y = height/3,
        top_third_x = width-third_x,
        top_third_y = height-third_y;

      if (mouse.pressed) {
        if (mouse.x < third_x && !w.wall) {
          vdir = 'w';
          new_x = this.x - move_distance;
        } else if (mouse.x > top_third_x && !e.wall) {
          vdir = 'e';
          new_x = this.x + move_distance;
        }

        if (mouse.y < third_y && !n.wall) {
          hdir = 'n';
          new_y = this.y - move_distance;
        } else if (mouse.y > top_third_y && !s.wall) {
          hdir = 's';
          new_y = this.y + move_distance;
        }
      }
    } else if (!hdir && !vdir) {
      if (controls.check_key('ArrowUp') && !n.wall) {
        vdir = 'n';
        new_y = this.y - move_distance;
      } else if (controls.check_key('ArrowDown') && !s.wall) {
        vdir = 's';
        new_y = this.y + move_distance;
      }

      if (controls.check_key('ArrowLeft') && !w.wall) {
        hdir = 'w';
        new_x = this.x - move_distance;
      } else if (controls.check_key('ArrowRight') && !e.wall) {
        hdir = 'e';
        new_x = this.x + move_distance;
      }
    }

    if (vdir === null && hdir === null) {
      return;
      this.wait_time = this.default_wait_time;
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

/* for ice-world/sliding movement idea -- allows to place blocks w/ shift+direction
 *
 * if (controls.check_key('ShiftLeft')) {
      this.last_vdir = null;
      this.last_hdir = null;

      if (!this.moved_at || ((time.ticks - this.moved_at) < 200)) {
        this.moved_at = time.ticks;
        return;
      }

      this.moved_at = time.ticks;
      tile.wall = true;
    }
*/
    if (((this.last_vdir || this.last_hdir) && this.moved_at) && (time.ticks - this.moved_at < this.wait_time)) {
      // don't move more than once / 40ms in the same direction
      return;
    }

    if ((vdir && this.last_vdir === vdir) || (hdir && this.last_hdir === hdir)) {
      this.wait_time = 40;
    } else {
      this.wait_time = this.default_wait_time;
    }

    if (vdir) {
      this.last_vdir = vdir;
    }
    if (hdir) {
      this.last_hdir = hdir;
    }

    grid.visit(this.x, this.y, 2, true);
    grid.reveal(this.x, this.y, 8);

    this.last_x = this.x;
    this.last_y = this.y;
    this.x = new_x;
    this.y = new_y;

    if (this.last_x !== this.x || this.last_y !== this.y) {
      prev_check = this.previous_check[this.get_key(this.x, this.y)];
      if (prev_check === undefined || prev_check.removed) {
        this.previous.push([this.x, this.y]);
        prev_check = {size: (prev_check && prev_check.size) || 13, color: null};
        if (this.previous.length > this.followers) {
          this.previous.shift();
          prev_check.removed = true;
        }
      } else {
        this.previous.push(this.previous.shift());
        //if (prev_check.size > 6) {
        //  prev_check.size -= 2;
        //}
      }
      this.previous_check[this.get_key(this.x, this.y)] = prev_check;
    }
    this.moved_at = time.ticks;
  }
}

export default Player;
