import Camera from "./Camera.js";
import BittyBudGameObject from "./BittyBudGameObject.js";

const module = window.QUnit.module;
const test = window.QUnit.test;

module("Camera");

const STUB_GAME_1 = {
  cellsX: 8,
  cellsY: 8,
};

test("creating", (assert) => {
  const camera = Camera.create(STUB_GAME_1);
  assert.true(camera instanceof Camera, "is a Camera");
});

test("getting render state", (assert) => {
  const camera = Camera.create(STUB_GAME_1);
  const renderState = camera.getRenderState();
  assert.true(typeof renderState === "object", "is an object");
  assert.true("position" in renderState, "has position");
  assert.true("zoom" in renderState, "has zoom");
});

test("initial position in the middle", (assert) => {
  const tests = [
    { cellsX: 3, cellsY: 3, expected: [1, 1] }, // 0, 1, 2
    { cellsX: 8, cellsY: 8, expected: [4, 4] }, // 0, 1, 2, 3, 4, 5, 6, 7
    { cellsX: 9, cellsY: 9, expected: [4, 4] }, // 0, 1, 2, 3, 4, 5, 6, 7, 8
  ];

  tests.forEach((t) => {
    const camera = Camera.create(t);
    const renderState = camera.getRenderState();
    const [x, y] = renderState.position;
    assert.equal(x, t.expected[0], `x is ${t.expected[0]}`);
    assert.equal(y, t.expected[1], `y is ${t.expected[1]}`);
  });
});

test("zooming in", (assert) => {
  const camera = Camera.create(STUB_GAME_1);
  camera.zoom("IN");
  const renderState = camera.getRenderState();
  assert.equal(renderState.zoom, 2, "zoom is 2");
});

test("zooming out", (assert) => {
  const camera = Camera.create(STUB_GAME_1);
  camera.zoom("IN");
  camera.zoom("OUT");
  const renderState = camera.getRenderState();
  assert.equal(renderState.zoom, 1, "zoom is 1");
});

test("zoom in maxes out", (assert) => {
  const camera = Camera.create(STUB_GAME_1);
  camera.zoom("IN");
  camera.zoom("IN");
  camera.zoom("IN");
  camera.zoom("IN");
  camera.zoom("IN");
  const renderState = camera.getRenderState();
  assert.equal(renderState.zoom, 4, "zoom is 4");
});

test("zoom out min", (assert) => {
  const camera = Camera.create(STUB_GAME_1);
  camera.zoom("OUT");
  camera.zoom("OUT");
  camera.zoom("OUT");
  camera.zoom("OUT");
  camera.zoom("OUT");
  const renderState = camera.getRenderState();
  assert.equal(renderState.zoom, 1, "zoom is 1");
});

test("zooming in and out", (assert) => {
  const camera = Camera.create(STUB_GAME_1);
  camera.zoom("IN");
  camera.zoom("IN");
  camera.zoom("OUT");
  camera.zoom("OUT");
  camera.zoom("IN");
  camera.zoom("OUT");
  camera.zoom("IN");
  const renderState = camera.getRenderState();
  assert.equal(renderState.zoom, 2, "zoom is 2");
});

test("moving", (assert) => {
  const tests = [
    { directions: ["UP"], expected: [1, 0] },
    { directions: ["UP", "UP"], expected: [1, 0] },
    { directions: ["UP", "UP", "UP"], expected: [1, 0] },
    { directions: ["DOWN", "UP", "UP", "UP"], expected: [1, 0] },
    { directions: ["DOWN"], expected: [1, 2] },
    { directions: ["DOWN", "DOWN"], expected: [1, 3] },
    { directions: ["DOWN", "DOWN", "DOWN"], expected: [1, 3] },
    { directions: ["UP", "DOWN", "DOWN", "DOWN"], expected: [1, 3] },
    { directions: ["LEFT"], expected: [0, 1] },
    { directions: ["LEFT", "LEFT"], expected: [0, 1] },
    { directions: ["LEFT", "LEFT", "LEFT"], expected: [0, 1] },
    { directions: ["RIGHT", "LEFT", "LEFT", "LEFT"], expected: [0, 1] },
    { directions: ["RIGHT"], expected: [2, 1] },
    { directions: ["RIGHT", "RIGHT"], expected: [3, 1] },
    { directions: ["RIGHT", "RIGHT", "RIGHT"], expected: [3, 1] },
    { directions: ["LEFT", "RIGHT", "RIGHT", "RIGHT"], expected: [3, 1] },
  ];

  tests.forEach((t) => {
    const camera = Camera.create({
      cellsX: 3,
      cellsY: 3,
    });
    t.directions.forEach((direction) => camera.move(direction));
    const renderState = camera.getRenderState();

    const assertionName = t.directions.join(", ");
    assert.deepEqual(renderState.position, t.expected, `${assertionName}`);
  });
});

module("Bitty-Bud");

const STUB_GAME_2 = {
  zIndexSize: 10,
  removeGameObject: () => {},
  isCellBlocked: () => {},
};

test("getting random object ID", (assert) => {
  const b1 = new BittyBudGameObject(STUB_GAME_2, 0, 0);
  assert.ok(b1.gameObjectID, "random ID");

  const b2 = new BittyBudGameObject(STUB_GAME_2, 1, 1);
  assert.notEqual(b1.gameObjectID, b2.gameObjectID, "different IDs");
});

test("is blocking", (assert) => {
  const b1 = new BittyBudGameObject(STUB_GAME_2, 0, 0);
  assert.true(b1.isBlocking(), "is blocking");
});

test("is at position", (assert) => {
  const b1 = new BittyBudGameObject(STUB_GAME_2, 0, 0);
  assert.true(b1.isAt(0, 0), "is at position");
  assert.false(b1.isAt(1, 0), "is not at position");
});

test("initial render state", (assert) => {
  const bt = new BittyBudGameObject(STUB_GAME_2, 0, 0);
  const renderState = bt.getRenderState();
  assert.deepEqual(
    renderState,
    {
      position: [0, 0],
      moving: null,
      movingProgress: null,
      offsetY: -3,
      zIndex: 1,
      spriteID: "BITTY_BUD_FRONT",
    },
    "initial data"
  );
});

test("ignite", (assert) => {
  const bt = new BittyBudGameObject(STUB_GAME_2, 0, 0);
  bt.ignite();
  const renderState = bt.getRenderState();
  assert.equal(renderState.spriteID, "BITTY_BUD_HOTT_FRONT", "ignited");
});

test("animating", (assert) => {
  assert.expect(1);
  STUB_GAME_2.removeGameObject = () => {
    assert.ok(true, "removed");
  };
  const bt = new BittyBudGameObject(STUB_GAME_2, 0, 0);
  bt.ignite({ dieAfterFrames: 1 });
  bt.tick();
  bt.tick();
});
