"use strict";

class Camera {
  init = creek => {
    console.log("CameraManager init.");
    this.creek = creek;
    this.utils = creek.utilities;
    this.data = creek.data;

    this.camera_config = {
      x: 0,
      y: 0,
      //width: 1344,
      //height: 768,
      width: 300,
      height: 300,
      left_margin: 120,
      right_margin: 120,
      top_margin: 120,
      bottom_margin: 120,
    };
    this.width = this.camera_config.width;
    this.height = this.camera_config.height;

    this.fullscreen = this.camera_config.fullscreen || false;
    this.context_manager = this.creek.context_manager;

    if (this.fullscreen) {
      this.width = this.context_manager.width;
      this.height = this.context_manager.height;
    }

    this.camera = {
      inner_x: this.camera_config.x-this.width/4,
      inner_y: this.camera_config.y-this.height/4,
      inner_width: this.width / 2,
      inner_height: this.height / 2,
      x: this.camera_config.x,
      y: this.camera_config.y,
      width: this.width,
      height: this.height,
      x_size: this.width,
      y_size: this.height,
      top_margin: this.camera_config.top_margin,
      bottom_margin: this.camera_config.bottom_margin,
      left_margin: this.camera_config.left_margin,
      right_margin: this.camera_config.right_margin,
    };
  };

  get offset () {
    return {
      x: this.camera.x,
      y: this.camera.y,
    };
  };

  get rect () {
    return {
      x: this.camera.x - this.camera.left_margin,
      y: this.camera.y - this.camera.top_margin,
      x_size: this.camera.width + this.camera.left_margin + this.camera.right_margin,
      y_size: this.camera.height + this.camera.top_margin + this.camera.bottom_margin,
    };
  }

  draw = (context, interpolation) => {
    const r = this.rect;
    //context.strokeStyle = "blue";
    //context.strokeRect(r.x, r.y, r.x_size, r.y_size);
  };

  center = (center_x, center_y) => {
    let camera = this.camera;
    let new_camera_x = camera.x;
    let new_camera_y = camera.y;

    if (center_x > camera.inner_x + camera.inner_width) {
      new_camera_x += (center_x - (camera.inner_x + camera.inner_width));
    } else if (center_x < camera.inner_x) {
      new_camera_x += (center_x - camera.inner_x);
    }

    if (center_y > camera.inner_y + camera.inner_height) {
      new_camera_y += (center_y - (camera.inner_y + camera.inner_height));
    } else if (center_y < camera.inner_y) {
      new_camera_y += (center_y - camera.inner_y);
    }

    this.move(new_camera_x, new_camera_y);
  };

  move = (x, y) => {
    const camera = this.camera;
    const context_manager = this.context_manager;
    if (this.fullscreen && camera.width !== context_manager.width) {
      this.resize(context_manager.width, context_manager.height);
    }

    // todo: handle bounds
    //const bounds = creek.data.maps.get_bounds();
    const map = this.data.maps.current_map || {pixel_width: camera.width, pixel_height: camera.height};
    x = this.utils.clamp(x, 0, map.pixel_width - camera.width);
    y = this.utils.clamp(y, 0, map.pixel_height - camera.height);

    camera.x = x;
    camera.y = y;
    camera.inner_x = camera.x + camera.width / 4;
    camera.inner_y = camera.y + camera.height / 4;
  };

  resize = (width, height) => {
    const camera = this.camera;
    camera.width = width;
    camera.height = height;
    camera.x_size = width;
    camera.y_size = height;
    camera.inner_width = width / 2;
    camera.inner_height = height / 2;
  };
}

export default Camera;