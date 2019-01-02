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
    const data = creek.get('data'),
      player = data.get('player'),
      current_map_id = data.get('current_map'),
      current_map = data.get('maps')[current_map_id],
      last_map_id = current_map.last_map_id;

    if (last_map_id && player.x === this.x && player.y === this.y && (player.last_x && player.last_y)) {
      creek.get('context').get().clearRect(0, 0, creek.get('context').get_width(), creek.get('context').get_height());
      creek.get('audio').play('level');
      current_map.exit_x = this.x;
      current_map.exit_y = this.y;
      data.get('change_map')(last_map_id, creek, data.get('maps')[last_map_id].exit_x, data.get('maps')[last_map_id].exit_y);
    }
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
    const data = creek.get('data'),
      player = data.get('player'),
      current_map_id = data.get('current_map'),
      current_map = data.get('maps')[current_map_id],
      next_map_id = current_map.next_map_id;

    if (player.x === this.x && player.y === this.y && (player.last_x && player.last_y)) {
      creek.get('context').get().clearRect(0, 0, creek.get('context').get_width(), creek.get('context').get_height());
      creek.get('audio').play('level');
      current_map.exit_x = this.x;
      current_map.exit_y = this.y;
      if (next_map_id === 'map_0') {
        data.get('maps')[next_map_id].last_map_id = current_map_id;
      }
      data.get('change_map')(next_map_id, creek);
    }
  }
};

export {Start, End};
