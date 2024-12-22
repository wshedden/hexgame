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