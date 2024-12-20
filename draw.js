function drawHex(x, y, size, type, textValue) {
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

function getTerrainColor(type) {
  switch (type) {
    case 'grass': return color(100, 200, 100);
    case 'water': return color(50, 100, 200);
    case 'mountain': return color(100, 100, 100);
    case 'desert': return color(237, 201, 175);
    case 'forest': return color(34, 139, 34);
    case 'snow': return color(255, 250, 250);
    default: return color(200);
  }
}

function drawGrid() {
  push();
  translate(width / 2, height / 2); // Translate the origin to the center of the canvas
  hexGrid.forEach((hex) => {
    let { x, y } = hexToPixel(hex);
    drawHex(x, y, 30, hex.type, hex.text, hex.unit);
  });

  // Highlight the selected hex and its neighbors
  if (selectedHex) {
    highlightHexAndNeighbors(selectedHex);
  }
  pop();
}

function drawHexInfoPopup(hex) {
  if (!hex) return;

  rectMode(CORNER); // Ensure rectMode is set to CORNER
  fill(0, 0, 0, 150); // Semi-transparent black background
  rect(10, 80, 190, 180, 10); // Rounded rectangle below the game state popup
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Hex: (${hex.q}, ${hex.r})`, 20, 100);
  text(`Type: ${hex.type}`, 20, 120);
  text(`Noise: ${hex.noiseValue.toFixed(2)}`, 20, 140);
  if (hex.unit) {
    text(`Unit: ${hex.unit.type}`, 20, 160);
    text(`Health: ${hex.unit.health}`, 20, 180);
  }
  if (hex.occupiedBy) {
    text(`Occupied by: ${hex.occupiedBy}`, 20, 200);
  }
}

function highlightHexAndNeighbors(hex) {
  if (!hex) return;

  // Highlight the selected hex
  let { x, y } = hexToPixel(hex);
  drawHexHighlight(x, y);

  // Highlight the neighbors
  let neighbors = getHexNeighbors(hex);
  neighbors.forEach(neighbor => {
    let { x, y } = hexToPixel(neighbor);
    drawHexHighlight(x, y);
  });
}

function drawHexHighlight(x, y) {
  push();
  translate(x, y);
  stroke(255, 255, 0); // Yellow outline for highlighting
  strokeWeight(3);
  noFill();
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i;
    let vx = 30 * cos(angle); // Assuming hex size is 30
    let vy = 30 * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE);
  pop();
}

function drawPlayerHexesPopup(player) {
  if (!player) return;

  rectMode(CORNER); // Ensure rectMode is set to CORNER
  fill(0, 0, 0, 150); // Semi-transparent black background
  rect(10, 270, 190, 180, 10); // Rounded rectangle below the hex info popup
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Player ${player.id} Hexes:`, 20, 290);
  player.occupiedHexes.forEach((hex, index) => {
    text(`(${hex.q}, ${hex.r})`, 20, 310 + index * 20);
  });
}
