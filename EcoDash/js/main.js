//main.js
// Wires up keyboard input, button clicks, and switching between the "start","HUD","pause","game-over" screens. No page refresh is required.

//setup the canvas and game instance
const canvas = document.getElementById("gameCanvas");
const game = new Game(canvas);

const screens = {
  start: document.getElementById("start-screen"),
  pause: document.getElementById("pause-screen"),
  gameover: document.getElementById("gameover-screen"),
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
  if (e.code === "Escape" && game.state === "playing") pauseGame();
});
//REF:(e.code)  https://itsourcecode.com/javascript-tutorial/what-is-the-e-in-javascript-functions-and-why-is-it-important/

window.addEventListener("keyup", (e) => {
  const action = keyMap[e.code];
  if (action) game.input[action] = false;
});

// -Button input-
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

//game loop called when state becomes "gameover"

//
function onGameOver(gameInstance) {
  const key = "ecodash_highscore";
  const previousHigh = Number(localStorage.getItem(key)) || 0; //checks if prev high score exits in storage, if not sets to 0
  const highScore = Math.max(previousHigh, gameInstance.score); //compares previous high score to current score and sets the higher value to highScore
  localStorage.setItem(key, highScore);

  //gameover screen display: final score, distance travelled, and high score
  document.getElementById("finalScore").textContent = gameInstance.score;
  document.getElementById("finalDistance").textContent =
    gameInstance.distanceTravelled.toFixed(1);
  document.getElementById("highScore").textContent = highScore;

  showOnly("gameover");
}
