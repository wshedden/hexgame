let hexGrid = new Map();

let terrainColours = {};

let claimableTiles = new Set();
let offsetX = 0;
let offsetY = 0;

function initialiseGrid(radius) {
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) <= radius) {
        let hex = new Hex(null, q, r);
        hexGrid.set(hex.getKey(), hex);
        if (hex.type !== 'water') {
          claimableTiles.add(hex.getKey());
        }
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

function getHexNeighbours(hex) {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  return directions.map(dir => getHex(hex.q + dir.q, hex.r + dir.r)).filter(neighbour => neighbour);
}

function isAdjacent(hex1, hex2) {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  return directions.some(dir => hex1.q + dir.q === hex2.q && hex1.r + dir.r === hex2.r);
}

function registerTerrainType(type, colourValue) {
  terrainColours[type] = colourValue;
}

function getOutlineColour() {
  return color(128, 0, 128); // Nice purple color
}

function getTerrainColor(type, fertility, noiseValue) {
  switch (type) {
    case 'grass':
      return lerpColor(color(100, 200, 100), color(50, 150, 50), fertility); // Example colors for grass
    case 'desert':
      return lerpColor(color(207, 169, 56), color(255, 255, 224), fertility * 4); // Lerp from dark tan to light yellow
    case 'mountain':
      return lerpColor(color(64, 64, 64), color(192, 192, 192), fertility); // Lerp from dark grey to light grey
    case 'forest':
      return lerpColor(color(34, 139, 34), color(0, 100, 0), fertility); // Example colors for forest
    case 'snow':
      return lerpColor(color(255, 250, 250), color(200, 200, 200), 1 - fertility); // Lerp from white to light grey, grey for more fertile
    case 'water':
      return lerpColor(color(0, 0, 139), color(100, 150, 255), noiseValue * 2); // Lerp from dark blue to brighter blue based on noise value
    default:
      return color(200); // Default color
  }
}