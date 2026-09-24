//game.js
//contains CANVAS, state (start / playing / paused / gameover), main loop, and connection between Player and HUD

//
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.state = "start"; //'start' ; 'playing' ; 'paused' ; 'gameover'

    this.player = new Player(canvas.width / 2, canvas.height / 2);

    //obstacles array (link to obstacle.js)
    this.obstacles = [
      new Obstacle(200, 150, 120, 40, "river"),
      new Obstacle(400, 320, 35, 35, "wildlife"),
      new Obstacle(100, 350, 40, 40, "hut"),
      new Obstacle(450, 220, 50, 50, "tree"), // <--- Acacia Tree
    ];

    // placeholder solar microgrid zone; ( expand into an array of zones later)
    this.solarZone = { x: 40, y: 40, width: 160, height: 60 }; //

    //state tracking for keyboard input (up, down, left, right)
    this.input = { up: false, down: false, left: false, right: false };

    //progress tracking
    this.score = 0;
    this.distanceTravelled = 0;

    // binds the loop function to ensure 'this' refers to the game instance during requestAnimationFrame
    this.lastTimestamp = null;
    this.loop = this.loop.bind(this);
  }

  //starts the game loop and initializes game state
  //start
  start() {
    this.state = "playing";
    this.score = 0;
    this.distanceTravelled = 0;
    this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);

    //re-initialize obstacles
    this.obstacles = [
      new Obstacle(200, 150, 120, 40, "river"),
      new Obstacle(400, 320, 35, 35, "wildlife"),
      new Obstacle(100, 350, 40, 40, "hut"),
      new Obstacle(450, 220, 50, 50, "tree"),
    ];

    this.lastTimestamp = null;
    requestAnimationFrame(this.loop);
  }

  //pauses the game loop
  pause() {
    if (this.state === "playing") this.state = "paused";
  }
  resume() {
    if (this.state === "paused") {
      this.state = "playing";
      this.lastTimestamp = null; // avoid a large dt jump after resuming
      requestAnimationFrame(this.loop);
    }
  }

  //game over
  gameOver() {
    this.state = "gameover";
  }

  //checks if the player's position (x, y) falls within the rectangular bounds of the solar zone (top-left, right, and bottom edges)
  isInSolarZone() {
    const z = this.solarZone;
    return (
      this.player.x > z.x &&
      this.player.x < z.x + z.width &&
      this.player.y > z.y &&
      this.player.y < z.y + z.height
    );
  }

  //updtes based on the time(dt) since the last frame, player input, and whether the player is in the solar zone.also updates the player's pos, keeps them within canvas bounds, and cals score and distance traveled. If the player's battery lvl is depleted and they are not moving, it triggers a game over.
  update(dt) {
    //1 track speed multiplier (defaults 1.0 = normal speed)
    let speedMultiplier = 1.0;

    //2 check for collisions with obstacles
    this.obstacles.forEach((obstacle) => {
      if (obstacle.checkCollision(this.player)) {
        //apply the lowest speed factor among all collided obstacles
        speedMultiplier = Math.min(speedMultiplier, obstacle.speedFactor);
        //apply battery drain penalty over time (multiplied by dt)
        if (obstacle.batteryDrain > 0) {
          this.player.batteryLevel = Math.max(
            0,
            this.player.batteryLevel - obstacle.batteryDrain * dt,
          );
        }
      }
    });
    //3 pass speedMultiplier into player update
    const speed = this.player.update(
      dt,
      this.input,
      this.isInSolarZone(),
      speedMultiplier,
    );

    this.player.keepInBounds(this.canvas.width, this.canvas.height);

    this.distanceTravelled += (speed * dt) / 50; //arbitrary px-to-km scale
    this.score = Math.floor(this.distanceTravelled * 10);

    if (this.player.batteryLevel <= 0 && speed < 1) {
      // Stranded with an empty battery — placeholder end condition.
      this.gameOver();
    }
  }

  //draws the game state to the canvas (solar zone and player)
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Solar microgrid zone.
    const z = this.solarZone;
    ctx.fillStyle = "rgba(217, 164, 65, 0.35)"; //colors may change
    ctx.fillRect(z.x, z.y, z.width, z.height);
    ctx.strokeStyle = "#d9a441";
    ctx.strokeRect(z.x, z.y, z.width, z.height);

    this.player.draw(ctx);

    //draw obstacles to the canvas
    this.obstacles.forEach((obstacle) => obstacle.draw(ctx));
    //draw player on top of ground elements
    this.player.draw(ctx);
  }

  //hud update
  updateHUD() {
    document.getElementById("scoreValue").textContent = this.score;
    document.getElementById("distanceValue").textContent =
      this.distanceTravelled.toFixed(1);

    const fill = document.getElementById("battery-fill");
    fill.style.width = this.player.batteryLevel + "%";
    fill.style.background =
      this.player.batteryLevel > 25 ? "#6aa84f" : "#c0392b";
  }

  //timestamp
  //provided by requestAnimationFrame and reps the current time in ms.loop cals the time diff (dt) since the last frame, updates the game state, draws the updated state to the canvas, and updates the HUD; then requests the next animation frame if the game is still in the "playing" state.
  loop(timestamp) {
    if (this.state !== "playing") return;

    if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.draw();
    this.updateHUD();

    if (this.state === "gameover") {
      onGameOver(this); // defined in main.js, handles the screen switch
      return;
    }

    requestAnimationFrame(this.loop);
  }
}
