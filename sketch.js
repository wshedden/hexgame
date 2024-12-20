function setup() {
  createCanvas(1800, 900);
  initializeGrid(8);
  initializeTerrainColors();
  generateTerrain();

  // Place a unit in the middle tile
  let middleQ = 0;
  let middleR = 0;
  let middleUnit = new Unit('soldier', 100);
  placeUnit(middleQ, middleR, middleUnit);
}

function draw() {
  background(20); // Set the background to a dark color
  drawGameState();
  drawGameStatePopup(); // Draw the game state popup in the top left corner
}

function drawHex(x, y, size, type) {
  push();
  translate(x, y);
  stroke(getOutlineColor()); // Use the purple outline color
  fill(getTerrainColor(type));
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i;
    let vx = size * cos(angle);
    let vy = size * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE);
  pop();
}

function initializeTerrainColors() {
  registerTerrainType('grass', color(100, 200, 100));
  registerTerrainType('water', color(50, 100, 200));
  registerTerrainType('mountain', color(100, 100, 100));
  registerTerrainType('desert', color(237, 201, 175));
  registerTerrainType('forest', color(34, 139, 34));
  registerTerrainType('snow', color(255, 250, 250));
}

function keyPressed() {
  handleKeyPress();
}