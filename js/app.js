"use strict";

import Creek from './creek/creek.js';
import Square from './square.js';
import Maze from './maze.js';
import Player from './player.js';
import {Start, End} from './goals.js';
import NPCs from './npcs.js';

window.onload = () => {
  const creek = new Creek();
  const width = 32, height = 32, x_size = 24, y_size = 24;

  function get_palette(seed) {
    const palette_id = Square.get_palette_id(seed);
    const palette = Square.get_palette(palette_id);
    return palette;
  }

  document.getElementsByTagName('body')[0].setAttribute('style', 'background: grey');

  let next_map = function () {
    const data = creek.get('data');
    let seed = Math.random()*200 | 0,
      palette = get_palette(seed),
      level = (data.get('level') || 0) + 1,
      map_size_lookup = {
        1: 6, 2: 8, 3: 10, 4: 10, 5: 10, 6: 14, 7: 14, 8: 20, 9: 20, 10: 30, 11: 30, 12: 30,
      },
      tile_size_lookup = {
        1: 60, 2: 50, 3: 40, 4: 40, 5: 40, 6: 30, 7: 30, 8: 24, 9: 24, 10: 24, 11: 24, 12: 24
      },
      npc_count_lookup = {
        1: 2, 2: 4, 3: 6, 4: 8, 5: 12, 6: 16, 7: 16, 8: 24, 9: 24, 10: 24, 11: 32, 12: 32
      };

    console.log(`Seed: ${seed} and palette id: ${Square.get_palette_id(seed)}`);
    console.log(palette);

    let player = data.get('player') || new Player(creek, 1, 1, tile_size_lookup[level], tile_size_lookup[level], palette.slice(0, 1), palette.slice(1));

    let grid_backer = palette.pop(),
      list = [],
      start = new Start(1, 1, tile_size_lookup[level], tile_size_lookup[level], palette[1]),
      end = new End(map_size_lookup[level]-1, map_size_lookup[level]-1, tile_size_lookup[level], tile_size_lookup[level], palette[1]),
      maze = new Maze(`maze_${level}`, map_size_lookup[level], map_size_lookup[level], tile_size_lookup[level], tile_size_lookup[level], grid_backer),
      npcs = new NPCs(npc_count_lookup[level], map_size_lookup[level], map_size_lookup[level], tile_size_lookup[level], tile_size_lookup[level], palette.slice(1)),
      background = {
        width: map_size_lookup[level], height: map_size_lookup[level],
        x_size: tile_size_lookup[level], y_size: tile_size_lookup[level],
        color: grid_backer,
        draw: function (context, interpolation) {
          context.fillStyle = this.color,
          context.fillRect(this.x_size, this.y_size, (this.width-1)*this.x_size, (this.height-1)*this.y_size);
        },
        update: function (creek) {}
      }

    player.x_size = tile_size_lookup[level];
    player.y_size = tile_size_lookup[level];
    player.color = palette[0];

    list.push(background);
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
    data.set('player', player);
    data.set('npcs', npcs);
    data.set('grid', maze);
  };

  next_map();
  creek.get('data').set('next_map', next_map);

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

  class Sound {
    constructor(id, url, muted, volume, looping) {
      url = url || `resources/sounds/${id}.wav`;
      muted = muted || false;
      volume = volume || 0.6;
      looping = looping || false;

      this.id = id;
      this.url = url;
      this.muted = muted;
      this.volume = volume;
      this.looping = looping;
    }

    get() {
      return {
        "type": "sound",
        "url": this.url,
        "id": this.id,
        "muted": this.muted,
        "volume": this.volume,
        "looping": this.looping,
      };
    }
  }

  const resources = [
    new Sound("pickup").get(),
    new Sound("pickup_c").get(),
    new Sound("pickup_c_sharp").get(),
    new Sound("pickup_d").get(),
    new Sound("pickup_e_flat").get(),
    new Sound("pickup_e").get(),
    new Sound("pickup_f").get(),
    new Sound("pickup_f_sharp").get(),
    new Sound("pickup_g").get(),
    new Sound("pickup_g_sharp").get(),
    new Sound("pickup_a").get(),
    new Sound("pickup_b_flat").get(),
    new Sound("pickup_b").get(),
    new Sound("pickup_c_2").get(),
    new Sound("pickup_c_sharp_2").get(),
    new Sound("pickup_d_2").get(),
    new Sound("pickup_e_flat_2").get(),
    new Sound("pickup_e_2").get(),
    new Sound("pickup_f_2").get(),
    new Sound("pickup_success_c_2").get(),
    new Sound("pickup_success_f_2").get(),
    new Sound("level").get(),
    new Sound("bwuh_2").get(),
    new Sound("bwuh_low").get(),
    new Sound("cave_hopping", "resources/sounds/cave_hopping_longer.mp3", false, 0.6, true).get(),
    {
      "type": "image",
      "url": "resources/images/player.png",
      "id": "player",
      "source_x": 0,
      "source_y": 5,
      "source_width": 26,
      "source_height": 26,
      "width": 26,
      "height": 32,
    }
  ];

  creek.get('resources').init(creek, resources).then(() => {
    let div = document.createElement('div');
    div.innerHTML = "<div style='width: 20%; margin: 20% auto;'>Click to play!</div>";
    div.setAttribute('style', 'background: black; color: white; font-size: 3em; position: absolute; top: 0; left: 0; width: 100%; height: 100%;');
    div.id = "sound_guy";
    div.addEventListener('click', () => {
      creek.get('audio').play('cave_hopping');
      div.parentNode.removeChild(div);
    });
    document.body.appendChild(div);
    creek.init();
    creek.run();
  });
};
