function drawHex(x, y, size, type, textValue, unit) {
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

  // Display the text inside the hex
  // fill(255);
  // stroke(0);
  // strokeWeight(1);
  // textSize(10);
  // textAlign(CENTER, CENTER);
  // text(textValue, 0, 0);

  // Draw a dot if there's a unit
  if (unit) {
    fill(255, 0, 0); // Red color for the unit
    noStroke();
    ellipse(0, 0, 10, 10); // Draw a dot
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
  pop();
}

function mousePressed() {
  let clickedHex = pixelToHex(mouseX - width / 2, mouseY - height / 2);
  if (clickedHex) {
    console.log(`Clicked Hex: (${clickedHex.q}, ${clickedHex.r})`);
    console.log(`Type: ${clickedHex.type}`);
    console.log(`Noise Value: ${clickedHex.noiseValue}`);
    console.log(`Text: ${clickedHex.text}`);
    if (clickedHex.unit) {
      console.log(`Unit Type: ${clickedHex.unit.type}`);
      console.log(`Unit Health: ${clickedHex.unit.health}`);
    }
  }
}
