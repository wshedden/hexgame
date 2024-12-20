class Unit {
  constructor(id, type, health, attack, defense, color = [255, 0, 0]) {
    this.id = id;
    this.type = type;
    this.health = health;
    this.attack = attack;
    this.defense = defense;
    this.color = color;
  }
}

// function placeUnit(q, r, unit) {
//   let hex = getHex(q, r);
//   hex.occupiedBy = unit.id;
//   if (hex && !hex.unit) {
//     hex.unit = unit;
//   }
// }

function drawUnits() {
  push();
  translate(width / 2, height / 2); // Translate the origin to the center of the canvas
  hexGrid.forEach((hex) => {
    if (hex.unit) {
      let { x, y } = hexToPixel(hex);
      drawUnit(x, y, hex.unit);
    }
  });
  pop();
}

function drawUnit(x, y, unit) {
  push();
  translate(x, y);
  fill(unit.color);
  ellipse(0, 0, 20, 20);
  pop();
}