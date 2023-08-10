import { CELL_SIZE } from "./constants.js";

export default class Sprite {
  #img;
  #size;
  #sheetX;
  #sheetY;
  #frames;
  #el;
  #currentFrame;
  #deltaTime = 0.0;
  #lastFrame;
  #frameRate;
  constructor(img, [sheetX, sheetY], size = 8, frames = [], frameRate = 1) {
    this.#img = img;
    this.#size = size;
    this.#sheetX = sheetX;
    this.#sheetY = sheetY;
    this.#frames = frames;
    this.#frameRate = frameRate;
  }
  update({ delta }) {
    this.#deltaTime = this.#deltaTime + delta;

    if (this.#currentFrame === undefined) {
      this.#currentFrame = 0;
      this.#sheetX = this.#frames[this.#currentFrame][0];
      this.#sheetY = this.#frames[this.#currentFrame][1];
    }

    if (this.#deltaTime < this.#frameRate) {
      return;
    }

    this.#currentFrame = (this.#currentFrame + 1) % this.#frames.length;
    this.#sheetX = this.#frames[this.#currentFrame][0];
    this.#sheetY = this.#frames[this.#currentFrame][1];
    this.#deltaTime = 0;
  }
  draw() {
    if (this.#lastFrame === this.#currentFrame) {
      return;
    }
    const ctx = this.#el.getContext("2d");
    ctx.clearRect(0, 0, this.#size, this.#size);
    ctx.drawImage(
      this.#img,
      this.#sheetX * CELL_SIZE,
      this.#sheetY * CELL_SIZE,
      this.#size,
      this.#size,
      0,
      0,
      this.#size,
      this.#size
    );
    this.#lastFrame = this.#currentFrame;
  }
  render(el) {
    if (!this.#el) {
      this.#el = this.createElement();
      el.appendChild(this.#el);
    }
  }
  createElement() {
    const canvasEl = document.createElement("canvas");
    canvasEl.width = this.#size;
    canvasEl.height = this.#size;

    // const ctx = canvasEl.getContext("2d");
    // ctx.drawImage(
    //   this.#img,
    //   this.#sheetX * CELL_SIZE,
    //   this.#sheetY * CELL_SIZE,
    //   this.#size,
    //   this.#size,
    //   0,
    //   0,
    //   this.#size,
    //   this.#size
    // );

    return canvasEl;
  }
}
