//game.js
//contains CANVAS, state (start / playing / paused / gameover), main loop, and connection between Player and HUD

//
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.state = "start"; //'start' ; 'playing' ; 'paused' ; 'gameover'

    this.player = new Player(150, canvas.height / 2);

    this.cameraX = 0;
    //dynamic array & initial map generation for solar zones and obstacles
    this.solarZones = [];
    this.obstacles = [];

    //dynamic gen layout on load
    this.generateObstacles(6); //spawns 6 non-overlapping obstacles
    this.generateSolarZones(3); //spawns 3 non-overlapping solar microgrids

    //state tracking for keyboard input (up, down, left, right)
    this.input = { up: false, down: false, left: false, right: false };

    //progress tracking
    this.score = 0;
    this.distanceTravelled = 0;

    //binds the loop function to ensure 'this' refers to the game instance during requestAnimationFrame
    this.lastTimestamp = null;
    this.loop = this.loop.bind(this);
  }

  /**
   * Helper to check if a new rectangular zone overlaps with existing zones,
   * obstacles, or the player spawn point.
   */
  isOverlapping(x, y, w, h, existingItems = null, minDistance = 40) {
    //1 keep away from center player spawn point
    const spawnX = 150;
    const spawnY = this.canvas.height / 2;
    const distToSpawn = Math.hypot(x + w / 2 - spawnX, y + h / 2 - spawnY);
    if (distToSpawn < 120) return true;

    const itemsToCheck = existingItems || [
      ...this.solarZones,
      ...this.obstacles,
    ];

    // 2 check overlap against target objects
    return itemsToCheck.some((item) => {
      //exclude self-comparison during item recycling

      return (
        x < item.x + item.width + minDistance &&
        x + w + minDistance > item.x &&
        y < item.y + item.height + minDistance &&
        y + h + minDistance > item.y
      );
    });
  }

  //gen dynamic solar microgrid zones across map, ensuring they don't overlap with each other or the player spawn point. The count parameter determines how many zones to generate.
  generateSolarZones(count = 3) {
    this.solarZones = [];
    const zoneWidth = 140;
    const zoneHeight = 70;
    const padding = 30;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let valid = false;
      let x, y;

      while (!valid && attempts < 100) {
        x = 300 + Math.random() * (this.canvas.width - zoneWidth);
        y =
          padding +
          Math.random() * (this.canvas.height - zoneHeight - padding * 2);

        const allExisting = [...this.solarZones, ...this.obstacles];
        if (!this.isOverlapping(x, y, zoneWidth, zoneHeight, allExisting)) {
          valid = true;
        }
        attempts++;
      }

      if (valid) {
        this.solarZones.push({ x, y, width: zoneWidth, height: zoneHeight });
      }
    }
  }

  //gen random obstacles across the map, ensuring they don't overlap with each other or the player spawn point
  generateObstacles(count = 6) {
    this.obstacles = [];
    const types = ["river", "wildlife", "hut", "tree"];
    const padding = 20;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 100) {
        const type = types[Math.floor(Math.random() * types.length)];

        let width = 45;
        let height = 45;
        if (type === "river") {
          width = 120;
          height = 40;
        } else if (type === "hut") {
          width = 50;
          height = 50;
        }

        const x = 300 + Math.random() * (this.canvas.width - width);
        const y =
          padding + Math.random() * (this.canvas.height - height - padding * 2);

        const allExisting = [...this.solarZones, ...this.obstacles];
        if (!this.isOverlapping(x, y, width, height, allExisting)) {
          this.obstacles.push(new Obstacle(x, y, width, height, type));
          valid = true;
        }
        attempts++;
      }
    }
  }

  //starts the game loop and initializes game state
  //start
  start() {
    this.state = "playing";
    this.score = 0;
    this.distanceTravelled = 0;
    this.cameraX = 0; //rset cam pos on restart
    this.player = new Player(150, this.canvas.height / 2);

    //re-initialize obstacles
    //re-gen dynamic map elements on restart
    this.generateObstacles(6);
    this.generateSolarZones(3);

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
    return this.solarZones.some((z) => {
      return (
        this.player.x > z.x &&
        this.player.x < z.x + z.width &&
        this.player.y > z.y &&
        this.player.y < z.y + z.height
      );
    });
  }

  //updtes based on the time(dt) since the last frame, player input, and whether the player is in the solar zone.also updates the player's pos, keeps them within canvas bounds, and cals score and distance traveled. If the player's battery lvl is depleted and they are not moving, it triggers a game over.
  update(dt) {
    //1 track speed multiplier (defaults 1.0 = normal speed)
    let speedMultiplier = 1.0;

    //2 check for collisions with obstacles
    this.obstacles.forEach((obstacle) => {
      if (obstacle.checkCollision(this.player)) {
        speedMultiplier = Math.min(speedMultiplier, obstacle.speedFactor);

        //added audio from audio.js
        this.obstacles.forEach((obstacle) => {
          if (obstacle.checkCollision(this.player)) {
            speedMultiplier = Math.min(speedMultiplier, obstacle.speedFactor);

            if (!obstacle.hasHit) {
              playObstacleSound(obstacle.type);
              obstacle.hasHit = true;
            }

            if (obstacle.batteryDrain > 0) {
              this.player.batteryLevel = Math.max(
                0,
                this.player.batteryLevel - obstacle.batteryDrain * dt,
              );
            }
          } else {
            obstacle.hasHit = false;
          }
        });
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

    //clamp Y-axis only (replaces old keepInBounds horizontal clamping)
    if (this.player.y < 20) this.player.y = 20;
    if (this.player.y > this.canvas.height - 20)
      this.player.y = this.canvas.height - 20;

    // prevent player from flying backwards off the left edge of the screen
    if (this.player.x < this.cameraX + 20) {
      this.player.x = this.cameraX + 20;
      this.player.velocityX = 0;
    }

    //lock cam offset 150px behind player's forward X position
    this.cameraX = this.player.x - 150;

    //cal distance and score after clamping & camera positioning
    this.distanceTravelled = Math.max(0, (this.player.x - 150) / 100);
    this.score = Math.floor(this.distanceTravelled * 10);

    //cal density factor based on progression along X-axis
    //drops densityFactor from 1.0 (start) down to 0.3 (at 1000m distance)
    const progression = Math.min(this.distanceTravelled / 1000, 1);
    const densityFactor = 1 - progression * 0.7;

    //recycle obstacles ahead of the player as they pass behind the cam
    this.obstacles.forEach((obs) => {
      if (obs.x < this.cameraX - 100) {
        const baseGap = 50 * densityFactor;
        const randomGap = 150 * densityFactor * Math.random();

        let candidateX = this.cameraX + this.canvas.width + baseGap + randomGap;
        let candidateY = 50 + Math.random() * (this.canvas.height - 100);
        let attempts = 0;

        //combine all obstacles and solar zones to check against
        const allExisting = [...this.solarZones, ...this.obstacles].filter(
          (o) => o !== obs,
        );

        //retry pos if candidate area overlaps any existing item
        while (
          this.isOverlapping(
            candidateX,
            candidateY,
            obs.width || 45,
            obs.height || 45,
            allExisting,
          ) &&
          attempts < 10
        ) {
          candidateX += 50; //shift further right if overlapping
          candidateY = 50 + Math.random() * (this.canvas.height - 100);
          attempts++;
        }

        obs.x = candidateX;
        obs.y = candidateY;
      }
    });

    //recycle solar zones ahead of the player as they pass behind the cam
    this.solarZones.forEach((z) => {
      if (z.x + z.width < this.cameraX - 100) {
        //base gap shrinks as densityFactor drops
        const baseGap = 100 * densityFactor;
        const randomGap = 200 * densityFactor * Math.random();

        let candidateX = this.cameraX + this.canvas.width + baseGap + randomGap;
        let candidateY = 50 + Math.random() * (this.canvas.height - 200);
        let attempts = 0;
        //combine all obstacles and solar zones to check against
        const allExisting = [...this.solarZones, ...this.obstacles].filter(
          (item) => item !== z,
        );

        //retry pos if candidate area overlaps any existing item
        while (
          this.isOverlapping(
            candidateX,
            candidateY,
            z.width || 140,
            z.height || 70,
            allExisting,
          ) &&
          attempts < 10
        ) {
          candidateX += 60; //shift further right if overlapping
          candidateY = 50 + Math.random() * (this.canvas.height - 200);
          attempts++;
        }

        z.x = candidateX;
        z.y = candidateY;
      }
    });
    if (this.player.batteryLevel <= 0 && speed < 1) {
      // Stranded with an empty battery
      this.gameOver();
    }
    //refresh ui elements
    if (typeof updateUI === "function") {
      updateUI(this);
    }
  }

  //draws the game state to the canvas (solar zone and player)
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //save context state and translate cam view
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    //1 draw all dynamic solar microgrid zones
    this.solarZones.forEach((z) => {
      ctx.fillStyle = "rgba(217, 164, 65, 0.35)";
      ctx.fillRect(z.x, z.y, z.width, z.height);
      ctx.strokeStyle = "#d9a441";
      ctx.lineWidth = 2;
      ctx.strokeRect(z.x, z.y, z.width, z.height);

      ctx.fillStyle = "#d9a441";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("SOLAR ZONE", z.x + 8, z.y + 18);
    });

    //draw obstacles to the canvas
    this.obstacles.forEach((obstacle) => obstacle.draw(ctx));
    //draw player on top of ground elements
    this.player.draw(ctx);

    ctx.restore();
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
