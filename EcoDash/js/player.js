//player.js
//reps the delivery drone
//NOTE: majority of base code was done before converting to github piece by piece then edited with github later

class Player {
  constructor(x, y) {
    //current world position on the canvas
    this.x = x;
    this.y = y;

    //Current movement velocity on the canvas
    this.velocityX = 0;
    this.velocityY = 0;

    this.facingAngle = 0; //radians, 0 = facing right

    this.baseThrustPower = 220;
    //pixels/sec^2 while a direction key is held
    this.dragFactor = 0.92;
    //velocity multiplier applied each frame
    this.baseMaxSpeed = 220; //pixels/sec

    //to determine radius for collision detection and rendering
    this.radius = 14;

    //energy management variables
    this.batteryLevel = 100; //percent
    this.maxBattery = 100;
    this.drainRate = 6; //percent/sec while thrusting
    this.rechargeRate = 18; //percent/sec inside a solar microgrid zone
  }

  // dt = delta time in seconds, input = {up,down,left,right}, inSolarZone = bool
  /*(updates physics, handles directional input, applies energy consumption/recharge, 
 and cals movement per frame)*/
  update(dt, input, inSolarZone, speedMultiplier = 1.0) {
    //scale thrust power and max top speed dynamically based on obstacle resistance
    const currentThrust = this.baseThrustPower * speedMultiplier;
    const currentMaxSpeed = this.baseMaxSpeed * speedMultiplier;

    let accelX = 0;
    let accelY = 0;
    let isThrusting = false;

    //build a direction vector from input, then derive an angle:
    // Math.cos()/Math.sin() drive the motion
    let inputX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let inputY = (input.down ? 1 : 0) - (input.up ? 1 : 0);

    //if input key is pressed, compute the facing angle and apply thrust
    if (inputX !== 0 || inputY !== 0) {
      this.facingAngle = Math.atan2(inputY, inputX); //cal angle from movement vector
      accelX = Math.cos(this.facingAngle) * currentThrust; //hori acceleration component
      accelY = Math.sin(this.facingAngle) * currentThrust; //vert acceleration component
      isThrusting = true;
    }

    //disable engine thrust completely if the battery is depleted
    if (this.batteryLevel <= 0) {
      accelX = 0;
      accelY = 0;
      isThrusting = false;
    }

    // velocity over time (dt)
    this.velocityX += accelX * dt;
    this.velocityY += accelY * dt;

    //apply drag so the vehicle decelerates smoothly instead of stopping instantly
    this.velocityX *= this.dragFactor;
    this.velocityY *= this.dragFactor;

    //clamp to a maximum speed.
    //cal total speed vector length (hypotenuse) and cap it at maxSpeed
    let speed = Math.hypot(this.velocityX, this.velocityY);
    if (speed > currentMaxSpeed && speed > 0) {
      let scale = currentMaxSpeed / speed; //uniform scaling
      this.velocityX *= scale;
      this.velocityY *= scale;
      speed = currentMaxSpeed;
    }

    //update current pos based on cal velocity and dt
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    //recharge battery if inside a solar zone; otherwise drain if active thrusting
    if (inSolarZone) {
      //rstore energy, capped at max battery capacity
      this.batteryLevel = Math.min(
        this.maxBattery,
        this.batteryLevel + this.rechargeRate * dt,
      );
    } else if (isThrusting) {
      //drain energy
      this.batteryLevel = Math.max(0, this.batteryLevel - this.drainRate * dt);
    }
    //return speed for stat tracking
    return speed;
  }

  //prevents the player from moving outside the canvas boundaries
  keepInBounds(width, height) {
    this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
  }

  //draws the triangle drone shape onto the canvas pointing toward facingAngle.
  draw(ctx) {
    ctx.save();
    //translate coord origin to player pos and rotate toward target angle
    ctx.translate(this.x, this.y);
    ctx.rotate(this.facingAngle);

    //draw triangle pointing toward angle 0 (pting right)
    ctx.fillStyle = "#2f6b3a";
    ctx.beginPath();
    ctx.moveTo(this.radius, 0); //front tip
    ctx.lineTo(-this.radius, -this.radius * 0.7); //top rear wing tip
    ctx.lineTo(-this.radius, this.radius * 0.7); //bottom rear wing tip
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
