import SpriteSheet from "./SpriteSheet.js";
import Sprite from "./Sprite.js";

export default class GameRenderer {
  #isInitialized = false;
  #el;
  #canvasEl;
  #cameraEl;
  #sprites;
  async render(
    el,
    { background, sprites, cellSize, cellWidth, cellHeight, camera }
  ) {
    await this.#init({ el, sprites, cellSize, cellWidth, cellHeight });

    this.#updateCamera({
      cellSize,
      cellWidth,
      cellHeight,
      position: camera.position,
      zoom: camera.zoom,
    });

    this.#renderBackground({
      sprites: background.sprites,
      cellSize,
      cellWidth,
      cellHeight,
      color: background.color,
    });
  }

  async #init({ el, sprites, cellSize, cellWidth, cellHeight }) {
    if (this.#isInitialized) {
      return;
    }

    this.#el = el;
    this.#sprites = await this.#loadSprites(sprites);

    this.#cameraEl = this.#createCameraElement();

    this.#canvasEl = this.#createCanvasElement({
      cellSize,
      cellWidth,
      cellHeight,
    });

    this.#cameraEl.appendChild(this.#canvasEl);

    this.#el.appendChild(this.#cameraEl);

    this.#isInitialized = true;
  }

  async #loadSprites(sprites) {
    // I liked having an object when defining the sprites to ensure there are no duplicate names,
    // but it is easier to work with an array of sprites here.
    sprites = Object.entries(sprites).map(([name, sprite]) => ({
      name,
      ...sprite,
    }));

    // Get a unique list of sprite sheets from our list of sprites I thought this was a nice way to
    // structure the data
    const spriteSheetPaths = new Set();
    sprites.forEach((sprite) => spriteSheetPaths.add(sprite.spriteSheet));

    // Create a map where the key is the path of the sprite sheet and the value is our SpriteSheet
    // object
    const spriteSheets = new Map();
    spriteSheetPaths.forEach((p) => spriteSheets.set(p, new SpriteSheet(p)));

    // Load all of the spritesheet images
    await Promise.all(
      [...spriteSheets.values()].map((spriteSheet) => spriteSheet.load())
    );

    // Create a map where the key is the name of the sprite and the value is our Sprite object
    const xsprites = new Map();
    sprites.forEach(({ name, spriteSheet, size, sheetX, sheetY }) => {
      const sprite = new Sprite({
        spriteSheetImg: spriteSheets.get(spriteSheet).img,
        size,
        sheetX,
        sheetY,
      });
      xsprites.set(name, sprite);
    });

    return xsprites;
  }

  #createCanvasElement({ cellSize, cellWidth, cellHeight }) {
    const canvas = document.createElement("canvas");
    canvas.width = cellSize * cellWidth;
    canvas.height = cellSize * cellHeight;

    return canvas;
  }

  #createCameraElement() {
    const camera = document.createElement("div");

    return camera;
  }

  #updateCamera({ position, zoom, cellSize, cellWidth, cellHeight }) {
    const [cellX, cellY] = position;

    const midCellX = Math.ceil(cellWidth / 2);
    const midCellY = Math.ceil(cellHeight / 2);

    let diffX;
    let diffY;
    let offsetX = (cellSize / 2) * zoom;
    let offsetY = (cellSize / 2) * zoom;

    if (cellX < midCellX) {
      diffX = (midCellX - cellX) * cellSize * zoom;
    } else if (cellX > midCellX) {
      diffX = (cellX - midCellX) * cellSize * zoom * -1;
    } else {
      diffX = 0;
    }

    if (cellY < midCellY) {
      diffY = (midCellY - cellY) * cellSize * zoom;
    } else if (cellY > midCellY) {
      diffY = (cellY - midCellY) * cellSize * zoom * -1;
    } else {
      diffY = 0;
    }

    const cameraX = diffX - offsetX;
    const cameraY = diffY - offsetY;

    this.#cameraEl.style.transform = `translate(${cameraX}px, ${cameraY}px) scale(${zoom})`;
  }

  #renderBackground({ sprites, cellSize, cellWidth, cellHeight, color }) {
    // Set the background color
    this.#el.style.backgroundColor = color;

    // Render the background tiles
    const ctx = this.#canvasEl.getContext("2d");
    for (let y = 0; y < cellHeight; y++) {
      for (let x = 0; x < cellWidth; x++) {
        const sprite = this.#sprites.get(sprites.MIDDLE);
        sprite.draw(ctx, x, y, cellSize);
      }
    }
  }
}
