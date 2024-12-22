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
      drawBuilderShape(size-3);
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
    let vx = size * cos(angle);
    let vy = size * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE); // Triangle for settler
}

function drawBuilderShape(size) {
  beginShape();
  for (let i = 0; i < 5; i++) {
    let angle = TWO_PI / 5 * i - HALF_PI;
    let vx = size * cos(angle);
    let vy = size * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE); // Pentagon for builder
}

function drawDefaultShape(size) {
  ellipse(0, 0, size, size); // Default to circle
}