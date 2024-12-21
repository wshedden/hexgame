function drawHex(x, y, size, type, textValue, claimedBy, colour) {
  push();
  translate(x, y);
  stroke(getOutlineColour()); // Use the purple outline colour

  // Determine the fill color
  if (claimedBy) {
    // player[claimedBy].colour is a color
    fill(players[claimedBy-1].colour);
    console.log(`drawHex: (${x}, ${y}) claimedBy = ${claimedBy}`);
  } else {
    fill(getTerrainColour(type));
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
const padding = 10;
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
