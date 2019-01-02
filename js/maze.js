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

  constructor(creek, id, width, height, size) {
    this.creek = creek;
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
    this.x_size = size;
    this.y_size = size;
    this.generate();
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

    x = random_int(this.width-1)+1;
    y = random_int(this.height-1)+1;
    tiles[get_key(x, y)] = new Tile(this.creek, x, y, this.x_size);
    cells.push([x, y]);

    while (cells.length > 0) {
      count += 1;
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
      }
    }

    let openness_parameter = 0.085*this.width*this.height; // random walls will come down!

    if (this.width > 20) {
      openness_parameter *= 2.5;
    }

    let tile = null;
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

    let new_tiles = {};
    for (let i = 1; i < this.width*2; i++) {
      for (let j = 1; j < this.height*2; j++) {
        new_tiles[get_key(i, j)] = new NewTile(this.creek, i, j, this.x_size, true);
      }
    }

    for (let i = 1; i < this.width; i++) {
      for (let j = 1; j < this.height; j++) {
        tile = tiles[get_key(i, j)];

        if (!tile) {
          debugger;
        }

        new_tiles[get_key(i*2, j*2)].wall = false;
        new_tiles[get_key(i*2, j*2-1)].wall = tile.walls.n;
        new_tiles[get_key(i*2, j*2+1)].wall = tile.walls.s;
        new_tiles[get_key(i*2+1, j*2)].wall = tile.walls.e;
        new_tiles[get_key(i*2-1, j*2)].wall = tile.walls.w;
      }
    }

    let n = null, s = null, e = null, w = null, ne = null, nw = null, se = null, sw = null;
    for (let i = 3; i < this.width*2-2; i++) {
      for (let j = 3; j < this.height*2-2; j++) {
        tile = new_tiles[get_key(i, j)];
        n =  new_tiles[get_key(i, j-1)].wall;
        s =  new_tiles[get_key(i, j+1)].wall;
        e =  new_tiles[get_key(i+1, j)].wall;
        w =  new_tiles[get_key(i-1, j)].wall;
        nw = new_tiles[get_key(i-1, j-1)].wall;
        ne = new_tiles[get_key(i+1, j-1)].wall;
        sw = new_tiles[get_key(i-1, j+1)].wall;
        se = new_tiles[get_key(i+1, j+1)].wall;

        if (!n && !s && !e && !w && !ne && !nw && !se && !sw) {
          tile.wall = false;
        }
      }
    }

    this.tiles = new_tiles;
  }

  visit(x, y, n, mark_dirty) {
    let tile = this.tiles[this.get_key(x, y)];
    if (!tile) debugger;

    tile.visited = true;

    if (n < 1 || tile.wall) {
      return;
    }

    this.visit(x, y-1, n-1);
    this.visit(x, y+1, n-1);
    this.visit(x+1, y, n-1);
    this.visit(x-1, y, n-1);
  }

  reveal(x, y, n) {
    let tile = this.tiles[this.get_key(x, y)];
    if (!tile) return;
    tile.revealed = true;
    tile.dirty = true;

    if (n < 1 || tile.wall) {
      return;
    }

    this.reveal(x, y-1, n-1);
    this.reveal(x, y+1, n-1);
    this.reveal(x+1, y, n-1);
    this.reveal(x-1, y, n-1);
  }
}

class Tile {
  get_key(x, y) {
    return `tile_${x}_${y}`;
  }

  constructor(creek, x, y, size) {
    this.creek = creek;
    this.id = this.get_key(x, y);
    this.x = x*size;
    this.y = y*size;
    this.x_size = size;
    this.y_size = size;
    this.firstVisit = true;
    this.dirty = true;
    this.visited = false;
    this.revealed = false;
    this.walls = {
      n: true,
      s: true,
      e: true,
      w: true
    };
    this.layer = 2;
  }

  draw (context, interpolation) {
    context.fillStyle = "black";
    if (!this.visited && !this.revealed) {
      context.fillRect(this.x, this.y, this.x_size, this.y_size); 
      return;
    }

    if (this.walls.n) {
      context.fillRect(this.x, this.y, this.x_size+2, 2);
    }
    if (this.walls.s) {
      context.fillRect(this.x, this.y+this.y_size-2, this.x_size+2, 2);
    }
    if (this.walls.e) {
      context.fillRect(this.x+this.x_size-2, this.y, 2, this.y_size+2);
    }
    if (this.walls.w) {
      context.fillRect(this.x, this.y, 2, this.y_size+2);
    }

    if (!this.visited && this.revealed) {
      context.globalAlpha = 0.8;
      context.fillRect(this.x, this.y, this.x_size, this.y_size);
      context.globalAlpha = 1;
    }
  }

  update (creek) {
  }
}

class NewTile extends Tile {
  constructor (creek, x, y, size, wall) {
    super(creek, x, y, size);
    this.wall = wall;
  }

  draw (context, interpolation) {
    let tree = this.creek.get('resources').get_image('tree'),
      grass = this.creek.get('resources').get_image('grass');

    context.drawImage(grass.img, this.x, this.y, this.x_size, this.y_size);
    if (this.wall) {
      context.drawImage(tree.img, this.x, this.y, this.x_size, this.y_size);
    }
    if (!this.visited) {
      context.fillStyle = "black";
      if (this.revealed) {
        context.globalAlpha = 0.6;
      }
      context.fillRect(this.x, this.y, this.x_size, this.y_size);
      if (this.revealed) {
        context.globalAlpha = 1;
      }
    }
  }
}

export default Maze;
