// audio.js

const objectImpactSound = new Audio("object_impact.mp3");
const treeImpactSound = new Audio("tree_impact.mp3");

//plays sound for wildlife and hut impacts
function playObjectImpactSound() {
  objectImpactSound.currentTime = 0;
  objectImpactSound.play().catch(() => {});
}

//plays sound for tree impacts
function playTreeImpactSound() {
  treeImpactSound.currentTime = 0;
  treeImpactSound.play().catch(() => {});
}

//main audio trigger func during collision
function playObstacleSound(type) {
  if (type === "wildlife" || type === "hut") {
    playObjectImpactSound();
  } else if (type === "tree") {
    playTreeImpactSound();
  }
}
