import Palettes from '/js/palettes.js';

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

    context.globalAlpha = 0.32;
    for (let i = 0; i < this.previous.length; i++) {
      x = this.previous[i][0];
      y = this.previous[i][1];

      prev = this.previous_check[this.get_key(x, y)];

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
    this.drew_trail_at = ticks;

    context.globalAlpha = 1;
    context.fillStyle = 'black';
    context.fillRect(this.x*this.x_size+6, this.y*this.y_size+6, this.x_size-12, this.y_size-12);
    context.fillStyle = this.color;
    context.fillRect(this.x*this.x_size+8, this.y*this.y_size+8, this.x_size-16, this.y_size-16);
  }

  update(creek) {
    const time = creek.get('time'),
      controls = creek.get('controls'),
      grid = creek.get('data').get('grid'),
      key = grid.key,
      reveal = grid.reveal,
      visit = grid.visit,
      tile = grid.tiles[key(this.x, this.y)];

    let new_x = this.x,
      new_y = this.y,
      move_distance = 1,
      dir = null,
      prev_check = null;

    visit(grid, this.x, this.y, 2);
    reveal(grid, this.x, this.y, 8);

    if (controls.check_key('ArrowUp') && !tile.walls.n) {
      dir = 'n';
      new_y = this.y - move_distance;
    } else if (controls.check_key('ArrowDown') && !tile.walls.s) {
      dir = 's';
      new_y = this.y + move_distance;
    }

    if (controls.check_key('ArrowLeft') && !tile.walls.w) {
      dir = 'w';
      new_x = this.x - move_distance;
    } else if (controls.check_key('ArrowRight') && !tile.walls.e) {
      dir = 'e';
      new_x = this.x + move_distance;
    }

    if (dir === null) return;

    if ((this.last_dir && this.moved_at) && (time.ticks - this.moved_at < 95) && dir === this.last_dir) {
      // don't move more than once / 50ms in the same direction
      return;
    }

    this.last_x = this.x;
    this.last_y = this.y;
    this.x = new_x;
    this.y = new_y;
    if (this.last_x !== this.x || this.last_y !== this.y) {
      console.log('x is not the same');
      prev_check = this.previous_check[this.get_key(this.x, this.y)];
      if (prev_check === undefined || prev_check.removed) {
        this.previous.push([this.x, this.y]);
        prev_check = {size: (prev_check && prev_check.size) || 13, color: null};
        //if (this.previous.length > 60) {
        //  this.previous.shift();
        //  prev_check.removed = true;
        //}
      } else {
        //this.previous.push(this.previous.shift());
        if (prev_check.size > 6) {
          prev_check.size -= 2;
        }
      }
      this.previous_check[this.get_key(this.x, this.y)] = prev_check;
    }
    this.moved_at = time.ticks;
    this.last_dir = dir;
  }
}

export default Player;
