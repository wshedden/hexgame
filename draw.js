function drawHex(x, y, size, type, textValue, claimedBy, colour, battle, building) {
  push();
  translate(x, y);
  stroke(getOutlineColour()); // Use the purple outline colour
  strokeWeight(battle ? 6 : 1); // Thicken the stroke weight if there's a battle
  // fill(claimedBy ? lerpColor(colour, color(players[claimedBy - 1].colour), 0.6) : colour);
  fill(colour);

  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i;
    let vx = size * cos(angle);
    let vy = size * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE);

  // Draw farm texture if the hex contains a farm
  if (building && building.type === 'Farm') {
    drawFarmTexture(x, y, size, building.crops);
  }

  // Draw thick outline if claimed
  if (claimedBy) {
    strokeWeight(4);
    stroke(players[claimedBy - 1].colour);
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

function getTerrainColour(type) {
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
  hexGrid.forEach((hex) => {
    let { x, y } = hexToPixel(hex);
    drawHex(x, y, 30, hex.type, hex.text, hex.claimedBy, hex.getDrawColour(), hex.battle, hex.building); // Pass the building attribute
  });

  // Highlight the selected hex and its neighbours
  if (selectedHex) {
    highlightHexAndNeighbours(selectedHex);
  }
  pop();
}

const panelWidth = 200;
const basePanelHeight = 150;
const padding = 20;
const panels = [];

function highlightHexAndNeighbours(hex) {
  if (!hex) return;

  // Highlight the selected hex
  let { x, y } = hexToPixel(hex);
  drawHexHighlight(x, y);

  // Highlight the neighbours
  let neighbours = getHexNeighbours(hex);
  neighbours.forEach(neighbour => {
    let { x, y } = hexToPixel(neighbour);
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
  let neighbours = getHexNeighbours(hex);
  return neighbours.filter(neighbour => neighbour.unit && neighbour.unit.playerID !== hex.unit.playerID);
}

// Add the drawing functions from unit.js
function drawUnits() {
  push();
  hexGrid.forEach((hex) => {
    let { x, y } = hexToPixel(hex);
    drawHexUnits(x, y, hex.units);
  });
  pop();
}

function drawHexUnits(x, y, units) {
  let maxUnits = 5; // Maximum number of units to fit in one hex
  let minUnitSize = 12; // Increased minimum unit size
  let maxUnitSize = 18; // Decreased maximum unit size
  let unitSize = maxUnitSize - (maxUnitSize - minUnitSize) * (units.length - 1) / (maxUnits - 1); // Adjust size based on the number of units

  units.forEach((unit, index) => {
    let offsetX = 0;
    let offsetY = 0;
    if (units.length > 1) {
      let angle = TWO_PI / maxUnits * index;
      let spacing = units.length <= 3 ? unitSize + 3 : unitSize + 5; // Closer spacing for 2 or 3 units
      offsetX = spacing * cos(angle);
      offsetY = spacing * sin(angle);
    }
    drawUnit(x + offsetX, y + offsetY, unit, unitSize);
  });
}

function drawUnit(x, y, unit, size) {
  push();
  translate(x, y);

  // Lerp the unit colour with the player colour
  let playerColour = color(players[unit.playerID - 1].colour[0], players[unit.playerID - 1].colour[1], players[unit.playerID - 1].colour[2]);
  let unitColour = lerpColor(unit.colour, playerColour, 0.8);

  // Set the fill and stroke
  fill(unitColour);
  stroke(lerpColor(playerColour, color(0), 0.5)); // Darker version of the player colour
  strokeWeight(2);

  // Draw the correct shape for the unit type
  drawUnitShape(unit.type, size); // Set size to 18 if the unit is animating

  pop();
}

function drawUnitPath(path, playerColour) {
  if (path.length > 1) {
    push();
    stroke(playerColour); // Use the player's colour for the path
    strokeWeight(3);
    noFill();
    beginShape();
    path.forEach(hex => {
      let { x, y } = hexToPixel(hex);
      vertex(x, y);
    });
    endShape();

    // Draw the arrowhead at the final line segment
    let lastHex = path[path.length - 1];
    let secondLastHex = path[path.length - 2];
    let { x: x1, y: y1 } = hexToPixel(secondLastHex);
    let { x: x2, y: y2 } = hexToPixel(lastHex);
    drawArrowhead(x1, y1, x2, y2, playerColour);

    pop();
  }
}

function drawArrowhead(x1, y1, x2, y2, playerColour) {
  const arrowSize = 15; // Size of the arrowhead
  const angle = atan2(y2 - y1, x2 - x1);
  const offset = 5; // Offset to move the arrowhead forward

  push();
  translate(x2, y2);
  translate(cos(angle) * offset, sin(angle) * offset); // Move the arrowhead forward
  rotate(angle);
  fill(playerColour);
  noStroke();
  beginShape();
  vertex(0, 0);
  vertex(-arrowSize, arrowSize / 2);
  vertex(-arrowSize, -arrowSize / 2);
  endShape(CLOSE);
  pop();
}

function drawPath() {
  if (path.length > 1) {
    push();
    const greenColour = color(0, 255, 0); // Green colour for the path
    stroke(greenColour);
    strokeWeight(3);
    noFill();
    beginShape();
    path.forEach(hex => {
      let { x, y } = hexToPixel(hex);
      vertex(x, y);
    });
    endShape();

    // Draw the arrowhead at the final line segment
    let lastHex = path[path.length - 1];
    let secondLastHex = path[path.length - 2];
    let { x: x1, y: y1 } = hexToPixel(secondLastHex);
    let { x: x2, y: y2 } = hexToPixel(lastHex);
    drawArrowhead(x1, y1, x2, y2, [0, 255, 0]); // Pass green colour as an array

    pop();
  }
}

function drawFarmTexture(x, y, size, crops) {
  push();
  // translate(x, y);
  for (let i = 0; i < crops; i++) {
    let angle = TWO_PI / crops * i;
    let vx = (size - 5) * cos(angle); // Move circles inside by 5 pixels
    let vy = (size - 5) * sin(angle); // Move circles inside by 5 pixels
    fill(255, 215, 0, 150); // Golden color with some transparency
    ellipse(vx, vy, size / 3, size / 3); // Draw small circles to create a texture
  }
  noStroke();
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

function draw() {
  background(20); // Set the background to a dark color
  push();
  translate(offsetX, offsetY); // Translate the origin based on the offset
  scale(scaleFactor); // Scale the canvas based on the scale factor

  drawGameState();
  // Draw panels
  toggleFailedOutputButton.style('background-color', showFailedOutput ? buttonColor1 : buttonColor2);

  if (currentState === GameState.PAUSED) {
    drawPausedState();
  }

  drawPath(); // Draw the path if in pathfinding mode
  // Draw AI paths
  drawAIPaths();

  // Draw units on top of everything else
  drawUnits();
  pop();

  // Update progress bar based on the current state duration
  if (currentState === GameState.DECISIONS_MADE) {
    let progress = (millis() - decisionsMadeTime) / decisionDelay;
    progressBar.setProgress(progress);
  } else if (currentState === GameState.ANIMATING) {
    let progress = (millis() - animationStartTime) / animationManager.totalAnimationDuration;
    progressBar.setProgress(progress);
  }

  // Draw the progress bar
  progressBar.draw(progressBar.progress);

  panelManager.updatePanels();
  delaySlider.update();
  delaySlider.display();
  delayMultiplier = delaySlider.value;

}
