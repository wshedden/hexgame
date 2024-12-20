class Unit {
  constructor(id, type, health, color = [255, 0, 0]) {
    this.type = type;
    this.health = health;
    this.color = color;
    this.id = id;
  }
}

function placeUnit(q, r, unit) {
  let hex = getHex(q, r);
  hex.occupiedBy = unit.id;
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

// function drawUnit(x, y, unit) {
//   push();
//   translate(x, y);
//   fill(unit.color);
//   ellipse(0, 0, 20, 20);
//   pop();
// }