const loadingReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FRAME_COUNT":
      return {
        ...state,
        loadingFrame: state.loadingFrame + 1,
      };
    case "FETCH_SPRITESHEETS":
      return {
        ...state,
        loadingStatus: "LOADING",
        loadingProgress: 0.1,
      };
    case "INCREASE_PROGRESS":
      return {
        ...state,
        loadingProgress: state.loadingProgress + action.payload.amount,
        loadingFrame: 0,
      };
    case "FETCH_SPRITESHEETS_SUCCESS":
      return {
        ...state,
        gameStatus: "TITLE",
        loadingStatus: "SUCCESS",
        loadingProgress: 1,
      };
  }
};

const titleReducer = (state, action) => {
  switch (action.type) {
    case "PLAY_GAME":
      return {
        ...state,
        gameMode: action.payload.gameMode,
        gameStatus: "LOBBY",
      };
    default:
      return state;
  }
};

const randomColor = (excludeColors = []) => {
  const colors = ["red", "blue", "green", "purple", "orange"];
  const availableColors = colors.filter(
    (color) => !excludeColors.includes(color)
  );
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
};

const lobbyReducer = (state, action) => {
  if (action.type === "RENDERED") {
    return {
      ...state,
      shouldRender: false,
    };
  } else if (action.type === "START_GAME") {
    return {
      ...state,
      gameStatus: "PLAY",
    };
  } else if (action.type === "ADD_PLAYER") {
    if (state.players.length >= state.maxPlayers) {
      return state;
    }
    const { isBot } = action.payload;

    let isReady = false;
    // Ready player one
    if (state.players.length === 0 || isBot) {
      isReady = true;
    }
    const color = randomColor(state.players.map((p) => p.color));
    return {
      ...state,
      shouldRender: true,
      players: [
        ...state.players,
        {
          name: `PLAYER ${state.players.length + 1}`,
          color,
          isBot,
          isReady,
        },
      ],
    };
  }
};

const playReducer = (state, action) => {
  if (action.type === "LEAVE_GAME") {
    return {
      ...state,
      gameStatus: "TITLE",
      players: [],
      shouldRender: true,
    };
  }

  return state;
};

const gameReducer = (state, action) => {
  switch (state.gameStatus) {
    case "LOADING":
      return loadingReducer(state, action);
    case "TITLE":
      return titleReducer(state, action);
    case "LOBBY":
      return lobbyReducer(state, action);
    case "PLAY":
      return playReducer(state, action);
  }
};

const MAX_PLAYERS = 4;

const initialState = {
  gameStatus: "LOADING", // "loading/title/lobby/play",
  gameMode: null,
  maxPlayers: MAX_PLAYERS,
  players: [],
  loadingState: "IDLE",
  loadingProgress: 0,
  loadingFrame: 0,
  shouldRender: true,
};

class GameStore {
  #state;
  #reducer;
  constructor(initialState, reducer) {
    this.#state = initialState;
    this.#reducer = reducer;
  }
  dispatch({ type, payload } = {}) {
    console.log({ type, payload });
    if (payload === undefined) {
      payload = {};
    }
    this.#state = this.#reducer(this.#state, { type, payload });
  }
  get(key) {
    return this.#state?.[key];
  }
}

class GameStatusLoading {
  #store;
  #loadingEl;
  #loadingProgressEl;
  constructor(store) {
    this.#store = store;
  }
  mount() {
    this.#loadSpritesheets();
    this.#loadingEl = document.querySelector("#loading");
    this.#loadingProgressEl = document.querySelector("#loading-progress");
    return () => {
      this.#loadingEl.style.display = "none";
    };
  }
  update() {
    this.#store.dispatch({ type: "UPDATE_FRAME_COUNT" });

    if (
      this.#store.get("loadingStatus") === "LOADING" &&
      this.#store.get("loadingFrame") >= 10
    ) {
      this.#store.dispatch({
        type: "INCREASE_PROGRESS",
        payload: { amount: 0.1 },
      });
    }
  }
  render() {
    if (this.#store.get("loadingStatus") === "LOADING") {
      this.#loadingEl.style.display = "block";
      this.#loadingProgressEl.style.width = `${
        this.#store.get("loadingProgress") * 100
      }%`;
      return;
    }
  }

  async #loadSpritesheets() {
    if (this.#store.get("loadingState") !== "IDLE") {
      return;
    }

    this.#store.dispatch({ type: "FETCH_SPRITESHEETS" });
    // load spritesheets
    let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(1000);
    this.#store.dispatch({ type: "FETCH_SPRITESHEETS_SUCCESS" });
  }
}

class GameStatusTitle {
  #store;
  #titleScreenEl;
  constructor(store) {
    this.#store = store;
    this.handlePlayGame = this.handlePlayGame.bind(this);
  }
  mount() {
    this.#titleScreenEl = document.querySelector("#title-screen");

    const playGameButtons = document.querySelectorAll("[data-play]");
    playGameButtons.forEach((btn) => {
      btn.addEventListener("click", this.handlePlayGame);
    });

    return () => {
      this.#titleScreenEl.style.display = "none";
      playGameButtons.forEach((btn) => {
        btn.removeEventListener("click", this.handlePlayGame);
      });
    };
  }
  update() {
    // update title screen
  }
  render() {
    this.#titleScreenEl.style.display = "block";
  }

  handlePlayGame(e) {
    const gameMode = e.target.dataset.playGameMode;
    this.#store.dispatch({ type: "PLAY_GAME", payload: { gameMode } });
  }
}

class GameStatusLobby {
  #store;
  #el;
  #gameModeEl;
  #playerListEl;
  #startBtnEl;
  constructor(store) {
    this.#store = store;
    this.handleAddAi = this.handleAddAi.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
  }
  mount() {
    this.#el = document.querySelector("#lobby");
    this.#gameModeEl = document.querySelector("#lobby-game-mode");

    const addAiButton = document.querySelector("#lobby-add-ai");
    addAiButton.addEventListener("click", this.handleAddAi);

    this.#playerListEl = document.querySelector("#lobby-player-list");

    this.#startBtnEl = document.querySelector("#lobby-start");
    this.#startBtnEl.addEventListener("click", this.handleStartGame);

    return () => {
      this.#el.style.display = "none";
      addAiButton.removeEventListener("click", this.handleAddAi);
      this.#startBtnEl.removeEventListener("click", this.handleStartGame);
    };
  }
  update() {
    if (this.#store.get("players").length === 0) {
      this.#store.dispatch({ type: "ADD_PLAYER" });
    }
  }
  render() {
    if (store.get("shouldRender") === false) {
      return;
    }

    this.#el.style.display = "block";
    this.#gameModeEl.textContent = this.#store.get("gameMode");

    const players = this.#store.get("players");
    this.#playerListEl.innerHTML = "";

    players.forEach((player) => {
      const playerEl = document.createElement("div");
      playerEl.textContent =
        player.name +
        (player.isBot ? " (AI)" : "") +
        " " +
        (player.isReady ? "READY" : "");
      playerEl.style.color = player.color;
      this.#playerListEl.appendChild(playerEl);
    });

    for (let i = 0; i < MAX_PLAYERS - players.length; i++) {
      const playerEl = document.createElement("div");
      playerEl.textContent = "WAITING...";
      this.#playerListEl.appendChild(playerEl);
    }

    // enable start button if all players are ready
    if (players.every((player) => player.isReady) && players.length > 1) {
      this.#startBtnEl.disabled = false;
    } else {
      this.#startBtnEl.disabled = true;
    }

    store.dispatch({ type: "RENDERED" });
  }

  handleAddAi() {
    this.#store.dispatch({ type: "ADD_PLAYER", payload: { isBot: true } });
  }

  handleStartGame() {
    this.#store.dispatch({ type: "START_GAME" });
  }
}

class GameStatusPlay {
  #store;
  #el;
  constructor(store) {
    this.#store = store;
    this.handleLeaveGame = this.handleLeaveGame.bind(this);
  }
  mount() {
    this.#el = document.querySelector("#play");

    const leaveBtn = document.querySelector("#play-leave");
    leaveBtn.addEventListener("click", this.handleLeaveGame);

    return () => {
      this.#el.style.display = "none";
      leaveBtn.removeEventListener("click", this.handleLeaveGame);
    };
  }
  update() {
    // update title screen
  }
  render() {
    this.#el.style.display = "block";
  }

  handleLeaveGame() {
    this.#store.dispatch({ type: "LEAVE_GAME" });
  }
}

const store = new GameStore(initialState, gameReducer);

// basic game look with requestAnimationFrame
let gameStatusLoading;
let gameStatusLoadingUnmount;
let gameStatusTitle;
let gameStatusTitleUnmount;
let gameStatusLobby;
let gameStatusLobbyUnmount;
let gameStatusPlay;
let gameStatusPlayUnmount;
const gameLoop = () => {
  if (store.get("gameStatus") === "LOADING") {
    if (!gameStatusLoading) {
      gameStatusLoading = new GameStatusLoading(store);
      gameStatusLoadingUnmount = gameStatusLoading.mount();
    }
    gameStatusLoading.update();
    gameStatusLoading.render();
  } else if (store.get("gameStatus") === "TITLE") {
    if (gameStatusLoading) {
      gameStatusLoadingUnmount();
      gameStatusLoadingUnmount = null;
      gameStatusLoading = null;
    }
    if (gameStatusPlay) {
      gameStatusPlayUnmount();
      gameStatusPlayUnmount = null;
      gameStatusPlay = null;
    }
    if (!gameStatusTitle) {
      gameStatusTitle = new GameStatusTitle(store);
      gameStatusTitleUnmount = gameStatusTitle.mount();
    }
    gameStatusTitle.update();
    gameStatusTitle.render();
  } else if (store.get("gameStatus") === "LOBBY") {
    // unmount title
    if (gameStatusTitle) {
      gameStatusTitleUnmount();
      gameStatusTitleUnmount = null;
      gameStatusTitle = null;
    }
    if (!gameStatusLobby) {
      gameStatusLobby = new GameStatusLobby(store);
      gameStatusLobbyUnmount = gameStatusLobby.mount();
    }
    gameStatusLobby.update();
    gameStatusLobby.render();
  } else if (store.get("gameStatus") === "PLAY") {
    // unmount lobby
    if (gameStatusLobby) {
      gameStatusLobbyUnmount();
      gameStatusLobbyUnmount = null;
      gameStatusLobby = null;
    }
    if (!gameStatusPlay) {
      gameStatusPlay = new GameStatusPlay(store);
      gameStatusPlayUnmount = gameStatusPlay.mount();
    }
    gameStatusPlay.update();
    gameStatusPlay.render();
  }
  requestAnimationFrame(gameLoop);
};
requestAnimationFrame(gameLoop);
