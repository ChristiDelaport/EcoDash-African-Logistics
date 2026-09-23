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
