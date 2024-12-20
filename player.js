class Player {
  constructor(id, color) {
    this.id = id;
    this.color = color;
    this.occupiedHexes = [];
  }

  addRandomUnit() {
    let emptyHexes = Array.from(hexGrid.values()).filter(hex => !hex.unit);
    if (emptyHexes.length > 0) {
      let randomHex = random(emptyHexes);
      let newUnit = new Unit(this.id, 'soldier', 100, this.color);
      placeUnit(randomHex.q, randomHex.r, newUnit);

      console.log(`Player ${this.id} added unit to Hex: (${randomHex.q}, ${randomHex.r})`);
    }
  }
}

function placeUnit(q, r, unit) {
  let hex = getHex(q, r);
  if (!hex) return;

  // Check if it's the first turn
  let isFirstTurn = (turnNumber === 1);

  // Check if the hex is adjacent to an occupied hex
  let neighbors = getHexNeighbors(hex);
  let isAdjacentToOccupiedHex = neighbors.some(neighbor => neighbor.occupiedBy === unit.id);

  if ((isFirstTurn || isAdjacentToOccupiedHex) && !hex.unit) {
    hex.unit = unit;
    hex.occupiedBy = unit.id;
    let player = players.find(p => p.id === unit.id);
    if (player) {
      player.occupiedHexes.push(hex);
    }
  } else {
    console.log(`Cannot place unit at (${q}, ${r}). It must be adjacent to an occupied hex.`);
  }
}

function drawUnits() {
  hexGrid.forEach((hex) => {
    if (hex.unit) {
      let { x, y } = hexToPixel(hex);
      drawUnit(x, y, hex.unit);
    }
  });
}