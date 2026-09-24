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

    
      // -- TRADITIONAL AFRICAN HUT (Clay Base + Thatch Roof) --
      case 'hut':
        const centerX = this.x + this.width / 2;
        const radius = this.width / 2;

        //base structure (circular body)
        ctx.fillStyle = '#b45309'; //clay color
        ctx.beginPath();
        ctx.arc(centerX, this.y + radius * 0.9, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        //door
        ctx.fillStyle = '#451a03';
        ctx.fillRect(centerX - 4, this.y + radius * 1.1, 8, 10);

        //cone thatch roof (triangle layer overlay)
        ctx.fillStyle = '#d97706'; //straw thatch yellow-orange
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y - 4); //roof peak
        ctx.lineTo(this.x - 2, this.y + radius);
        ctx.lineTo(this.x + this.width + 2, this.y + radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

       
      //-- AFRICAN ACACIA TREE (Wide Canopy & Trunk)--
     
      case 'tree':
        const trunkWidth = this.width * 0.2;
        const trunkX = this.x + (this.width - trunkWidth) / 2;

        //tree Trunk
        ctx.fillStyle = '#5c3a21'; 
        ctx.fillRect(trunkX, this.y + this.height * 0.4, trunkWidth, this.height * 0.6);

        //flat-Topped Acacia Canopy (overlapping layered ovals)
        ctx.fillStyle = '#2d5a27'; // Dark foliage green
        
        //base wide canopy
        ctx.beginPath();
        ctx.ellipse(
          this.x + this.width / 2, 
          this.y + this.height * 0.35, 
          this.width / 2, 
          this.height * 0.25, 
          0, 0, Math.PI * 2
        );
        ctx.fill();

        // Top accent canopy layer
        ctx.fillStyle = '#3a7233'; //lighter foliage highlight
        ctx.beginPath();
        ctx.ellipse(
          this.x + this.width / 2, 
          this.y + this.height * 0.25, 
          this.width * 0.35, 
          this.height * 0.18, 
          0, 0, Math.PI * 2
        );
        ctx.fill();
        break;
