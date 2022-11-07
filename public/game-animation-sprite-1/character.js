class Character {
  constructor() {
    this.frameTimer = 0;
    this.fps = 16;
    this.frameInterval = 1000 / this.fps;

    this.canvas = document.querySelector("#character");
    this.ctx = this.canvas.getContext("2d");

    this.image = new Image();
    this.image.src = "/game-animation-sprite-1/character-spritesheet-0.png";
    this.image.onload = () => {
      this.imageIsLoaded = true;
    };

    this.animations = {
      idle: [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
        [5, 1],
        [6, 1],
        [7, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      jump: [
        [3, 2],
        [4, 2],
        [5, 2],
        [6, 2],
        [7, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [5, 3],
        [6, 3],
        [7, 3],
      ],
      attack: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
        [6, 0],
        [7, 0],
      ],
      kneel: [
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [5, 4],
      ],
      run: [
        [6, 4],
        [7, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [5, 5],
        [6, 5],
        [7, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6],
        [5, 6],
      ],
      walk: [
        [6, 6],
        [7, 6],
        [0, 7],
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7],
        [7, 7],
        [0, 8],
        [1, 8],
        [2, 8],
        [3, 8],
        [4, 8],
        [5, 8],
      ],
    };
    this.currentAnimation = "idle";
    this.animationFrame = 0;
  }

  setAnimation(anim) {
    this.currentAnimation = anim;
    this.animationFrame = 0;
  }

  setFps(fps) {
    this.fps = fps;
    this.frameInterval = 1000 / this.fps;
  }

  update() {}

  draw(dt) {
    if (!this.imageIsLoaded) {
      return;
    }

    if (this.frameTimer > this.frameInterval) {
      // Do the drawing!!
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const frame = this.animations[this.currentAnimation][this.animationFrame];
      const [fx, fy] = frame;

      this.ctx.drawImage(
        this.image,
        fx * 256,
        fy * 256,
        256,
        256,
        0,
        0,
        256,
        256
      );

      if (
        this.animationFrame ===
        this.animations[this.currentAnimation].length - 1
      ) {
        this.animationFrame = 0;
      } else {
        this.animationFrame += 1;
      }

      // Keep to the right fps
      this.frameTimer = 0;
    } else {
      this.frameTimer += dt;
    }
  }
}

export { Character };
