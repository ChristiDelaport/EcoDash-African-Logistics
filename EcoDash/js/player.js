//player.js
//reps the delivery drone

class Player {
    constructor(x, y) {
    //current world position on the canvas
    this.x = x;
    this.y = y;

    //Current movement velocity on the canvas
    this.velocityX = 0;
    this.velocityY = 0;

    this.facingAngle = 0; //radians, 0 = facing right
    this.thrustPower = 220;
    //pixels/sec^2 while a direction key is held
    this.dragFactor = 0.92; 
    //velocity multiplier applied each frame
    this.maxSpeed = 220;  //pixels/sec

    //to determine radius for collision detection and rendering
    this.radius = 14;

    //energy management variables
    this.batteryLevel = 100; //percent
    this.maxBattery = 100;
    this.drainRate = 6;  //percent/sec while thrusting
    this.rechargeRate = 18; //percent/sec inside a solar microgrid zone
  }