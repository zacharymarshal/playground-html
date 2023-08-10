import { Sprite } from "./sprite.js";
import { warr as warrAnimations } from "./animations.js";

const warr2 = new Sprite({
  width: 256,
  height: 256,
  spritesheet: "/sprites-2/character-spritesheet-0.png",
  animations: warrAnimations,
});
warr2.setAnimation("idle");

const container = document.createElement("div");
container.classList.add("character-container");
container.append(warr2.canvas);
document.body.append(container);

let x = 0;
let y = 0;

let fps = 18;
let isShift = false;
let state;
window.addEventListener("keydown", (e) => {
  if (e.key === "Shift") {
    isShift = true;
  }

  if (e.code === "Space" && warr2.currentAnimation !== "jump") {
    e.preventDefault();
    fps = 24;
    warr2.setAnimation("jump");
    state = "jump";
  }

  if (
    e.code === "ArrowRight" &&
    !isShift &&
    warr2.currentAnimation !== "walk"
  ) {
    e.preventDefault();
    fps = 24;
    warr2.setAnimation("walk");
    state = "walk-right";
  }

  if (e.code === "ArrowRight" && isShift && warr2.currentAnimation !== "run") {
    e.preventDefault();
    fps = 60;
    warr2.setAnimation("run");
    state = "run-right";
  }

  console.log(e);
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
  }
  if (e.key === "Shift") {
    isShift = false;
  }
  fps = 18;
  warr2.setAnimation("idle");
  state = "idle";
});

let prevTs = 0;
function animate(ts) {
  const deltaTime = ts - prevTs;
  prevTs = ts;

  warr2.draw(deltaTime, fps);

  if (state === "walk-right") {
    x += 1;
    if (x > window.innerWidth) {
      x = -300;
    }
  } else if (state === "run-right") {
    x += 3;
    if (x > window.innerWidth) {
      x = -300;
    }
  } else if (state === "jump") {
    // oh godd.... to the moon
    y -= 1;
  }
  container.style.transform = `translate(${x}px, ${y}px)`;

  requestAnimationFrame(animate);
}
animate(0);
