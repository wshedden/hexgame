class Unit {
    constructor(type, health) {
      this.type = type;
      this.health = health;
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
  
  function drawUnit(x, y, unit) {
    push();
    translate(x, y);
    fill(255, 0, 0);
    ellipse(0, 0, 20, 20);
    pop();
  }
  