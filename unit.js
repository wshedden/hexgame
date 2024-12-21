class Unit {
  constructor(id, type, health, attack, defence, playerColour, movement) {
    this.id = id;
    this.type = type;
    this.health = health;
    this.attack = attack;
    this.defence = defence;
    this.movement = movement; // Add movement attribute
    if (type === 'settler') {
      this.colour = lerpColor(color(0, 255, 0), color(playerColour[0], playerColour[1], playerColour[2]), 0.5); // Interpolated colour for settlers
    } else if (type === 'farmer') {
      this.colour = lerpColor(color(255, 215, 0), color(playerColour[0], playerColour[1], playerColour[2]), 0.5); // Blended colour for farmers
    } else {
      this.colour = color(playerColour[0], playerColour[1], playerColour[2]);
    }
    this.size = 20; // Default size
  }
}

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
  fill(unit.colour);
  stroke(unit.colour); // Set stroke to the player color
  strokeWeight(2); // Set a consistent stroke weight

  if (unit.id === 1) {
    // Draw circle for Player 1
    ellipse(0, 0, size, size);
  } else if (unit.id === 2) {
    // Draw triangle for Player 2
    let triangleSize = size * 0.8; // Make the triangle slightly smaller
    beginShape();
    for (let i = 0; i < 3; i++) {
      let angle = TWO_PI / 3 * i - HALF_PI;
      let vx = triangleSize * cos(angle);
      let vy = triangleSize * sin(angle);
      vertex(vx, vy);
    }
    endShape(CLOSE);
  }
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