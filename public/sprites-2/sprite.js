import { fpsLimiter } from "./utils.js";

class Sprite {
  constructor(options) {
    this.animations = options.animations;
    this.width = options.width;
    this.height = options.height;

    this.image = new Image();
    this.image.src = options.spritesheet;
    this.image.onload = () => {
      this.imageIsLoaded = true;
    };

    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("width", this.width);
    this.canvas.setAttribute("height", this.height);
    this.canvas.classList.add("character");

    this.ctx = this.canvas.getContext("2d");

    this.limitFps = fpsLimiter();
  }

  setAnimation(anim) {
    this.currentAnimation = anim;
    this.animationFrame = 0;
  }

  draw(deltaTime, fps) {
    if (!this.imageIsLoaded) {
      return;
    }

    if (!this.limitFps(fps, deltaTime)) {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    const frame = this.animations[this.currentAnimation][this.animationFrame];
    const [fx, fy] = frame;

    this.ctx.drawImage(
      this.image,
      fx * this.width,
      fy * this.height,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height
    );

    if (
      this.animationFrame ===
      this.animations[this.currentAnimation].length - 1
    ) {
      this.animationFrame = 0;
    } else {
      this.animationFrame += 1;
    }
  }
}

export { Sprite };
