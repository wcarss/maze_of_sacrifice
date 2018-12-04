"use strict";

import Palettes from './palettes.js';

class Square  {
  static get_palette_id (seed) {
    return seed%Palettes.length;
  }

  static get_palette(id) {
    return Palettes[id];
  }

  constructor(id, seed, palette) {
    this.id = `square_${id}`,
    this.seed = seed;

    this.x_size = Math.random()*8+2;
    this.y_size = Math.random()*8+2;
    this.x_speed = this.get_speed(id);
    this.y_speed = this.x_speed;//this.get_speed((id-10000)%10000);
    if (seed > 150) {
      this.x_speed *= -1;
    }
    if (seed > 100) {
      this.y_speed *= -1;
    }
    if (seed < 50) {
      this.x_speed *= -0.5;
    }
    if (seed < 25) {
      this.y_speed *= -0.5;
    }

    this.x = Math.random()*document.getElementById('canvas').width;
    this.y = Math.random()*document.getElementById('canvas').height;
    this.palette = palette // Square.get_palette(Square.get_palette_id(seed));
    this.color = this.get_color();
  }

  get_speed(id) {
    let variation = 0.001;
    const roll = Math.random();
    if (roll > 0.999) {
      variation += Math.random()/1000;
    } else if (roll > 0.95) {
      variation += Math.random()*0.001;
    } else if (roll > 0.7) {
      variation -= Math.random()*0.0005;      
    } else {
      if (Math.random() >= 0.5) {
        variation += Math.random()*0.008;
      } else {
        variation -= Math.random()*0.008;
      }
    }
    return id * (variation * (this.seed * 0.001)) + 2;
  }

  get_color() {
    return this.palette[Math.random()*this.palette.length |0 ];
    //return "black";
    const r = parseInt(Math.round(Math.random() * 255))+0,
      g = parseInt(Math.round(Math.random() * 255))+0, 
      b = parseInt(Math.round(Math.random() * 255))+0;

    return `rgba(${r}, ${g}, ${b}, 1)`;
  }

  draw (context, interpolation) {
    //if (Math.random() > 0.95) {
    //  this.color = this.get_color();
    //}
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.x_size, this.y_size);
  }

  update (creek) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    if (this.x > creek.get('context').get_width()-this.x_size || this.x < 0) {
      this.x_speed *= -1;
    }
    if (this.y > creek.get('context').get_height()-this.y_size || this.y < 0) {
      this.y_speed *= -1
    }
  }
}

export default Square;
