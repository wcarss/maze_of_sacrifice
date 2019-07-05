"use strict";

import Audio from "./audio.js";
import Resources from "./resources.js";
import Utilities from "./utilities.js";

class Creek {
  constructor() {
    this.modules = {
      looper: new Looper(),
      updater: new Updater(),
      drawer: new Drawer(),
      time: new Time(),
      context: new Context(),
      data: new Data(),
      controls: new Controls(),
      entities: new Entities(),
      audio: new Audio(),
      resources: new Resources(),
      utilities: new Utilities()
    };
  }

  init(external_modules) {
    let module = null;

    for (const module_name in this.modules) {
      module = this.modules[module_name];
      if (module.init && !module.has_done_init) {
        module.init(this);
        module.has_done_init = true;
      }
    }

    for (const external_module_name in external_modules) {
      module = external_modules[external_module_name];
      if (module.init && !module.has_done_init) {
        module.init(this);
        module.has_done_init = true;
      }
    }

    console.log("creek init.");
  }

  get(id) {
    const got = this.modules[id];

    if (!got) {
      console.error(`requested nonexistent module '${id}'`);
    }

    return got;
  }

  run() {
    this.get("looper").loop(this);
  }
}

class Time {
  constructor() {
    this.ticks = 0;
  }
  set_ticks() {
    this.ticks = performance.now();
    return this.ticks;
  }
  get_ticks() {
    return this.ticks;
  }
}

class Controls {
  constructor() {
    (this.keys = {}),
      (this.mouse = {}),
      (this.events = {
        pointermove: event => this.set_coords(event.clientX, event.clientY),
        touchmove: event => {
          const touches = event.changedTouches;
          for (let i = 0; i < touches.length; i++) {
            if (touches[i] && touches[i].pageX && touches[i].pageY) {
              this.set_coords(touches[i].pageX, touches[i].pageY);
            }
          }
          return this.set(this.mouse, 1, true);
        },
        touchcancel: event => this.set(this.mouse, 1, false),
        pointercancel: event => this.set(this.mouse, event.which, false),
        keydown: event => this.set(this.keys, event.code, true),
        keyup: event => this.set(this.keys, event.code, false),
        pointerdown: event => {
          this.set_coords(event.clientX, event.clientY);
          return this.set(this.mouse, event.which, true);
        },
        touchstart: event => {
          this.set_coords(event.clientX, event.clientY);
          return this.set(this.mouse, 1, true);
        },
        pointerup: event => this.set(this.mouse, event.which, false),
        touchend: event => this.set(this.mouse, 1, false)
      });

    for (const event_name in this.events) {
      document.addEventListener(event_name, this.events[event_name]);
    }
  }

  init(creek) {
    this.creek = creek;
  }

  reset(value) {
    if (!value) {
      this.keys = {};
      this.mouse = {};
    } else {
      this.keys = value.keys;
      this.mouse = value.mouse;
    }
  }

  set(store, id, pressed) {
    store[id] = {
      pressed: pressed,
      time: this.creek.get("time").get_ticks()
    };

    if (navigator.maxTouchPoints !== 0) {
      return false;
    }
    return true;
  }

  set_coords(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
    return false;
  }

  get_key(id) {
    return {
      id: id,
      pressed: this.keys[id] ? this.keys[id].pressed : null,
      time: this.keys[id] ? this.keys[id].time : null
    };
  }

  get_mouse(id = 1) {
    return {
      id: id,
      pressed: this.mouse[id] ? this.mouse[id].pressed : null,
      time: this.mouse[id] ? this.mouse[id].time : null,
      x: this.mouse.x,
      y: this.mouse.y
    };
  }

  check_key(id) {
    return this.get_key(id).pressed;
  }

  check_mouse(id) {
    return this.get_mouse(id).pressed;
  }
}

class Updater {
  constructor() {
    this.list = null;
  }

  init(creek) {
    this.creek = creek;
    this.controls = creek.get("controls");
    this.data = creek.get("data");
    this.entities = creek.get("entities");
  }

  update() {
    this.list = this.entities.get();

    this.list.forEach(element => {
      if (
        this.controls.check_key("ShiftLeft") &&
        this.controls.check_key("Backquote")
      ) {
        debugger;
      }
      element.update(this.creek);
    });
  }
}

class Context {
  constructor() {}

  set_max_size() {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (navigator.maxTouchPoints !== 0) {
      canvas.height = window.innerHeight + 80;
      window.scrollTo(0, 1);
    }
    this.context = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
  }

  init(creek) {
    this.set_max_size();
    window.addEventListener("resize", event => this.set_max_size());
  }

  get() {
    return this.context;
  }

  get_width() {
    return this.width;
  }

  get_height() {
    return this.height;
  }
}

class Drawer {
  constructor() {
    this.list = null;
  }

  init(creek) {
    this.context = creek.get("context");
    this.data = creek.get("data");
    this.entities = creek.get("entities");
  }

  draw(interpolation) {
    const context = this.context.get();
    this.list = this.entities.get();

    //    context.clearRect(0, 0, this.context.get_width(), this.context.get_height());
    this.list.forEach(element => {
      element.draw(context, interpolation);
    });
  }
}

class Entities {
  constructor() {
    this.list = null;
  }

  init(creek) {
    this.data = creek.get("data");
  }

  get() {
    this.list = this.data.get("entity_list");
    return this.list;
  }
}

class Data {
  constructor() {
    this.data = {};
  }

  get(id) {
    return this.data[id];
  }

  set(id, val) {
    return (this.data[id] = val);
  }
}

class Looper {
  constructor() {}

  init(creek) {
    this.data = creek.get("data");
    this.time = creek.get("time");
    this.updater = creek.get("updater");
    this.drawer = creek.get("drawer");
  }

  loop(creek) {
    const max_frame_skip = 5,
      ticks_per_second = 25,
      skip_ticks = 1000 / ticks_per_second;

    let next_game_tick = this.time.get_ticks(),
      running = true,
      loops = 0,
      interpolation = 0;

    this.data.set("game_running", running);
    this.time.set_ticks();

    const inner_loop = () => {
      loops = 0;

      while (this.time.set_ticks() > next_game_tick && loops < max_frame_skip) {
        this.updater.update();
        next_game_tick += skip_ticks;
        loops += 1;
      }

      interpolation =
        (this.time.get_ticks() + skip_ticks - next_game_tick) / skip_ticks;
      this.drawer.draw(interpolation);

      if (this.data.get("game_running")) {
        requestAnimationFrame(inner_loop);
      } else {
        console.log("graceful shutdown complete.");
      }
    };

    requestAnimationFrame(inner_loop);
  }
}

export default Creek;
