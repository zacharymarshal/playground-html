class Hammer {
  constructor(game) {
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = 0;
    this.speed = 5;
  }
  draw(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  down(nail) {
    this.y = this.game.height - this.height - nail.height;
  }
  up() {
    this.y = 0;
  }
}

class Nail {
  constructor(game) {
    this.game = game;
    this.originalHeight = 200;
    this.width = 10;
    this.height = this.originalHeight;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.minHeight = 10;
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
  hit(hammer) {
    // this is a simple way to make the hammer do less the smaller the nail
    const newHeight =
      this.height - hammer.speed * (this.height / this.originalHeight);

    if (newHeight < this.minHeight) {
      return;
    }

    this.height = newHeight;
    this.y = this.game.height - this.height;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.hammer = new Hammer(this);
    this.nail = new Nail(this);

    window.addEventListener("keydown", (e) => {
      if (e.key === " " && e.repeat === false) {
        this.nail.hit(this.hammer);
        this.hammer.down(this.nail);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === " ") {
        this.hammer.up();
      }
    });
  }

  render(ctx) {
    this.hammer.draw(ctx);
    this.nail.draw(ctx);
  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 800;

const game = new Game(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.render(ctx);
  window.requestAnimationFrame(animate);
}
animate();
