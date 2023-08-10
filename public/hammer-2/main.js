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
    return 1;
  }
  constructor(game, { x, height } = {}) {
    this.game = game;
    this.originalHeight = 200;
    this.height = height;
    this.width = Nail.width;
    this.x = x;
    this.y = this.game.height - this.height;
    this.minHeight = 10;
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
  hit(amount) {
    // this is a simple way to make the game harder as it goes on
    // const newHeight =
    //   this.height - Math.ceil(amount * (this.height / this.originalHeight));
    const newHeight = this.height - amount;

    if (newHeight < this.minHeight) {
      return;
    }

    this.height = newHeight;
    this.y = this.game.height - this.height;

    return this.height;
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

    const numNails = this.width / Nail.width;
    let height = roundToNearest(10, rand(100, 150));
    Array.from({ length: numNails }).forEach((_, i) => {
      const prevNail = this.nails[i - 1];
      if (prevNail && i % 10 === 0) {
        height = roundToNearest(10, prevNail.height + randNeg() * rand(10, 15));
        if (height > 150 || height < 100) {
          height = 150;
        }
      }
      this.nails.push(new Nail(this, { x: i * Nail.width, height }));
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
        const minHeight = Math.min(...nailHeights);

        const amount = Math.ceil(this.hammer.weight * (maxHeight / 1000));
        const newMaxHeight = maxHeight - amount;
        nailsInRange.forEach((nail) => {
          if (nail.height === maxHeight) {
            nail.hit(amount);
          } else if (nail.height < maxHeight && nail.height > newMaxHeight) {
            nail.hit(nail.height - newMaxHeight);
          }
        });

        // const nailsInRangeAndMaxHeight = nailsInRange.filter(
        //   (nail) => nail.height >= maxHeight - this.hammer.weight
        // );
        // console.log(nailsInRangeAndMaxHeight);
        // const heightDiff = maxHeight - minHeight;
        // const hitAmount =
        //   this.hammer.weight > heightDiff && heightDiff > 0
        //     ? heightDiff
        //     : this.hammer.weight;
        // console.log(hitAmount);
        // nailsInRangeAndMaxHeight.forEach((nail) => nail.hit(hitAmount));

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
