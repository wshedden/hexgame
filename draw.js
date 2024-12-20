function drawHex(x, y, size, type, textValue, claimedBy) {
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

  // Draw thick outline if claimed
  if (claimedBy) {
    strokeWeight(4);
    stroke(claimedBy.color);
    noFill();
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i;
      let vx = size * cos(angle);
      let vy = size * sin(angle);
      vertex(vx, vy);
    }
    endShape(CLOSE);
  }
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

const panelWidth = 200;
const basePanelHeight = 150;
const padding = 10;
const panels = [];

function drawPanels() {
  const leftPanels = [panels[0], panels[1], panels[4]]; // Panels on the left side
  const rightPanels = [panels[2], panels[3]]; // Panels on the right side

  // Draw left panels
  let yOffset = padding;
  for (let i = 0; i < leftPanels.length; i++) {
    const panelHeight = calculatePanelHeight(leftPanels[i]);
    push();
    translate(padding, yOffset);
    leftPanels[i]();
    pop();
    yOffset += panelHeight + padding;
  }

  // Draw right panels
  yOffset = padding;
  for (let i = 0; i < rightPanels.length; i++) {
    const panelHeight = calculatePanelHeight(rightPanels[i]);
    push();
    translate(width - panelWidth - padding, yOffset);
    rightPanels[i]();
    pop();
    yOffset += panelHeight + padding;
  }
}

function calculatePanelHeight(panelFunction) {
  // Temporarily set text size to calculate height
  textSize(16);
  let baseHeight = basePanelHeight;
  if (panelFunction === drawHexInfoPopup && selectedHex) {
    baseHeight += selectedHex.units.length * 40 + getAttackableTiles(selectedHex).length * 20;
  }
  return baseHeight;
}

function drawGameStatePopup() {
  rectMode(CORNER);
  fill(0, 0, 0, 150);
  rect(0, 0, panelWidth, basePanelHeight, 10);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`State: ${currentState}`, 10, 30);
  text(`Player: ${players[currentPlayerIndex].id}`, 10, 50);
  text(`Turn: ${turnNumber}`, 10, 70);
  let adjustedTurnDuration = turnDuration * (1 / speedMultiplier);
  let remainingTime = Math.max(0, adjustedTurnDuration - (millis() - turnStartTime));
  text(`Time Left: ${(remainingTime / 1000).toFixed(1)}s`, 10, 90);
  text(`Speed: ${speedMultiplier.toFixed(3)}x`, 10, 110);
}

function drawHexInfoPopup(hex) {
  if (!hex) return;
  const panelHeight = calculatePanelHeight(drawHexInfoPopup);
  rectMode(CORNER);
  fill(0, 0, 0, 150);
  rect(0, 0, panelWidth, panelHeight, 10);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Hex: (${hex.q}, ${hex.r})`, 10, 30);
  text(`Type: ${hex.type}`, 10, 50);
  text(`Noise: ${hex.noiseValue.toFixed(2)}`, 10, 70);
  if (hex.units.length > 0) {
    text(`Units: ${hex.units.length}`, 10, 90);
    for (let i = 0; i < hex.units.length; i++) {
      text(`Unit ${i}: ${hex.units[i].type}`, 10, 110 + i * 40);
      text(`Health: ${hex.units[i].health}`, 10, 130 + i * 40);
      text(`Attack: ${hex.units[i].attack}`, 10, 150 + i * 40);
      text(`Defence: ${hex.units[i].defense}`, 10, 170 + i * 40);
    }
  }
  if (hex.occupiedBy) {
    text(`Occupied by: ${hex.occupiedBy}`, 10, 210);
  }
  let attackableTiles = getAttackableTiles(hex);
  text(`Attackable Tiles:`, 10, 230);
  attackableTiles.forEach((tile, index) => {
    text(`(${tile.q}, ${tile.r})`, 10, 250 + index * 20);
  });
}

function drawPlayerHexesPopup(player, x, y) {
  if (!player) return;
  rectMode(CORNER);
  fill(0, 0, 0, 150);
  rect(0, 0, panelWidth, basePanelHeight, 10);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Player ${player.id} Info:`, 10, 20);
  text(`Claimed Hexes: ${player.occupiedHexes.length}`, 10, 40);
  text(`Adjacent Hexes: ${player.adjacentHexes.size}`, 10, 60);
  text(`Battles Left: ${player.battlesLeft}`, 10, 80);
}

function drawSelectedUnitTypePanel() {
  rectMode(CORNER);
  fill(0, 0, 0, 150);
  rect(0, 0, panelWidth, basePanelHeight, 10);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Selected Unit: ${selectedUnitType}`, 10, 30);
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

function getAttackableTiles(hex) {
  if (!hex.unit) return [];
  let neighbors = getHexNeighbors(hex);
  return neighbors.filter(neighbor => neighbor.unit && neighbor.unit.id !== hex.unit.id);
}
