class Maze {
  random_int(n) {
    return parseInt(Math.floor(Math.random()*n));
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  get_key(x, y) {
    return `tile_${x}_${y}`;
  }

  constructor(id, width, height, x_size, y_size, color) {
    this.id = id;
    this.tiles = {};
    this.cells = [];
    this.directions = ['n', 's', 'e', 'w'];
    this.opposite = {
      'n': 's',
      's': 'n',
      'e': 'w',
      'w': 'e'
    };
    this.dx = {
      'n': 0,
      's': 0,
      'e': 1,
      'w': -1
    };
    this.dy = {
     'n': -1,
     's': 1,
     'e': 0,
     'w': 0
    };
    this.width = width;
    this.height = height;
    this.x_size = x_size;
    this.y_size = y_size;
    this.color = color;
  }

  next_index(num) {
    if (Math.random() > 0.25) {
      return num - 1;
    } else {
      return this.random_int(num);
    }
  }

  generate() {
    let index = null,
      x = null,
      y = null,
      nx = null,
      ny = null,
      dir = null,
      dir_index = null,
      count = 0;

    const random_int = this.random_int,
      get_key = this.get_key,
      shuffle = this.shuffle,
      dx = this.dx,
      dy = this.dy,
      directions = this.directions,
      opposite = this.opposite,
      cells = this.cells,
      tiles = this.tiles;
      // color_index = random_int(palette.length);

    x = random_int(this.width-1)+1;
    y = random_int(this.height-1)+1;
    tiles[get_key(x, y)] = new Tile(x, y, this.x_size, this.y_size, this.color); // palette[color_index]);
    cells.push([x, y]);

    while (cells.length > 0) {
      count += 1;
      // if (count > 50) {
      //   break;
      // }
      index = this.next_index(cells.length);
      x = cells[index][0];
      y = cells[index][1];

      shuffle(directions);
      for (dir_index = 0; dir_index < directions.length; dir_index++) {
        dir = directions[dir_index];
        nx = x + dx[dir];
        ny = y + dy[dir];
        if (nx > 0 && ny > 0 && nx < this.width && ny < this.height && tiles[get_key(nx, ny)] === undefined) { 
          tiles[get_key(x, y)].walls[dir] = false;
          tiles[get_key(nx, ny)] = new Tile(nx, ny, this.x_size, this.y_size, this.color); // palette[color_index]);
          tiles[get_key(nx, ny)].walls[opposite[dir]] = false;
          cells.push([nx, ny]);
          index = null;
          break;
        }
      }

      if (index !== null) {
        cells.splice(index, 1);
        // color_index = (color_index + 1) % palette.length;
      }
    }

    const openness_parameter = 78; // 18 random walls will come down!
    let tile = null, new_tile = null;
    for (let i = 0; i < openness_parameter; i++) {
      x = random_int(this.width-3)+2;
      y = random_int(this.height-3)+2;
      tile = tiles[get_key(x, y)]
      shuffle(directions);
      for (dir_index = 0; dir_index < directions.length; dir_index++) {
        dir = directions[dir_index];
        if (tile.walls[dir]) {
          tile.walls[dir] = false;
          tiles[get_key(x + dx[dir], y + dy[dir])].walls[opposite[dir]] = false;
          break;
        } 
      }
    }
  }

  visit(x, y, n) {
    let tile = this.tiles[this.get_key(x, y)];
    if (!tile) debugger;
    tile.visited = true;

    if (n < 1) {
      return;
    }

    if (!tile.walls.n) {
      this.visit(x, y-1, n-1);
    }
    if (!tile.walls.s) {
      this.visit(x, y+1, n-1);
    }
    if (!tile.walls.e) {
      this.visit(x+1, y, n-1);
    }
    if (!tile.walls.w) {
      this.visit(x-1, y, n-1);
    }
  }

  reveal(x, y, n) {
    let tile = this.tiles[this.get_key(x, y)];
    if (!tile) debugger;
    tile.revealed = true;

    if (n < 1) {
      return;
    }

    if (!tile.walls.n) {
      this.reveal(x, y-1, n-1);
    }
    if (!tile.walls.s) {
      this.reveal(x, y+1, n-1);
    }
    if (!tile.walls.e) {
      this.reveal(x+1, y, n-1);
    }
    if (!tile.walls.w) {
      this.reveal(x-1, y, n-1);
    }
  }
}

class Tile {
  get_key(x, y) {
    return `tile_${x}_${y}`;
  }

  constructor(x, y, x_size, y_size, color) {
    this.id = this.get_key(x, y);
    this.x = x*x_size;
    this.y = y*y_size;
    this.x_size = x_size;
    this.y_size = y_size;
    this.visited = false;
    this.revealed = false;
    this.walls = {
      n: true,
      s: true,
      e: true,
      w: true
    };
    this.color = color // palette[random_int(palette.length)];
    this.layer = 2;
  }

  draw (context, interpolation) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.x_size, this.y_size);

    context.fillStyle = "black";
    if (this.walls.n) {
      context.fillRect(this.x-2, this.y-2, this.x_size+2, 4);
    }
    if (this.walls.s) {
      context.fillRect(this.x-2, this.y+this.y_size-2, this.x_size+2, 4);
    }
    if (this.walls.e) {
      context.fillRect(this.x+this.x_size-2, this.y-2, 3, this.y_size+2);
    }
    if (this.walls.w) {
      context.fillRect(this.x-2, this.y-2, 4, this.y_size+2);
    }

    if (this.revealed && !this.visited) {
      context.globalAlpha = 0.8;
      context.fillRect(this.x, this.y, this.x_size, this.y_size); 
      context.globalAlpha = 1;
    } else if (!this.visited) {
      context.fillRect(this.x, this.y, this.x_size, this.y_size); 
    }
  }

  update (creek) {
  }
}

export default Maze;
