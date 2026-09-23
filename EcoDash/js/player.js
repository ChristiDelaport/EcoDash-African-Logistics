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
    this.maxSpeed = 220;  // pixels/sec