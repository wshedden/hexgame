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
    // Draw the unit at the interpolated position
    drawUnit(currentX, currentY, this.unit, this.unit.size);
  }
}