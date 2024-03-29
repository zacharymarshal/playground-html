import GameRenderer from "./GameRenderer.js";
import Camera from "./Camera.js";
import TapGameObject from "./TapGameObject.js";
import BittyBudGameObject from "./BittyBudGameObject.js";
import BuildingGameObject from "./BuildingGameObject.js";
import { SPRITES } from "./constants.js";

export default class Game {
  #gameEl;
  #fps = 60;
  #camera;
  #cellSize = 8;
  #cellsX = 8;
  #cellsY = 8;
  #zIndexSize = 10;
  #gameObjects = [];

  #isAddingBuilding = false;

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

    const renderer = new GameRenderer(this.#gameEl, {
      cellSizePx: this.#cellSize,
      cols: this.#cellsX,
      rows: this.#cellsY,
    });
    await renderer.init(SPRITES);

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
        this.#gameObjects.forEach((g) => g.update(deltaTime));

        // Re-render the game every x frames per second
        await renderer.render(this.#getRenderState());
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

    if (this.#isAddingBuilding) {
      this.addGameObject("BUILDING", cellX, cellY);
      return;
    }

    // add a bitty bud if they click a random number of times
    const objectAtCell = this.getGameObjectAt(cellX, cellY);
    if (objectAtCell instanceof BuildingGameObject) {
      this.addGameObject("TAP", cellX, cellY, {
        ignite: true,
      });
      if (Math.random() > 0.5) {
        const safeCell = this.getClosestEmptyCell(cellX, cellY);
        if (safeCell) {
          this.addGameObject("BITTY_BUD", safeCell[0], safeCell[1], {
            ignite: Math.random() > 0.5,
          });
          this.addGameObject("TAP", safeCell[0], safeCell[1]);
        }
      }
    } else if (objectAtCell instanceof BittyBudGameObject) {
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

  setIsAddingBuilding(isAddingBuilding) {
    this.#isAddingBuilding = isAddingBuilding;
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
      if (options.ignite) gameObject.ignite();
    } else if (type === "BUILDING") {
      const blockedCells = [
        [cellX, cellY],
        [cellX + 1, cellY],
        [cellX, cellY + 1],
        [cellX + 1, cellY + 1],
      ];
      if (blockedCells.some(([x, y]) => this.isCellBlocked(x, y))) return;
      gameObject = new BuildingGameObject(this, cellX, cellY, options);
    }
    this.#gameObjects = [...this.#gameObjects, gameObject];
  }

  removeGameObject(gameObjectID, explodeAt = null) {
    if (explodeAt) {
      this.addGameObject("TAP", explodeAt[0], explodeAt[1]);
    }
    this.#gameObjects = this.#gameObjects.filter(
      (gameObject) => gameObject.gameObjectID !== gameObjectID
    );
  }

  findGameObject(gameObjectID) {
    return this.#gameObjects.find(
      (gameObject) => gameObject.gameObjectID === gameObjectID
    );
  }

  isCellBlocked(cellX, cellY) {
    if (!this.isValidCell(cellX, cellY)) return true;
    const objectAtCell = this.getGameObjectAt(cellX, cellY);
    if (objectAtCell?.isBlocking(cellX, cellY)) return true;
  }

  getClosestEmptyCell(cellX, cellY) {
    const cellsToCheck = [
      [cellX, cellY],
      [cellX + 1, cellY],
      [cellX - 1, cellY],
      [cellX, cellY + 1],
      [cellX, cellY - 1],
    ];

    const safeCell = cellsToCheck.find(([x, y]) => !this.isCellBlocked(x, y));
    if (safeCell) return safeCell;

    return null;
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
      gameObjects: this.#gameObjects.reduce((acc, gameObject) => {
        const newAcc = [...acc, ...gameObject.getRenderState()];
        return newAcc;
      }, []),
    };
  }
}
