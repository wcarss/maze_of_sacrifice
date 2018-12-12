class Resources {
  constructor () {
    this.creek = null;
    this.has_done_init = false;
    this.image_base_url = "";
    this.resources = {
      'image': {},
      'sound': {},
    };
  }

  async init (creek, parsed_resources) {
    console.log("ResourceManager init.");
    this.creek = creek;

//    let parsedresources = manager.get('config').get_resources(),
    let resource_promise = null,
      resource = null,
      promises = [],
      i = null;

    for (i in parsed_resources) {
      resource = parsed_resources[i];

      if (resource.type === 'image') {
        resource_promise = this.load_image(resource);
        promises.push(resource_promise);
      } else if (resource.type === 'sound') {
        resource_promise = this.load_sound(resource);
        promises.push(resource_promise);
      } else {
        console.log("tried to load unknown resource type: " + resource.type);
      }
    }

    await Promise.all(promises).then(loaded => {
      let resource = null,
        resource_index = null;

      this.has_done_init = true;

      for (resource_index in loaded) {
        resource = loaded[resource_index];
        this.resources[resource.type][resource.id] = resource;
      }
      console.log("resources after load are:");
      console.log(this.resources);
      this.post_resource_load();
    }, () => {
      console.log("trouble loading resources.");
    });
  }

  get_resources () {
    return this.resources;
  }

  get_image (name) {
    return this.resources['image'][name];
  }

  get_images () {
    return this.resources['image'];
  }

  get_sound (name) {
    return this.resources['sound'][name];
  }

  get_sounds () {
    return this.resources['sound'];
  }

  load_image (resource) {
    let img = new Image();
    let promise = new Promise(
      function(resolve, reject) {
        img.addEventListener("load", function () {
          console.log("image " + resource.url + " loaded.");
          let local_canvas = document.createElement("canvas");
          let local_context = null;

          let dest_x = resource.x || 0;
          let dest_y = resource.y || 0;
          let dest_width = resource.width || resource.source_width;
          let dest_height = resource.height || resource.source_height;

          local_canvas.width = dest_width;
          local_canvas.height = dest_height;
          local_context = local_canvas.getContext("2d");

          local_context.drawImage(
            img,
            resource.source_x, resource.source_y,
            resource.source_width, resource.source_height,
            dest_x, dest_y,
            dest_width, dest_height
          );

          resolve({
            "type": resource.type,
            "id": resource.id,
            "url": resource.url,
            "img": local_canvas,
            "original_source_x": resource.source_x,
            "original_source_y": resource.source_y,
            "original_source_width": resource.source_width,
            "original_source_height": resource.source_height,
            "source_x": dest_x,
            "source_y": dest_y,
            "source_width": dest_width,
            "source_height": dest_height,
          });

        }, false);
        img.addEventListener("error", function () {
          console.log("image " + resource.url + " failed to load.");
          reject();
        }, false);
      }
    );
    img.src = resource.url;
    return promise;
  }

  load_sound (resource) {
    let sound = document.createElement("audio");
    let promise = new Promise(
      function (resolve, reject) {
        sound.addEventListener("loadstart", function () {
          console.log("sound " + resource.url + " began loading.");
          resolve({
            type: resource.type,
            id: resource.id,
            url: resource.url,
            element: sound,
          });
        }, false);
        sound.addEventListener("error", function () {
          console.log("sound " + resource.url + " failed to load.");
          reject();
        }, false);
      }
    );
    sound.preload = "none";
    sound.loop = resource.looping;
    sound.muted = resource.muted;
    sound.volume = resource.volume;
    sound.src = resource.url;
    return promise;
  }

  add_image (image) {
    if (!image || !image.id || !image.img) {
      console.log("no image or image without id/img in add_image");
      console.log("image was:");
      console.log(image);
      return;
    }
    if (this.resources['image'][image.id]) {
      console.log("overwriting image " + image.id + " in add_image.");
    }
    this.resources['image'][image.id] = image;
  }

  post_resource_load () {
// not implemented in new-creeek yet
//    creek.get('game_state').post_resource_load(manager);
  }
}

export default Resources;
