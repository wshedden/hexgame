class Player {
  constructor(id, color) {
    this.id = id;
    this.color = color;
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
  if (hex && !hex.unit) {
    hex.unit = unit;
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