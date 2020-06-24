"use strict";

import Maze from "./maze.js";
import Player from "./player.js";
import { Start, End } from "./goals.js";
import NPCs from "./npcs.js";
import Enemies from "./enemies.js";

class Maps {
  constructor(number_of_maps) {
    this.lookups = {
      map_size: [4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 14],
      tile_size: [60, 60, 60, 60, 60, 50, 50, 50, 50, 40, 40, 40, 24],
      npc_count: [1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 8],
      enemy_count: [0, 1, 1, 2, 2, 2, 4, 6, 6, 6, 8, 10, 12],
    };

    this.number_of_maps = number_of_maps;
    this.maps = {};
    this.current_map = null;
    this.current_map_id = null;
    this.next_map_id = null;
    this.last_map_id = null;
  }

  init = creek => {
    let map = null;

    this.creek = creek;

    for (let i = 0; i <= this.number_of_maps; i++) {
      map = this.make_map(
        this.make_id(i),
        this.lookups["tile_size"][i],
        this.lookups["map_size"][i],
        this.lookups["npc_count"][i],
        this.lookups["enemy_count"][i]
      );
      map.last_map_id = this.make_id(i - 1);
      map.next_map_id = this.make_id(i + 1);
      this.maps[map.id] = map;

      if (i === 0) {
        map.last_map_id = this.make_id(this.number_of_maps - 1);
      }

      if (i === this.number_of_maps - 1) {
        map.next_map_id = this.make_id(0);
      }
    }
  };

  make_map = (id, tile_size, map_size, npc_count, enemy_count) => {
    const creek = this.creek;
    const entity_list = [];
    const start = new Start(this.creek, 2, 2, tile_size);
    const end = new End(
      this.creek,
      (map_size - 1) * 2,
      (map_size - 1) * 2,
      tile_size
    );
    const maze = new Maze(this.creek, `maze_${id}`, map_size, map_size, tile_size);
    const npcs = new NPCs(
      this.creek,
      npc_count,
      map_size,
      map_size,
      tile_size,
      maze
    );
    const enemies = new Enemies(
      this.creek,
      enemy_count,
      map_size,
      map_size,
      tile_size,
      maze
    );

    Object.keys(maze.tiles).forEach((key) => {
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
      id,
      entity_list,
      player: null,
      npcs,
      maze,
      enemies,
      tile_size,
      width: map_size,
      height: map_size,
      pixel_width: map_size * tile_size * 2,
      pixel_height: map_size * tile_size * 2,
      // function is intentional here to use caller-scoped this
      setup_player: function (player, player_x, player_y) {
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
      },
    };
  };

  change_map = (map_id, player_x, player_y) => {
    const data = this.creek.data;
    const time = this.creek.time;
    const map = this.maps[map_id];
    const player = data.player;
    const last_map_change = this.last_map_change;

    if (last_map_change && time.ticks - last_map_change < 500) {
      return;
    }

    if (!map) {
      console.log("map not found!");
      debugger;
    }

    map.setup_player(player, player_x, player_y);
    console.log(`setting player.level from ${player.level} to ${map_id}`);
    player.level = map_id;

    this.last_map_change = time.ticks;
    this.current_map = this.maps[map_id];
    if (!this.current_map) debugger;
    this.current_map_id = map_id;
    this.next_map_id = this.current_map.next_map_id;
    this.last_map_id = this.current_map.last_map_id;

    console.log('camera x and y:', player.x, ',', player.y);
    console.log(player);
    console.log('alt x and y:', player_x, ',', player_y);
    this.creek.camera.center(player.x*player.x_size+player.x_size/2, player.y*player.y_size+player.y_size/2);

    data.entity_list = map.entity_list;
    data.npcs = map.npcs;
    data.maze = map.maze;
    data.enemies = map.enemies;
    data.player = map.player;
  };

  make_id = id => id;
}

export default Maps;
