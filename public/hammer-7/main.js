const loadSpriteSheets = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

class GameLoop {
  #onUpdate;
  #rafID;
  #fps;
  #isStopped = false;

  #frameTimer = 999;
  #lastTs = 0;

  constructor(onUpdate, fps = 60) {
    this.#onUpdate = onUpdate;
    this.#fps = fps;
  }

  start() {
    this.#isStopped = false;
    this.#rafID = requestAnimationFrame(this.#update.bind(this));
  }

  stop() {
    this.#isStopped = true;
    cancelAnimationFrame(this.#rafID);
  }

  #update(ts) {
    if (this.#isStopped) {
      return;
    }
    const delta = ts - this.#lastTs;
    this.#lastTs = ts;
    if (this.#frameTimer < 1000 / this.#fps) {
      this.#frameTimer += delta;
    } else {
      this.#frameTimer = 0;
      this.#onUpdate(delta);
    }

    this.#rafID = requestAnimationFrame(this.#update.bind(this));
  }
}

const machine = {
  state: "INIT",
  ext: {
    progress: 0,
    hammerX: 0,
    size: "M",
    directions: [],
  },
  states: {
    INIT: {
      onDone: ({ ext }) => {
        return {
          state: "LOADING",
          ext,
        };
      },
    },
    LOADING: {
      onIncreaseProgress: ({ ext }) => {
        return {
          state: "LOADING",
          ext: {
            ...ext,
            progress: ext.progress + 1,
          },
        };
      },
      onDone: ({ ext }) => ({
        state: "TITLE_SCREEN",
        ext,
      }),
    },
    TITLE_SCREEN: {
      onStart: ({ ext }) => ({
        state: "STARTING",
        ext,
      }),
    },
    STARTING: {
      onPlay: ({ ext }) => ({
        state: "IDLE",
        ext,
      }),
    },
    IDLE: {
      onChangeSize: ({ ext, event: { size } }) => ({
        state: "CHANGING_SIZE",
        ext: {
          ...ext,
          size,
        },
      }),
      onPause: ({ ext }) => ({
        state: "PAUSED",
        ext,
      }),
      onMove: ({ ext, event: { direction } }) => ({
        state: "MOVING",
        ext: {
          ...ext,
          directions: [direction],
        },
      }),
    },
    PAUSED: {
      onResume: ({ ext }) => ({
        state: "RESUMING",
        ext,
      }),
    },
    RESUMING: {
      onDone: ({ ext }) => ({
        state: "IDLE",
        ext,
      }),
    },
    CHANGING_SIZE: {
      onDone: ({ ext }) => ({
        state: "IDLE",
        ext,
      }),
    },
    MOVING: {
      onMove: ({ ext, event: { direction } }) => {
        const directions = [...ext.directions];
        if (!directions.includes(direction)) {
          directions.push(direction);
        }
        return {
          state: "MOVING",
          ext: {
            ...ext,
            directions,
          },
        };
      },
      onUpdatePosition: ({ state, ext, event: { hammerX } }) => ({
        state,
        ext: {
          ...ext,
          hammerX,
        },
      }),
      onDoneMoving: ({ ext, event: { direction } }) => {
        const directions = [...ext.directions];
        directions.splice(directions.indexOf(direction), 1);
        let newState = "IDLE";
        if (directions.length > 0) {
          newState = "MOVING";
        }
        return {
          state: newState,
          ext: {
            ...ext,
            directions,
          },
        };
      },
    },
  },
  dispatch(action, payload) {
    const eventName = `on${action[0].toUpperCase()}${action.slice(1)}`;
    if (!this.states[this.state][eventName]) {
      console.warn(`No event handler for ${eventName} in ${this.state}`);
      return;
    }
    const { state, ext } = this.states[this.state][eventName]({
      state: this.state,
      ext: this.ext,
      event: payload,
    });
    this.state = state;
    this.ext = ext;
    this.onTransition({
      state: this.state,
      ext: this.ext,
    });
  },
  start() {
    this.onTransition({
      state: this.state,
      ext: this.ext,
    });
  },
};

const elState = document.querySelector("#state");
const elTitle = document.querySelector("#title");
const elPlay = document.querySelector("#play");
const changeSizeEls = document.querySelectorAll("[data-size]");
const hammerEl = document.querySelector("#hammer");

const gameLoop = new GameLoop((delta) => {
  const {
    state,
    ext: { hammerX, directions },
  } = machine;

  // UPDATE
  if (state === "MOVING") {
    let updatedHammerX = hammerX;
    if (directions.includes("RIGHT")) {
      updatedHammerX += delta * 0.3;
    }
    if (directions.includes("LEFT")) {
      updatedHammerX -= delta * 0.3;
    }
    machine.dispatch("updatePosition", {
      hammerX: updatedHammerX,
    });
  }

  // RENDER ... cause lightster said
  // if (state === "MOVING") {
  //   hammerEl.style.transform = `translateX(${machine.ext.hammerX}px)`;
  // }
});

machine.onTransition = ({ state, ext }) => {
  elState.innerHTML = state;
  console.log(`Transition to ${state}...`);
  if (state === "INIT") {
    loadSpriteSheets().then(() => machine.dispatch("done"));
    machine.dispatch("done");
  } else if (state === "LOADING") {
    console.log(`${ext.progress}%`);
    setTimeout(() => {
      machine.dispatch("increaseProgress");
    }, 100);
  } else if (state === "TITLE_SCREEN") {
    elTitle.style.display = "block";
  } else if (state === "STARTING") {
    setTimeout(() => {
      elTitle.style.display = "none";
      elPlay.style.display = "block";
      gameLoop.start();
      machine.dispatch("play");
    }, 500);
  } else if (state === "IDLE") {
    // do nothing
  } else if (state === "CHANGING_SIZE") {
    changeSizeEls.forEach((el) => {
      el.classList.remove("active");
      if (el.dataset.size === ext.size) {
        el.classList.add("active");
      }
    });
    hammerEl.dataset.size = ext.size;
    console.log(`Changing size to ${ext.size}`);
    machine.dispatch("done");
  } else if (state === "PAUSED") {
    gameLoop.stop();
  } else if (state === "RESUMING") {
    gameLoop.start();
    machine.dispatch("done");
  } else if (state === "MOVING") {
    hammerEl.style.transform = `translateX(${ext.hammerX}px)`;
  }
};

machine.start();

document.addEventListener("keydown", (e) => {
  if (e.repeat) {
    return;
  }

  if (e.key === "ArrowRight") {
    machine.dispatch("move", { direction: "RIGHT" });
  } else if (e.key === "ArrowLeft") {
    machine.dispatch("move", { direction: "LEFT" });
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") {
    machine.dispatch("doneMoving", { direction: "RIGHT" });
  } else if (e.key === "ArrowLeft") {
    machine.dispatch("doneMoving", { direction: "LEFT" });
  }
});

window.game = {
  start() {
    machine.dispatch("start");
  },
  changeSize(size) {
    machine.dispatch("changeSize", { size });
  },
  pause() {
    machine.dispatch("pause");
  },
  resume() {
    machine.dispatch("resume");
  },
};
