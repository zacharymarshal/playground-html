import World from "./World.js";
import SpriteSheet from "./SpriteSheet.js";

const BittyBudSpriteSheet = new SpriteSheet({
  imgPath: "./images/bittybud-sprite-sheet.png",
  sprites: {
    IDLE_DOWN: {
      frameRate: 3,
      frames: [
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
      ],
    },
    SIT: {
      frameRate: 1.5,
      frames: [
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
      ],
    },
  },
});
const BittyBudHotSpriteSheet = new SpriteSheet({
  imgPath: "./images/bittybud-hott-sprite-sheet.png",
  sprites: {
    IDLE_DOWN: {
      frameRate: 0.25,
      frames: [
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
      ],
    },
    WALK_LEFT: {
      frameRate: 0.25,
      frames: [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ],
    },
  },
});
const MapSpriteSheet = new SpriteSheet({
  imgPath: "./images/map-sprite-sheet.png",
  sprites: {
    GRASS: {
      frames: [[0, 0]],
    },
    WATER: {
      frameRate: 2,
      frames: [
        [0, 1],
        [1, 1],
      ],
    },
  },
});

const spriteSheets = {
  BITTY: BittyBudSpriteSheet,
  BITTY_HOT: BittyBudHotSpriteSheet,
  MAP: MapSpriteSheet,
};

Promise.all(
  Object.values(spriteSheets).map((spriteSheet) => spriteSheet.load())
).then(() => {
  const gameboard = document.querySelector("#gameboard");
  const world = new World(gameboard, spriteSheets);
  world.start();
});
