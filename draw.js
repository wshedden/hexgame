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
  rect(width - 200, 10, 190, 300, 10); // Adjusted position to top right
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Hex: (${hex.q}, ${hex.r})`, width - 190, 30);
  text(`Type: ${hex.type}`, width - 190, 50);
  text(`Noise: ${hex.noiseValue.toFixed(2)}`, width - 190, 70);
  if (hex.unit) {
    text(`Unit: ${hex.unit.type}`, width - 190, 90);
    text(`Health: ${hex.unit.health}`, width - 190, 110);
    text(`Attack: ${hex.unit.attack}`, width - 190, 130);
    text(`Defense: ${hex.unit.defense}`, width - 190, 150);
  }
  if (hex.occupiedBy) {
    text(`Occupied by: ${hex.occupiedBy}`, width - 190, 170);
  }

  // Add info about possible attackable tiles
  let attackableTiles = getAttackableTiles(hex);
  text(`Attackable Tiles:`, width - 190, 190);
  attackableTiles.forEach((tile, index) => {
    text(`(${tile.q}, ${tile.r})`, width - 190, 210 + index * 20);
  });
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

function drawPlayerHexesPopup(player, x, y) {
  if (!player) return;

  rectMode(CORNER); // Ensure rectMode is set to CORNER
  fill(0, 0, 0, 150); // Semi-transparent black background

  // Calculate the height of the popup based on the number of lines
  let occupiedHexesLines = Math.ceil(player.occupiedHexes.length / 3);
  let adjacentHexesLines = Math.ceil(player.adjacentHexes.size / 3);
  let totalLines = 4 + occupiedHexesLines + adjacentHexesLines; // 4 lines for titles and battles left
  let popupHeight = totalLines * 20 + 40; // 20 pixels per line + some padding

  rect(x, y, 190, popupHeight, 10); // Adjusted height to accommodate new info
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Player ${player.id} Hexes:`, x + 10, y + 20);

  // Display occupied hexes
  player.occupiedHexes.forEach((hex, index) => {
    let line = Math.floor(index / 3);
    let column = index % 3;
    text(`(${hex.q},${hex.r})`, x + 10 + column * 60, y + 40 + line * 20);
  });

  text(`Adjacent Hexes:`, x + 10, y + 40 + occupiedHexesLines * 20 + 20);

  // Display adjacent hexes
  Array.from(player.adjacentHexes).forEach((key, index) => {
    let line = Math.floor(index / 3);
    let column = index % 3;
    text(`${key}`, x + 10 + column * 60, y + 40 + occupiedHexesLines * 20 + 40 + line * 20);
  });

  // Add battles left info
  text(`Battles Left: ${player.battlesLeft}`, x + 10, y + 40 + occupiedHexesLines * 20 + 60 + adjacentHexesLines * 20);
}

function getAttackableTiles(hex) {
  if (!hex.unit) return [];
  let neighbors = getHexNeighbors(hex);
  return neighbors.filter(neighbor => neighbor.unit && neighbor.unit.id !== hex.unit.id);
}
