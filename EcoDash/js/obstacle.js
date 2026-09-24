//obstacle.js

class Obstacle {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; //wildlife, river,houses etc
  }

  //draw context for obstacles
 draw(ctx) {
    ctx.save();

    switch (this.type) {
      
      // -- RIVER (Winding Blue Water Body) --
    
      case 'river':
        ctx.fillStyle = '#2b7fff';
        ctx.strokeStyle = '#1e5bb8';
        ctx.lineWidth = 3;

        //draw a soft rounded river channel
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();
        ctx.stroke();

        //decorative internal water current lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + this.height * 0.3);
        ctx.quadraticCurveTo(
          this.x + this.width / 2, this.y + this.height * 0.1,
          this.x + this.width - 10, this.y + this.height * 0.3
        );
        ctx.moveTo(this.x + 10, this.y + this.height * 0.7);
        ctx.quadraticCurveTo(
          this.x + this.width / 2, this.y + this.height * 0.9,
          this.x + this.width - 10, this.y + this.height * 0.7
        );
        ctx.stroke();
        break;

    
      // -- WILDLIFE (Acacia-tinted Wildlife Crossing Marker / Silhouette) --
    
      case 'wildlife':
        //cautionary bg glow/zone
        ctx.fillStyle = 'rgba(217, 119, 6, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        //draw warning sign triangle
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        //wildlife symbol text/animal mark
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦒', this.x + this.width / 2, this.y + this.height * 0.65);
        break;
