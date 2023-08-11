export default class BittyBudGameObject {
  #game;
  #cellX;
  #cellY;
  #gameObjectID;
  #isMoving = false;
  #movingDirection;
  #movingProgress = 0;
  #spriteID = "BITTY_BUD_FRONT";

  #isIgnited = false;
  #dieAfterFrames = 90;
  #frame = 1;

  #tickBetweenMovesInterval = 30;
  #ticksUntilNextMove;

  constructor(game, cellX, cellY) {
    this.#game = game;
    this.#cellX = cellX;
    this.#cellY = cellY;
    this.#gameObjectID = Math.random().toString(36).substring(7);

    this.#ticksUntilNextMove = this.#tickBetweenMovesInterval;
  }

  get gameObjectID() {
    return this.#gameObjectID;
  }

  isBlocking() {
    return true;
  }

  isAt(cellX, cellY) {
    return this.#cellX === cellX && this.#cellY === cellY;
  }

  ignite({ dieAfterFrames = 90 } = {}) {
    this.#isIgnited = true;
    this.#spriteID = "BITTY_BUD_HOTT_FRONT";
    this.#ticksUntilNextMove = 0;
    this.#dieAfterFrames = dieAfterFrames;
  }

  getRenderState() {
    return {
      position: [this.#cellX, this.#cellY],
      moving: this.#isMoving ? this.#movingDirection : null,
      movingProgress: this.#isMoving ? this.#movingProgress : null,
      zIndex: this.#cellY * this.#game.zIndexSize + 1,
      offsetY: -3,
      spriteID: this.#spriteID,
    };
  }

  tick() {
    if (this.#isIgnited) {
      if (this.#frame <= this.#dieAfterFrames) {
        this.#frame += 1;
      } else {
        this.#game.removeGameObject(this.gameObjectID);
      }
    }

    if (this.#isMoving) {
      this.#movingProgress += this.#isIgnited ? 0.3 : 0.2;
      if (this.#movingProgress >= 1) {
        // Done moving
        this.#movingProgress = 0;
        this.#isMoving = false;
        if (this.#movingDirection === "LEFT") {
          this.#cellX -= 1;
        } else if (this.#movingDirection === "RIGHT") {
          this.#cellX += 1;
        } else if (this.#movingDirection === "UP") {
          this.#cellY -= 1;
        } else if (this.#movingDirection === "DOWN") {
          this.#cellY += 1;
        }
      }
    } else {
      this.#tickAIMove();
    }
  }

  #tickAIMove() {
    if (this.#ticksUntilNextMove > 0) {
      this.#ticksUntilNextMove -= 1;
      return;
    }

    // get a random direction
    const directions = ["LEFT", "RIGHT", "UP", "DOWN"];
    const direction = directions[Math.floor(Math.random() * directions.length)];

    // simulate if moving that direction is out of bound / possible
    let cellX = this.#cellX;
    let cellY = this.#cellY;
    if (direction === "LEFT") {
      cellX -= 1;
    } else if (direction === "RIGHT") {
      cellX += 1;
    } else if (direction === "UP") {
      cellY -= 1;
    } else if (direction === "DOWN") {
      cellY += 1;
    }

    if (this.#game.isCellBlocked(cellX, cellY)) {
      return;
    }

    // Start moving, twice as fast if you on fire 🔥
    this.#ticksUntilNextMove = this.#isIgnited
      ? this.#tickBetweenMovesInterval / 3
      : this.#tickBetweenMovesInterval;
    this.#isMoving = true;
    this.#movingDirection = direction;
    this.#movingProgress = 0;
  }
}
