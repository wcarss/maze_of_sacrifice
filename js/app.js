"use strict";

import Creek from "./creek/creek.js";
import Player from "./player.js";
import Maps from "./maps.js";
import Resources from "./resources.js";

window.onload = () => {
  const creek = new Creek();

  document
    .getElementsByTagName("body")[0]
    .setAttribute("style", "background: grey");

  let player = new Player(),
    maps = new Maps(12);

  creek
    .get("resources")
    .init(creek, Resources, player, maps)
    .then(() => {
      let div = document.createElement("div");

      // require a click before playing any sounds, due to strict sound/interaction policies
      div.innerHTML =
        "<div style='width: 20%; margin: 20% auto;'>Click to play!</div>";
      div.setAttribute(
        "style",
        "background: black; color: white; font-size: 3em; position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
      );
      div.id = "sound_guy";
      div.addEventListener("click", () => {
        creek.get("audio").play("cave_hopping");
        div.parentNode.removeChild(div);
      });
      document.body.appendChild(div);

      creek.init([player, maps]);
      creek.run();
      creek.get("data").set("player", player);
      creek.get("data").set("maps", maps);
      maps.change_map(maps.make_id(0));
    });
};
