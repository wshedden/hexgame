function drawHex(x, y, size, type, textValue, claimedBy, colour) {
  push();
  translate(x, y);
  stroke(getOutlineColour()); // Use the purple outline colour
  strokeWeight(1); // Set stroke weight

  // Use the fertility-based color but if it's claimed then lerp it with the claimed colour
  if (claimedBy) {
    // Get player colour and convert it to p5.Color object
    let playerColour = color(players[claimedBy - 1].colour[0], players[claimedBy - 1].colour[1], players[claimedBy - 1].colour[2]);
    fill(lerpColor(colour, playerColour, 0.6));
  } else {
    fill(colour);
  }

  // Determine the stroke color
  if (claimedBy) {
    stroke(players[claimedBy - 1].colour);
    strokeWeight(4);
  }

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
    stroke(players[claimedBy-1].colour);
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

function getOutlineColour() {
  return color(128, 0, 128); // Nice purple color
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
  translate(width / 2, height / 2); // Translate the origin to the centre of the canvas
  hexGrid.forEach((hex) => {
    let { x, y } = hexToPixel(hex);
    drawHex(x, y, 30, hex.type, hex.text, hex.claimedBy, hex.colour); // Pass the colour attribute
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
  return neighbours.filter(neighbour => neighbour.unit && neighbour.unit.id !== hex.unit.id);
}

// Add the drawing functions from unit.js
function drawUnits() {
  push();
  translate(width / 2, height / 2); // Translate the origin to the centre of the canvas
  hexGrid.forEach((hex) => {
    if (hex.units.length > 0) {
      let { x, y } = hexToPixel(hex);
      drawHexUnits(x, y, hex.units);
    }
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

  // Lerp the unit color with the player color
  let playerColour = color(players[unit.id - 1].colour[0], players[unit.id - 1].colour[1], players[unit.id - 1].colour[2]);
  let unitColour = lerpColor(unit.colour, playerColour, 0.8);

  // Set the fill and stroke
  fill(unitColour);
  stroke(lerpColor(playerColour, color(0), 0.5)); // Darker version of the player color
  strokeWeight(2);

  // Draw the correct shape for the unit type
  drawUnitShape(unit.type, size);

  pop();
}

function animateUnitMovement(attackerHex, defenderHex, duration = 1000) {
  let startTime = millis();
  let startPos = hexToPixel(attackerHex);
  let endPos = hexToPixel(defenderHex);

  function updateAnimation() {
    let currentTime = millis();
    let elapsedTime = currentTime - startTime;
    let progress = min(elapsedTime / duration, 1);

    let currentX = lerp(startPos.x, endPos.x, progress);
    let currentY = lerp(startPos.y, endPos.y, progress);

    // Clear the previous frame
    background(20);

    // Draw the grid and units
    drawGrid();
    drawUnits();

    // Draw the moving unit
    push();
    translate(currentX, currentY);
    fill(attackerHex.unit.colour);
    if (attackerHex.unit.id === 1) {
      ellipse(0, 0, 20, 20); // Circle for Player 1
    } else if (attackerHex.unit.id === 2) {
      beginShape(); // Triangle for Player 2
      for (let i = 0; i < 3; i++) {
        let angle = TWO_PI / 3 * i - HALF_PI;
        let vx = 20 * cos(angle);
        let vy = 20 * sin(angle);
        vertex(vx, vy);
      }
      endShape(CLOSE);
    }
    pop();

    if (progress < 1) {
      requestAnimationFrame(updateAnimation);
    } else {
      // Move the unit to the defender's hex
      defenderHex.unit = attackerHex.unit;
      defenderHex.occupiedBy = attackerHex.unit.id;
      attackerHex.unit = null;
      attackerHex.occupiedBy = null;
    }
  }

  updateAnimation();
}

function drawUnitPath(path, playerColour) {
  if (path.length > 1) {
    push();
    translate(width / 2, height / 2); // Translate the origin to the center of the canvas
    stroke(playerColour); // Use the player's color for the path
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
    translate(width / 2, height / 2); // Translate the origin to the center of the canvas
    const greenColor = color(0, 255, 0); // Green color for the path
    stroke(greenColor);
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
    drawArrowhead(x1, y1, x2, y2, [0, 255, 0]); // Pass green color as an array

    pop();
  }
}