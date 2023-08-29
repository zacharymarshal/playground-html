class Hammer {
  static sizes = {
    1: {
      width: 16,
      height: 16,
      weight: 4,
      speed: 4,
    },
    2: {
      width: 24,
      height: 24,
      weight: 16,
      speed: 3,
    },
    3: {
      width: 48,
      height: 48,
      weight: 48,
      speed: 2,
    },
  };
  constructor(game, size) {
    this.game = game;
    this.setSize(size);
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = 0;
    this.img = document.getElementById("img-hammer-down");
  }
  setSize(size) {
    const { width, height, weight, speed } = Hammer.sizes[size];
    this.height = height;
    this.weight = weight;
    this.speed = speed;

    const ogWidth = this.width;
    this.width = width;

    const ogSize = this.size;
    this.size = size;

    if (this.size > ogSize) {
      this.x = this.x - (this.width - ogWidth) * 0.5;
    } else if (this.size < ogSize) {
      this.x = this.x + (ogWidth - this.width) * 0.5;
    }
  }
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
  update() {
    let speed = this.speed;
    if (this.game.keys.includes("Shift")) {
      speed = 1;
    }

    if (this.game.keys.includes("ArrowLeft")) {
      this.x -= speed;
      this.up();
    }
    if (this.game.keys.includes("ArrowRight")) {
      this.x += speed;
      this.up();
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
    this.height = height;
    this.width = Nail.width;
    this.x = x;
    this.y = this.game.height - this.height;
    this.minHeight = 10;
  }
  draw(ctx) {
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, this.y + this.height);

    // Add three color stops
    gradient.addColorStop(0, "#db4324");
    gradient.addColorStop(0.6, "#db4324");
    gradient.addColorStop(0.9, "#f76808");
    gradient.addColorStop(1, "#f5d90a");

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
  hit(amount) {
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
    this.nails = [];

    // init hammers
    const defaultHammerEl = document.querySelector(
      ".js-hammer[data-hammer-size-is-default]"
    );
    defaultHammerEl.classList.add("hammer--is-active");
    this.hammer = new Hammer(this, defaultHammerEl.dataset.hammerSize);

    const hammers = document.querySelectorAll(".js-hammer");
    const handleChangeHammerSize = (e) => {
      const t = e.target;

      const hammerSize = t.dataset.hammerSize;
      this.hammer.setSize(hammerSize);
      t.classList.add("hammer--is-active");

      Array.from(hammers)
        .filter((h) => h !== t)
        .forEach((h) => h.classList.remove("hammer--is-active"));

      // get rid of focus so spacebar doesn't trigger button
      t.blur();
    };
    hammers.forEach((h) => h.addEventListener("click", handleChangeHammerSize));

    const numNails = this.width / Nail.width;
    let height = roundToNearest(5, rand(200, 250));
    Array.from({ length: numNails }).forEach((_, i) => {
      height += randNeg() * rand(1, 10);
      if (height > 250 || height < 200) {
        height = rand(200, 250);
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
  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;

const game = new Game(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.render(ctx);
  window.requestAnimationFrame(animate);
}
animate();
