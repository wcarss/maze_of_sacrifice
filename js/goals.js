class Start {
  constructor (x, y, x_size, y_size, color) {
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = color;
    this.layer = 1;
  }

  draw (context, interpolation) {
    context.fillStyle = this.color;
    context.fillRect(this.x*this.x_size+4, this.y*this.y_size+4, this.x_size-8, this.y_size-8);
  }

  update (creek) {

  }
};

class End {
  constructor (x, y, x_size, y_size, color) {
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = color;
    this.layer = 1;
    this.last_level = 8;
  }

  draw (context, interpolation) {
    context.fillStyle = this.color;
    context.fillRect(this.x*this.x_size+4, this.y*this.y_size+4, this.x_size-8, this.y_size-8);
  }

  update (creek) {
    const player = creek.get('data').get('player');
    if (player.x === this.x && player.y === this.y) {
      player.previous_check = {};
      player.previous = [];
      if (creek.get('data').get('level') >= this.last_level) {
        creek.get('data').set('level', 0);
      }
      creek.get('context').get().clearRect(0, 0, creek.get('context').get_width(), creek.get('context').get_height());
      creek.get('data').get('next_map')();
    }
  }
};

export {Start, End};
