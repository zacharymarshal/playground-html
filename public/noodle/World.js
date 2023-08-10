import { CELL_SIZE } from "./constants.js";
import Map from "./Map.js";

function gameLoop(cb) {
  let previousMs;
  const step = 1 / 60;
  const tick = (timestampMs) => {
    if (previousMs === undefined) {
      previousMs = timestampMs;
    }
    let delta = (timestampMs - previousMs) / 1000;
    while (delta >= step) {
      cb(delta);
      delta -= step;
    }
    previousMs = timestampMs - delta * 1000;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

export default class World {
  #gameboardEl;
  #gameObjects;
  #spriteSheets;
  constructor(gameboardEl, spriteSheets) {
    this.#gameboardEl = gameboardEl;
    this.#spriteSheets = spriteSheets;
    this.#gameObjects = [
      { x: 20, y: 20, spriteSheet: "BITTY", spriteName: "IDLE_DOWN" },
      { x: 15, y: 30, spriteSheet: "BITTY", spriteName: "SIT" },
      { x: 1, y: 0, spriteSheet: "BITTY_HOT", spriteName: "IDLE_DOWN" },
      { x: 1, y: 0, spriteSheet: "BITTY_HOT", spriteName: "IDLE_DOWN" },
      { x: 20, y: 10, spriteSheet: "BITTY_HOT", spriteName: "WALK_LEFT" },
      { x: 2, y: 0, spriteSheet: "MAP", spriteName: "GRASS" },
    ];
  }
  start() {
    // Backgound Layer
    const map = new Map(32, this.#spriteSheets["MAP"]);
    map.render(this.#gameboardEl);

    // Game Objects Layer
    const sprites = [];
    this.#gameObjects.forEach((gameObject) => {
      const gameObjectEl = document.createElement("div");
      gameObjectEl.style.position = "absolute";
      const x = gameObject.x * CELL_SIZE + "px";
      const y = gameObject.y * CELL_SIZE + "px";
      gameObjectEl.style.transform = `translate(${x}, ${y})`;
      const sprite = this.#spriteSheets[gameObject.spriteSheet].createSprite(
        gameObject.spriteName
      );
      sprite.render(gameObjectEl);
      sprites.push(sprite);
      this.#gameboardEl.appendChild(gameObjectEl);
    });

    gameLoop((delta) => {
      map.update({ delta });
      map.draw();

      sprites.forEach((s) => {
        s.update({ delta });
        s.draw();
      });
    });
  }
}
