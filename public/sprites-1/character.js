class Character {
  constructor() {
    this.width = 256;
    this.height = 256;

    this.canvas = document.querySelector("#character");
    this.ctx = this.canvas.getContext("2d");

    this.image = new Image();
    this.image.src = "/sprites-1/character-spritesheet-0.png";
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

  draw() {
    if (!this.imageIsLoaded) {
      return;
    }

    // Do the drawing!!
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

export { Character };
