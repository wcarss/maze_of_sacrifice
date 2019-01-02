"use strict";

import Creek from './creek/creek.js';
import Square from './square.js';
import Maze from './maze.js';
import Player from './player.js';
import {Start, End} from './goals.js';
import NPCs from './npcs.js';
import Enemies from './enemies.js';

window.onload = () => {
  const creek = new Creek();
  const width = 32, height = 32, x_size = 24, y_size = 24;

  function get_palette(seed) {
    const palette_id = Square.get_palette_id(seed);
    const palette = Square.get_palette(palette_id);
    return palette;
  }

  document.getElementsByTagName('body')[0].setAttribute('style', 'background: grey');

  let old_map_size_lookup = {
      1: 6, 2: 6, 3: 8, 4: 8, 5: 8, 6: 10, 7: 10, 8: 10, 9: 14, 10: 14, 11: 14, 12: 14,
    },
    old_tile_size_lookup = {
      1: 60, 2: 60, 3: 50, 4: 50, 5: 50, 6: 40, 7: 40, 8: 40, 9: 24, 10: 24, 11: 24, 12: 24
    },
    old_npc_count_lookup = {
      1: 2, 2: 2, 3: 2, 4: 4, 5: 6, 6: 4, 7: 6, 8: 6, 9: 8, 10: 8, 11: 16, 12: 16
    },
    map_size_lookup  =   [4,  6,  6,  6,  6,  8,  8,  8,  8, 10, 10, 10, 14],
    tile_size_lookup =   [60, 60, 60, 60, 60, 50, 50, 50, 50, 40, 40, 40, 24],
    npc_count_lookup =   [1,  2,  2,  2,  2,  4,  4,  4,  4,  4,  6,  6,  8],
    enemy_count_lookup = [0,  1,  1,  2,  2,  2,  4,  6,  6,  6,  8, 10, 12];


  let make_map = function (id, tile_size, map_size, npc_count, enemy_count) {
    let seed = Math.random()*200 | 0,
      palette = get_palette(seed);

    console.log(`Seed: ${seed} and palette id: ${Square.get_palette_id(seed)}`);
    console.log(palette);

    let grid_backer = palette.pop(),
      entity_list = [],
      start = new Start(creek, 2, 2, tile_size, tile_size, palette[1]),
      end = new End(creek, (map_size-1)*2, (map_size-1)*2, tile_size, tile_size, palette[1]),
      maze = new Maze(creek, `maze_${id}`, map_size, map_size, tile_size, tile_size, grid_backer),
      npcs = new NPCs(creek, npc_count, map_size, map_size, tile_size, tile_size, palette.slice(1), maze),
      enemies = new Enemies(creek, enemy_count, map_size, map_size, tile_size, tile_size, palette.slice(1), maze);

    Object.keys(maze.tiles).forEach(key => {
      entity_list.push(maze.tiles[key]);
    });

    maze.reveal(2, 2, 3);
    maze.visit(2, 2, 2);
    maze.reveal(1, 1, 0);

    entity_list.push(start);
    entity_list.push(end);
    entity_list.push(...npcs.get_npcs());
    entity_list.push(...enemies.get_enemies());

    return {
      'id': id,
      'entity_list': entity_list,
      'player': null,
      'npcs': npcs,
      'maze': maze,
      'enemies': enemies,
      'setup_player': function (player, player_x, player_y) {
        player.x = player_x || 2;
        player.y = player_y || 2;
        player.last_x = null;
        player.last_y = null;
        player.last_hdir = null;
        player.last_vdir = null;
        player.x_size = tile_size;
        player.y_size = tile_size;
        this.player = player;
        this.entity_list.push(player);
      }
    };
  },
  change_map = function(map_id, creek, player_x, player_y) {
     let data = creek.get('data'),
       time = creek.get('time'),
       map = data.get('maps')[map_id],
       player = data.get('player'),
       last_map_change = data.get('last_map_change');

     if (last_map_change && time.ticks - last_map_change < 500) {
       return;
     }

     if (!map) {
       console.log("map not found!");
       debugger;
     }

     map.setup_player(player, player_x, player_y);

     data.set('last_map_change', time.ticks);
     data.set('current_map', map.id);
     data.set('entity_list', map.entity_list);
     data.set('npcs', map.npcs);
     data.set('maze', map.maze);
     data.set('enemies', map.enemies);
     data.set('player', map.player);
  },
  make_map_id = function(id) {
    return `map_${id}`;
  };


  let num_of_maps = 12, maps = {}, map = null;
  for (let i = 0; i <= num_of_maps; i++) {
    map = make_map(make_map_id(i), tile_size_lookup[i], map_size_lookup[i], npc_count_lookup[i], enemy_count_lookup[i]);
    map.last_map_id = make_map_id(i-1);
    map.next_map_id = make_map_id(i+1);
    maps[map.id] = map;

    if (i === 0) {
      map.last_map_id = null;
    }

    if (i === num_of_maps) {
      map.next_map_id = make_map_id(0);
    }
  }

  let player = new Player(creek, 2, 2, 32, 32, null, null);
  creek.get('data').set('player', player);
  creek.get('data').set('maps', maps);
  creek.get('data').set('change_map', change_map);
  change_map(make_map_id(0), creek);

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

  class CreekImage {
    constructor(id, width, height, url, source_x, source_y, source_width, source_height) {
      this.id = id;
      this.width = width;
      this.height = height;
      this.url = url || `resources/images/${id}.png`;
      this.source_x = source_x || 0;
      this.source_y = source_y || 0;
      this.source_width = source_width || width;
      this.source_height = source_height || height;
    }

    get() {
      return {
        "type": "image",
        "url": this.url,
        "id": this.id,
        "source_x": this.source_x,
        "source_y": this.source_y,
        "source_width": this.source_width,
        "source_height": this.source_height,
        "width": this.width,
        "height": this.height,
      };
    }
  }

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
    new Sound("bwuh").get(),
    new Sound("bwuh_2").get(),
    new Sound("bwuh_low").get(),
    new Sound("slash").get(),
    new Sound("cave_hopping", "resources/sounds/cave_hopping_longer.mp3", false, 0.6, true).get(),
    new CreekImage("player", 32, 32).get(),
    new CreekImage("temple", 32, 32, "resources/images/tileset.png", 368, 192, 16, 16).get(),
    new CreekImage("coin", 32, 32, "resources/images/coin.png", 0, 0, 48, 48).get(),
    new CreekImage("reticle_black", 32, 32).get(),
    new CreekImage("reticle_red", 32, 32).get(),
    new CreekImage("reticle_green", 32, 32).get(),
    new CreekImage("grass", 32, 32, "resources/images/tileset.png", 303, 48, 16, 16).get(),
    new CreekImage("brush", 32, 32, "resources/images/tileset.png", 64, 159, 16, 16).get(),
    new CreekImage("dirt", 32, 32, "resources/images/tileset.png", 352, 48, 16, 16).get(),
    new CreekImage("mountains", 32, 32, "resources/images/tileset.png", 64, 224, 16, 16).get(),
    new CreekImage("pave_stone", 32, 32, "resources/images/tileset.png", 208, 80, 16, 16).get(),
    new CreekImage("purple_walk_1", 32, 32, "resources/images/tileset.png", 192, 0, 16, 16).get(),
    new CreekImage("purple_walk_2", 32, 32, "resources/images/tileset.png", 192, 16, 16, 16).get(),
    new CreekImage("purple_walk_3", 32, 32, "resources/images/tileset.png", 208, 0, 16, 16).get(),
    new CreekImage("purple_walk_4", 32, 32, "resources/images/tileset.png", 208, 16, 16, 16).get(),
    new CreekImage("sand", 32, 32, "resources/images/tileset.png", 160, 32, 16, 16).get(),
    new CreekImage("snow", 32, 32, "resources/images/tileset.png", 304, 96, 16, 16).get(),
    new CreekImage("tree", 32, 32, "resources/images/tileset.png", 304, 128, 16, 16).get(),
    new CreekImage("trees", 32, 32, "resources/images/tileset.png", 16, 224, 16, 16).get(),
    new CreekImage("water", 32, 32, "resources/images/tileset.png", 16, 64, 16, 16).get(),
    new CreekImage("barrell", 32, 32, "resources/images/tileset.png", 400, 144, 16, 16).get(),
    new CreekImage("bush", 32, 32, "resources/images/tileset.png", 288, 144, 16, 16).get(),
    new CreekImage("dead_tree", 32, 32, "resources/images/tileset.png", 320, 128, 16, 16).get(),
    new CreekImage("treasure", 32, 32, "resources/images/tileset.png", 448, 16, 16, 16).get(),
    new CreekImage("gravel", 32, 32, "resources/images/tileset.png", 192, 128, 16, 16).get(),
    new CreekImage("hill", 32, 32, "resources/images/tileset.png", 48, 192, 16, 16).get(),
    new CreekImage("shards", 32, 32, "resources/images/tileset.png", 432, 48, 16, 16).get(),
    new CreekImage("small_tree", 32, 32, "resources/images/tileset.png", 0, 192, 16, 16).get(),
    new CreekImage("stump", 32, 32, "resources/images/tileset.png", 336, 128, 16, 16).get(),
    new CreekImage("bones", 32, 32, "resources/images/tileset.png", 448, 48, 16, 16).get(),
    new CreekImage("skeleton", 32, 32, "resources/images/dragon_warrior_monsters.png", 24, 202, 24, 24).get(),
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
