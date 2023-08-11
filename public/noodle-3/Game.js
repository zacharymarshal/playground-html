import GameRenderer from "./GameRenderer.js";
import Camera from "./Camera.js";
import TapGameObject from "./TapGameObject.js";
import BittyBudGameObject from "./BittyBudGameObject.js";

export default class Game {
  #gameEl;
  #fps = 30;
  #camera;
  #cellSize = 8;
  #cellsX = 8;
  #cellsY = 8;
  #zIndexSize = 10;
  #gameObjects = [];

  constructor(gameEl) {
    this.#gameEl = gameEl;
  }

  get cellsX() {
    return this.#cellsX;
  }

  get cellsY() {
    return this.#cellsY;
  }

  get zIndexSize() {
    return this.#zIndexSize;
  }

  async start() {
    this.#camera = Camera.create(this);

    const renderer = new GameRenderer();

    let lastTime = 0;
    // Use 999 to force a render on the first frame
    let frameTimer = 999;
    const tick = async (t) => {
      const deltaTime = t - lastTime;
      lastTime = t;
      if (frameTimer < 1000 / this.#fps) {
        frameTimer += deltaTime;
      } else {
        // Update game objects
        this.#gameObjects.forEach((g) => g.tick());

        // Re-render the game every x frames per second
        await renderer.render(this.#gameEl, this.#getRenderState());
        frameTimer = 0;
      }

      requestAnimationFrame(tick);
    };

    // Start our game loop
    await tick(0);
  }

  zoomCamera(direction) {
    this.#camera.zoom(direction);
  }

  moveCamera(direction) {
    this.#camera.move(direction);
  }

  handleClick(x, y) {
    const cell = this.#getCellAt(x, y);
    if (!cell) return;
    const [cellX, cellY] = cell;

    // add a bitty bud if they click a random number of times
    const objectAtCell = this.getGameObjectAt(cellX, cellY);
    if (objectAtCell instanceof BittyBudGameObject) {
      this.addGameObject("TAP", cellX, cellY, {
        ignite: true,
      });
      objectAtCell.ignite();
    } else if (Math.random() > 0.8) {
      this.addGameObject("BITTY_BUD", cellX, cellY);
    } else {
      this.addGameObject("TAP", cellX, cellY);
    }
  }

  getGameObjectAt(cellX, cellY) {
    return this.#gameObjects.find((g) => g.isAt(cellX, cellY));
  }

  addGameObject(type, cellX, cellY, options = {}) {
    let gameObject;
    if (type === "TAP") {
      gameObject = new TapGameObject(this, cellX, cellY, options);
    } else if (type === "BITTY_BUD") {
      gameObject = new BittyBudGameObject(this, cellX, cellY, options);
    }
    this.#gameObjects = [...this.#gameObjects, gameObject];
  }

  removeGameObject(gameObjectID) {
    this.#gameObjects = this.#gameObjects.filter(
      (gameObject) => gameObject.gameObjectID !== gameObjectID
    );
  }

  addBittyBud(cellX, cellY) {
    this.#gameObjects.push({
      position: [cellX, cellY],
      moving: null,
      movingProgress: null,
      zIndex: cellY * this.#zIndexSize,
      offsetY: -3,
      spriteID: "BIDDYBUD_FRONT",
    });
  }

  isCellBlocked(cellX, cellY) {
    if (!this.isValidCell(cellX, cellY)) return true;
    const objectAtCell = this.getGameObjectAt(cellX, cellY);
    if (objectAtCell?.isBlocking()) return true;
  }

  isValidCell(cellX, cellY) {
    if (cellX < 0 || cellX >= this.#cellsX) return false;
    if (cellY < 0 || cellY >= this.#cellsY) return false;
    return true;
  }

  #getCellAt(x, y) {
    const cellX = Math.floor(x / this.#cellSize);
    const cellY = Math.floor(y / this.#cellSize);

    if (cellX <= 0 || cellX > this.#cellsX) return null;
    if (cellY <= 0 || cellY > this.#cellsY) return null;

    // Subtract one to exclude the borders
    return [cellX - 1, cellY - 1];
  }

  #getRenderState() {
    return {
      cellSize: this.#cellSize,
      cellWidth: this.#cellsX,
      cellHeight: this.#cellsY,
      sprites: {
        GRASS_1: {
          spriteSheet: "./images/map-sprite-sheet.png",
          size: 8,
          sheetX: 0,
          sheetY: 0,
        },
        WATER_1: {
          spriteSheet: "./images/map-sprite-sheet.png",
          size: 8,
          sheetX: 0,
          sheetY: 1,
        },
        WATER_2: {
          spriteSheet: "./images/map-sprite-sheet.png",
          size: 8,
          sheetX: 1,
          sheetY: 1,
        },
        ROCK_1: {
          spriteSheet: "./images/map-sprite-sheet.png",
          size: 8,
          sheetX: 0,
          sheetY: 2,
        },
        SMOKE_1: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 0,
          sheetY: 0,
        },
        SMOKE_2: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 1,
          sheetY: 0,
        },
        SMOKE_3: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 2,
          sheetY: 0,
        },
        SMOKE_4: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 3,
          sheetY: 0,
        },
        SMOKE_5: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 0,
          sheetY: 1,
        },
        SMOKE_6: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 1,
          sheetY: 1,
        },
        SMOKE_7: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 2,
          sheetY: 1,
        },
        SMOKE_8: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 3,
          sheetY: 1,
        },
        FIRE_1: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 0,
          sheetY: 2,
        },
        FIRE_2: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 1,
          sheetY: 2,
        },
        FIRE_3: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 2,
          sheetY: 2,
        },
        FIRE_4: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 3,
          sheetY: 2,
        },
        FIRE_5: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 0,
          sheetY: 3,
        },
        FIRE_6: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 1,
          sheetY: 3,
        },
        FIRE_7: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 2,
          sheetY: 3,
        },
        FIRE_8: {
          spriteSheet: "./images/smoke-and-fire-sprite-sheet.png",
          size: 16,
          sheetX: 3,
          sheetY: 3,
        },
        BITTY_BUD_FRONT: {
          spriteSheet: "./images/bitty-bud-sprite-sheet.png",
          size: 8,
          sheetX: 0,
          sheetY: 0,
        },
        BITTY_BUD_HOTT_FRONT: {
          spriteSheet: "./images/bitty-bud-hott-sprite-sheet.png",
          size: 8,
          sheetX: 0,
          sheetY: 0,
        },
      },
      background: {
        color: "#191c19",
        sprites: {
          TOP: "ROCK_1",
          RIGHT: "ROCK_1",
          LEFT: "ROCK_1",
          BOTTOM: "ROCK_1",
          MIDDLE: "GRASS_1",
        },
      },
      camera: this.#camera.getRenderState(),
      gameObjects: this.#gameObjects.map((g) => g.getRenderState()),
    };
  }
}
