class Start {
  constructor (creek, x, y, x_size, y_size, color) {
    this.creek = creek;
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = color;
    this.layer = 1;
  }

  draw (context, interpolation) {
    let grass = this.creek.get('resources').get_image('grass');
    let temple = this.creek.get('resources').get_image('temple');
    context.drawImage(grass.img, this.x*this.x_size, this.y*this.y_size, this.x_size, this.y_size);
    context.drawImage(temple.img, this.x*this.x_size, this.y*this.y_size, this.x_size, this.y_size);
  }

  update (creek) {

  }
};

class End {
  constructor (creek, x, y, x_size, y_size, color) {
    this.creek = creek;
    this.x = x;
    this.y = y;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = color;
    this.layer = 1;
    this.last_level = 12;
  }

  draw (context, interpolation) {
    let grass = this.creek.get('resources').get_image('grass');
    let temple = this.creek.get('resources').get_image('temple');
    context.drawImage(grass.img, this.x*this.x_size, this.y*this.y_size, this.x_size, this.y_size);
    context.drawImage(temple.img, this.x*this.x_size, this.y*this.y_size, this.x_size, this.y_size);
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
      creek.get('audio').play('level');
      creek.get('data').get('next_map')();
    }
  }
};

export {Start, End};
