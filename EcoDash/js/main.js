//main.js
// Wires up keyboard input, button clicks, and switching between the "start","HUD","pause","game-over" screens. No page refresh is required.

//setup the canvas and game instance
const canvas = document.getElementById("gameCanvas");
const game = new Game(canvas);

//added ui dom binds

const uiElements = {
  scoreText:
    document.getElementById("score-text") ||
    document.getElementById("scoreText"),
  distText:
    document.getElementById("dist-text") || document.getElementById("distText"),
  batteryFill:
    document.getElementById("battery-fill") ||
    document.getElementById("batteryFill"),
  solarIndicator:
    document.getElementById("solar-indicator") ||
    document.getElementById("solarIndicator"),
};

const screens = {
  start:
    document.getElementById("start-screen") ||
    document.getElementById("startScreen"),
  pause:
    document.getElementById("pause-screen") ||
    document.getElementById("pauseScreen"),
  gameover:
    document.getElementById("gameover-screen") ||
    document.getElementById("gameoverScreen"),
  hud: document.getElementById("hud"),
};

function showOnly(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (key === "hud") return;
    // hud toggled separately below
    el.classList.toggle("hidden", key !== name);
  });
  screens.hud.classList.toggle("hidden", name !== null);
}

//Setup Inputs
// -Keyboard input-
const keyMap = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

window.addEventListener("keydown", (e) => {
  const action = keyMap[e.code];
  if (action) game.input[action] = true;

  //toggle pause with Escape or P key
  if (e.code === "Escape" || e.code === "KeyP") {
    if (game.state === "playing") {
      pauseGame();
    } else if (game.state === "paused") {
      showOnly(null);
      game.resume();
    }
  }
});
//REF:(e.code)  https://itsourcecode.com/javascript-tutorial/what-is-the-e-in-javascript-functions-and-why-is-it-important/

window.addEventListener("keyup", (e) => {
  const action = keyMap[e.code];
  if (action) game.input[action] = false;
});

function addClickIfExist(id, callback) {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", callback);
}

// -Button listeners-
document.getElementById("startBtn").addEventListener("click", () => {
  showOnly(null);
  game.start();
});

//pause and resume buttons
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("resumeBtn").addEventListener("click", () => {
  showOnly(null);
  game.resume();
});

//restart button
document
  .getElementById("restartFromPauseBtn")
  .addEventListener("click", restartGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);

//game functions
function pauseGame() {
  game.pause();
  showOnly("pause");
}

function restartGame() {
  showOnly(null);
  game.start();
}

//per frame ui update func
function updateUI(gameInstance) {
  if (!gameInstance || !gameInstance.player) return;

  //1 update Score & Distance
  if (uiElements.scoreText)
    uiElements.scoreText.textContent = gameInstance.score;
  if (uiElements.distText)
    uiElements.distText.textContent = gameInstance.distanceTravelled.toFixed(1);

  //2 update Battery Fill Bar
  if (uiElements.batteryFill) {
    const batteryPct = Math.max(0, gameInstance.player.batteryLevel);
    uiElements.batteryFill.style.width = batteryPct + "%";
    if (batteryPct < 25) {
      uiElements.batteryFill.style.backgroundColor = "#e53935"; // Red
    } else if (batteryPct < 50) {
      uiElements.batteryFill.style.backgroundColor = "#fdd835"; // Yellow
    } else {
      uiElements.batteryFill.style.backgroundColor = "#6aa84f"; // Green
    }
  }

  //3toggle solar recharge zone indicator
  if (uiElements.solarIndicator) {
    if (
      typeof gameInstance.isInSolarZone === "function" &&
      gameInstance.isInSolarZone()
    ) {
      uiElements.solarIndicator.classList.remove("hidden");
    } else {
      uiElements.solarIndicator.classList.add("hidden");
    }
  }
}

//game loop called when state becomes "gameover"

//
function onGameOver(gameInstance) {
  const key = "ecodash_highscore";
  const previousHigh = Number(localStorage.getItem(key)) || 0; //checks if prev high score exits in storage, if not sets to 0
  const highScore = Math.max(previousHigh, gameInstance.score); //compares previous high score to current score and sets the higher value to highScore
  localStorage.setItem(key, highScore);

  //cal energy efficiency: distance travelled per unit of battery depleted
  const batteryUsed = 100 - Math.max(0, gameInstance.player.batteryLevel);
  const efficiency =
    batteryUsed > 0
      ? (gameInstance.distanceTravelled / batteryUsed).toFixed(2)
      : "0.00";

  //gameover screen display: final score, distance travelled, and high score ADDED: energy efficiency
  document.getElementById("finalScore").textContent = gameInstance.score;
  document.getElementById("finalDistance").textContent =
    gameInstance.distanceTravelled.toFixed(1);
  document.getElementById("finalEfficiency").textContent = efficiency;
  document.getElementById("highScore").textContent = highScore;

  showOnly("gameover");
}
