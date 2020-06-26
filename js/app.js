"use strict";

import Creek from "./creek/creek.js";
import Player from "./player.js";
import Maps from "./maps.js";
import Resources from "./resources.js";

window.onload = async () => {
  document.body.setAttribute("style", "background: black");

  const creek = new Creek();
  const player = new Player();
  const maps = new Maps(13);

  await creek.resources.init(creek, Resources, player, maps);

  creek.init([player, maps]);
  creek.run();
  creek.data.player = player;
  creek.data.maps = maps;
  maps.change_map(maps.make_id(0));
};
