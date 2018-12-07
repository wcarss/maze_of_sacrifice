"use strict";

import Creek from './creek/creek.js';
import Square from './square.js';
import Maze from './maze.js';
import Player from './player.js';
import {Start, End} from './goals.js';
import NPCs from './npcs.js';

window.onload = () => {
  const creek = new Creek();

  const seed = Math.random()*200 |0;
  const palette_id = Square.get_palette_id(seed);
  const palette = Square.get_palette(palette_id);
  const bg = palette.pop();

  console.log(`Seed: ${seed} and palette id: ${palette_id}`);
  console.log(palette);

  document.getElementsByTagName('body')[0].setAttribute('style', `background: ${bg}`);
  const width = 32, height = 32, x_size = 24, y_size = 24;
  const grid_backer = palette.pop();
  const grid = new Maze("the_maze", width, height, x_size, y_size, grid_backer);
  let grid_array = [];
  Object.keys(grid.tiles).forEach(key => {
    grid_array.push(grid.tiles[key]); 
  });
  grid.reveal(1, 1, 5);
  grid.visit(1, 1, 3);

  let player = new Player(creek, 1, 1, x_size, y_size, palette.slice(0,1), palette.slice(1)),
    start = new Start(1, 1, x_size, y_size, bg),
    end = new End(width-1, height-1, x_size, y_size, bg),
    npcs = new NPCs(10, width, height, x_size, y_size, palette.slice(1)),
    restart = function () {
      const data = creek.get('data');
      let list = [],
        level = data.get('level')+1,
        maze = new Maze(`maze_${level}`, width, height, x_size, y_size, grid_backer);
      Object.keys(maze.tiles).forEach(key => {
        list.push(maze.tiles[key]);
      });
      maze.reveal(1, 1, 5);
      maze.visit(1, 1, 3);
      list.push(start);
      list.push(end);
      list.push(player);
      list.push(...npcs.get_npcs());
      player.x = 1;
      player.y = 1;
      data.set('level', level);
      data.set('entity_list', list);
      data.set('grid', maze);
    };

  grid_array.push(start);
  grid_array.push(end);
  grid_array.push(player);
  grid_array.push(...npcs.get_npcs());

  creek.get('data').set('level', 0);
  creek.get('data').set('player', player);
  creek.get('data').set('grid', grid);
  creek.get('data').set('next_map', restart);
  creek.get('data').set('npcs', npcs);
  creek.get('data').set('entity_list', grid_array);

  // really good one: seed&palette 172

  /*  {
  	  id: 'square_1',
  	  x_size: 10,
  	  y_size: 10,
  	  x_speed: 3,
  	  y_speed: 3,
  	  x: 10,
  	  y: 10,
  	  color: "red",
  	  draw: function (context, interpolation) {
  	    context.fillStyle = this.color;
  	    context.fillRect(this.x, this.y, this.x_size, this.y_size);
  	  },
  	  update: function (creek) {
  	    this.x += this.x_speed;
  	    this.y += this.y_speed;
  	    if (this.x > creek.get('context').get_width()-this.x_size || this.x < 0) {
  	      this.x_speed *= -1;
  	    }
  	    if (this.y > creek.get('context').get_height()-this.y_size || this.y < 0) {
  	      this.y_speed *= -1
  	    }
  	  }
  	},
  	{
  	  id: 'square_2',
  	  x_size: 10,
  	  y_size: 10,
  	  x_speed: 5,
  	  y_speed: 2,
  	  x: 10,
  	  y: 10,
  	  color: "blue",
  	  draw: function (context, interpolation) {
  	    context.fillStyle = this.color;
  	    context.fillRect(this.x, this.y, this.x_size, this.y_size);
  	  },
  	  update: function (creek) {
  	    this.x += this.x_speed;
  	    this.y += this.y_speed;
  	    if (this.x > creek.get('context').get_width()-this.x_size  || this.x < 0) {
  	      this.x_speed *= -1;
  	    }
  	    if (this.y > creek.get('context').get_height()-this.y_size  || this.y < 0) {
  	      this.y_speed *= -1
  	    }
  	  }
  	}
  ])*/

  creek.init();
  creek.run();
};
