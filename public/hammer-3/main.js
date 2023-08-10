class Hammer {
  constructor(game) {
    this.game = game;
    this.width = 25;
    this.height = 25;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = 0;
    this.speed = 5;
    this.weight = 20;
  }
  draw(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    if (this.game.keys.includes("ArrowLeft")) {
      this.x -= this.speed;
    }
    if (this.game.keys.includes("ArrowRight")) {
      this.x += this.speed;
    }

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x > this.game.width - this.width) {
      this.x = this.game.width - this.width;
    }
  }
  down(nails) {
    const nailsInRange = nails.filter((nail) => nail.inRange(this));
    const maxHeight = Math.max(...nailsInRange.map((nail) => nail.height));
    this.y = this.game.height - this.height - maxHeight;
  }
  up() {
    this.y = 0;
  }
}

class Nail {
  static get width() {
    return 2;
  }
  constructor(game, { angle, height } = {}) {
    this.game = game;
    this.originalHeight = 200;
    this.height = height;
    this.width = Nail.width;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height * 0.5 - this.height * 0.5;
    this.minHeight = 10;
    this.angle = angle;

    console.log({
      x: this.x,
      y: this.y,
      angle: this.angle,
      height: this.height,
    });
    console.log(this.height * -0.5 - this.height);
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "gold";
    ctx.translate(this.x + this.width * 0.5, this.y + this.height * 0.5);
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.fillRect(this.width * -0.5, 0, this.width, this.height);
    ctx.restore();
  }
  hit(amount) {
    const newHeight = this.height - amount;

    if (newHeight < this.minHeight) {
      return;
    }

    this.height = newHeight;
    // this.y = this.game.height - this.height;
  }
  inRange(hammer) {
    return hammer.x < this.x + this.width && hammer.x + hammer.width > this.x;
  }
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randNeg() {
  return Math.random() < 0.5 ? -1 : 1;
}
function roundToNearest(nearest, num) {
  return Math.ceil(num / nearest) * nearest;
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.hammer = new Hammer(this);
    this.nails = [];

    const numNails = 360;
    let height = roundToNearest(10, rand(100, 150));
    Array.from({ length: numNails }).forEach((_, i) => {
      const prevNail = this.nails[i - 1];
      if (prevNail && i % 10 === 0) {
        height = roundToNearest(10, prevNail.height + randNeg() * rand(10, 15));
        if (height > 150 || height < 100) {
          height = 150;
        }
      }
      this.nails.push(new Nail(this, { angle: i, height }));
    });

    this.keys = [];

    window.addEventListener("keydown", (e) => {
      // track key
      if (!this.keys.includes(e.key)) {
        this.keys.push(e.key);
      }

      if (e.key === " " && e.repeat === false) {
        const nailsInRange = this.nails.filter((nail) =>
          nail.inRange(this.hammer)
        );
        const nailHeights = nailsInRange.map((nail) => nail.height);

        const maxHeight = Math.max(...nailHeights);

        const amount = Math.ceil(this.hammer.weight * (maxHeight / 1000));
        const newMaxHeight = maxHeight - amount;
        nailsInRange.forEach((nail) => {
          if (nail.height === maxHeight) {
            nail.hit(amount);
          } else if (nail.height < maxHeight && nail.height > newMaxHeight) {
            nail.hit(nail.height - newMaxHeight);
          }
        });

        this.hammer.down(this.nails);
      }
    });
    window.addEventListener("keyup", (e) => {
      // remove tracked key
      if (this.keys.includes(e.key)) {
        this.keys.splice(this.keys.indexOf(e.key), 1);
      }

      if (e.key === " ") {
        this.hammer.up();
      }
    });
  }

  render(ctx) {
    this.hammer.draw(ctx);
    this.hammer.update();
    this.nails.forEach((nail) => nail.draw(ctx));

    ctx.save();
    ctx.fillStyle = "green";
    const w = 10;
    const x = this.width * 0.5 - w * 0.5;
    const h = 10;
    const y = this.height * 0.5 - h * 0.5;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 800;

const game = new Game(canvas);

function animate() {
  console.log("woooo");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.render(ctx);
  window.requestAnimationFrame(animate);
}
animate();
