function drawUnitShape(type, size) {
  switch (type) {
    case 'soldier':
      drawSoldierShape(size);
      break;
    case 'farmer':
      drawFarmerShape(size);
      break;
    case 'settler':
      drawSettlerShape(size);
      break;
    case 'builder':
      drawBuilderShape(size - 3); // Make the builder shape smaller
      break;
    default:
      drawDefaultShape(size);
      break;
  }
}

function drawSoldierShape(size) {
  ellipse(0, 0, size, size); // Circle for soldier
}

function drawFarmerShape(size) {
  rectMode(CENTER);
  rect(0, 0, size, size); // Square for farmer
}

function drawSettlerShape(size) {
  beginShape();
  for (let i = 0; i < 3; i++) {
    let angle = TWO_PI / 3 * i - HALF_PI;
    let vx = (size - 5) * cos(angle); // Make the triangle smaller
    let vy = (size - 5) * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE); // Triangle for settler
}

function drawBuilderShape(size) {
  beginShape();
  for (let i = 0; i < 5; i++) {
    let angle = TWO_PI / 5 * i - HALF_PI;
    let vx = (size - 5) * cos(angle); // Make the pentagon smaller
    let vy = (size - 5) * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE); // Pentagon for builder
}

function drawDefaultShape(size) {
  ellipse(0, 0, size, size); // Default to circle
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