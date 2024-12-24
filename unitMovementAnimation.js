class UnitMovementAnimation extends Animation {
  constructor(unit, startHex, endHex, duration) {
    super(startHex, endHex, duration);
    this.unit = unit;
  }

  draw(progress) {
    let startPos = hexToPixel(this.start);
    let endPos = hexToPixel(this.end);
    let currentX = lerp(startPos.x, endPos.x, progress);
    let currentY = lerp(startPos.y, endPos.y, progress);

    // Translate the drawing by width/2 and height/2
    push();
    translate(width / 2, height / 2);

    // Draw the unit as a circle at the interpolated position
    fill(this.unit.colour);
    noStroke();
    ellipse(currentX, currentY, this.unit.size, this.unit.size);

    pop();
  }
}