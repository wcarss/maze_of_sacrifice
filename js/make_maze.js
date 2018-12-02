function make_maze (width, height, x_size, y_size, color) {
  function random_int(num) {
    return parseInt(Math.floor(Math.random()*num));
  }

  function next_index(num) {
    if (Math.random() > 0.25) {
      return num - 1;
    } else {
      return random_int(num);
    }
  }

  function get_key(x, y) {
    return `grid_${x}-${y}`;
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function visit(grid, x, y, n) {
    let tile = grid.tiles[grid.key(x, y)];
    if (!tile) debugger;
    tile.visited = true;

    if (n < 1) {
      return;
    }

    if (!tile.walls.n) {
      visit(grid, x, y-1, n-1);
    }
    if (!tile.walls.s) {
      visit(grid, x, y+1, n-1);
    }
    if (!tile.walls.e) {
      visit(grid, x+1, y, n-1);
    }
    if (!tile.walls.w) {
      visit(grid, x-1, y, n-1);
    }
  }

  function reveal(grid, x, y, n) {
    let tile = grid.tiles[grid.key(x, y)];
    if (!tile) debugger;
    tile.revealed = true;

    if (n < 1) {
      return;
    }

    if (!tile.walls.n) {
      reveal(grid, x, y-1, n-1);
    }
    if (!tile.walls.s) {
      reveal(grid, x, y+1, n-1);
    }
    if (!tile.walls.e) {
      reveal(grid, x+1, y, n-1);
    }
    if (!tile.walls.w) {
      reveal(grid, x-1, y, n-1);
    }
  }

  class Tile {
    constructor(x, y, x_size, y_size, color) {
      this.id = get_key(x, y);
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
    };

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
    };

    update (creek) {
    };
  };

  let grid = {
      tiles: {},
    },
    cells = [],
    directions = ['n', 's', 'e', 'w'],
    opposite = {
      'n': 's',
      's': 'n',
      'e': 'w',
      'w': 'e'
    },
    dx = {
      'n': 0,
      's': 0,
      'e': 1,
      'w': -1
    },
    dy = {
     'n': -1,
     's': 1,
     'e': 0,
     'w': 0
    },
    index = null,
    x = null,
    y = null,
    nx = null,
    ny = null,
    dir = null,
    dir_index = null,
    count = 0;
//    color_index = random_int(palette.length);

  x = random_int(width-1)+1;
  y = random_int(height-1)+1;
  grid.tiles[get_key(x, y)] = new Tile(x, y, x_size, y_size, color);//palette[color_index]);
  cells.push([x, y]);

  while (cells.length > 0) {
    count += 1;
    //if (count > 50) {
    //  break;
    //}
    index = next_index(cells.length);
    x = cells[index][0];
    y = cells[index][1];

    shuffle(directions);
    for (dir_index = 0; dir_index < directions.length; dir_index++) {
      dir = directions[dir_index];
      nx = x+dx[dir];
      ny = y+dy[dir];
      if (nx > 0 && ny > 0 && nx < width && ny < height && grid.tiles[get_key(nx, ny)] === undefined) { 
        grid.tiles[get_key(x, y)].walls[dir] = false;
        grid.tiles[get_key(nx, ny)] = new Tile(nx, ny, x_size, y_size, color);//palette[color_index]);
        grid.tiles[get_key(nx, ny)].walls[opposite[dir]] = false;
        cells.push([nx, ny]);
        index = null;
        break;
      }
    }

    if (index !== null) {
      cells.splice(index, 1);
//      color_index = (color_index + 1) % palette.length;
    }
  }

  grid.reveal = reveal;
  grid.visit = visit;
  grid.key = get_key;
  grid.width = width;
  grid.height = height;
  //grid.palette = palette;
  grid.x_size = x_size;
  grid.y_size = y_size;

  return grid;
}

export default make_maze;
