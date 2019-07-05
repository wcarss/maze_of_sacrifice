"use strict";

class Utilities {
  constructor() {
    this.THROTTLE_KEY = "_util_throttles";
  }

  init(creek) {
    this.creek = creek;
    this.data = creek.get("data");
    this.time = creek.get("time");
    this.data.set(this.THROTTLE_KEY, {});
  }

  get_key(a, b) {
    return `${a}_${b}`;
  }

  random_int(n) {
    return parseInt(Math.floor(Math.random() * n));
  }

  random_choice(arr) {
    return arr[this.random_int(arr.length)];
  }

  get_throttle(id) {
    let data = this.creek.get("data"),
      throttles = null;

    if (!data) {
      return null;
    }

    throttles = this.data.get(this.THROTTLE_KEY);

    if (!throttles) {
      return null;
    }

    return throttles[id];
  }

  set_throttle(id, throttle) {
    let throttles = this.creek.get("data").get(this.THROTTLE_KEY);

    if (throttles[id]) {
      console.warn(`setting a throttle '${id}' that already exists`);
      debugger;
    }

    throttles[id] = throttle;
  }

  clear_throttle(id) {
    let throttles = this.creek.get("data").get(this.THROTTLE_KEY);

    if (throttles[id]) {
      delete throttles[id];
    }
  }

  setup_throttle(id, limit, func, args, timestamp) {
    let throttle = this.get_throttle(id);

    if (throttle) {
      console.warn(`tried to setup a throttle '${id}' that already exists.`);
      debugger;
    }

    throttle = {
      id: id,
      timestamp: timestamp || 0,
      limit: limit || 0,
      func: func || null,
      args: args || null,
      invoke_count: 0,
      run_count: 0
    };

    this.set_throttle(id, throttle);
  }

  use_throttle(id, func, args, limit, timestamp) {
    let throttle = this.get_throttle(id),
      return_value = null;

    if (!throttle) {
      console.warn(`tried to use a throttle '${id}' that does not exist`);
      debugger;
    }

    limit = limit || throttle.limit;
    timestamp = timestamp || throttle.timestamp;

    throttle.invoke_count += 1;
    if (this.time.ticks - timestamp >= limit) {
      func = func || throttle.func;
      args = args || throttle.args;

      if (func) {
        return_value = func(...args);
      } else {
        return_value = true;
      }

      throttle.timestamp = this.time.ticks;
      throttle.run_count += 1;
    }
    // for debugging: console.log(`runs: ${throttle.run_count}, time: ${this.time.ticks}, throttle timestamp: ${timestamp}, limit: ${limit}`);

    return return_value;
  }
}

export default Utilities;
