import Sprite from "./Sprite.js";

export default class SpriteSheet {
  #img;
  #sprites = [];
  #spritess = [];
  constructor({ imgPath, sprites }) {
    this.#img = new Image();
    this.#img.src = imgPath;
    Object.entries(sprites).forEach(([name, sprite]) => {
      this.#sprites[name] = new Sprite(this.#img, sprite.frames[0]);
      this.#spritess[name] = sprite;
    });
  }
  async load() {
    return new Promise((resolve) => {
      this.#img.onload = () => {
        resolve();
      };
    });
  }
  getSprite(name) {
    const sprite = this.#sprites[name];
    if (!sprite) {
      throw new Error(`SpriteSheet: No sprite named ${name}`);
    }
    return sprite;
  }
  createSprite(name) {
    return new Sprite(
      this.#img,
      [0, 0],
      8,
      this.#spritess[name].frames,
      this.#spritess[name].frameRate
    );
  }
}
