"use strict";

import Creek from "./creek/creek.js";
import Player from "./player.js";
import Maps from "./maps.js";
import Resources from "./resources.js";

window.onload = async () => {
  document.body.setAttribute("style", "background: black");

  const creek = new Creek();
  const player = new Player();
  const maps = new Maps(12);

  await creek.get("resources").init(creek, Resources, player, maps);

  creek.init([player, maps]);
  creek.run();
  creek.get("data").set("player", player);
  creek.get("data").set("maps", maps);
  maps.change_map(maps.make_id(0));
};
