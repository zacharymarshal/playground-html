import { CELL_SIZE } from "./constants.js";

export default class Map {
  #size;
  #spriteSheet;
  #tiles;
  constructor(size, spriteSheet) {
    this.#size = size;
    this.#spriteSheet = spriteSheet;
  }
  render(el) {
    this.#tiles = [];
    for (let y = 0; y < this.#size; y++) {
      for (let x = 0; x < this.#size; x++) {
        let sprite;
        if (
          ([1, 2, 3, 4, 5, 6].includes(x) && [10, 11, 12, 13].includes(y)) ||
          ([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].includes(x) &&
            [14, 15, 16, 17].includes(y))
        ) {
          sprite = this.#spriteSheet.createSprite("WATER");
        } else {
          sprite = this.#spriteSheet.createSprite("GRASS");
        }
        this.#tiles.push(sprite);

        const o = document.createElement("div");
        o.style.position = "absolute";
        o.style.top = y * CELL_SIZE + "px";
        o.style.left = x * CELL_SIZE + "px";
        sprite.render(o);

        el.appendChild(o);
      }
    }
  }
  update({ delta }) {
    // for any state changes
    this.#tiles.forEach((tile) => {
      tile.update({ delta });
    });
  }
  draw() {
    this.#tiles.forEach((tile) => {
      tile.draw();
    });
  }
}
