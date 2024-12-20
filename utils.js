let hexGrid = new Map();

let terrainColors = {};

function initializeGrid(radius) {
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) <= radius) {
        let hex = new Hex(null, q, r);
        hexGrid.set(hex.getKey(), hex);
      }
    }
  }
}

function getHex(q, r) {
  return hexGrid.get(`${q},${r}`);
}

function hexToPixel(hex) {
  let size = 30; // Hex size
  let x = size * 3/2 * hex.q;
  let y = size * sqrt(3) * (hex.r + hex.q / 2);
  return { x, y };
}

function pixelToHex(x, y) {
  let size = 30;
  let q = (2/3 * x) / size;
  let r = (-1/3 * x + sqrt(3)/3 * y) / size;
  return roundHex(q, r);
}

function roundHex(q, r) {
  let s = -q - r;
  let qRounded = Math.round(q);
  let rRounded = Math.round(r);
  let sRounded = Math.round(s);

  let qDiff = Math.abs(qRounded - q);
  let rDiff = Math.abs(rRounded - r);
  let sDiff = Math.abs(sRounded - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    qRounded = -rRounded - sRounded;
  } else if (rDiff > sDiff) {
    rRounded = -qRounded - sRounded;
  }

  return getHex(qRounded, rRounded);
}

function getHexNeighbors(hex) {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  return directions.map(dir => getHex(hex.q + dir.q, hex.r + dir.r)).filter(neighbor => neighbor);
}

function registerTerrainType(type, colorValue) {
  terrainColors[type] = colorValue;
}

function getTerrainColor(type) {
  return terrainColors[type] || color(200); // Default color if type is not found
}

function getOutlineColor() {
  return color(128, 0, 128); // Nice purple color
}