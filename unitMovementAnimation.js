class UnitMovementAnimation extends Animation {
  constructor(unit, startHex, endHex, duration, onComplete) {
    super(startHex, endHex, duration);
    this.unit = unit;
    this.onComplete = onComplete;
    this.unit.isAnimating = true; // Set isAnimating to true when the animation starts
    print(`Starting animation for unit ${unit.id} from (${startHex.q}, ${startHex.r}) to (${endHex.q}, ${endHex.r}) with duration ${duration}ms`);
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
    drawUnit(currentX, currentY, this.unit, this.unit.size);

    pop();
  }

  update() {
    super.update();
    // print(`Animation progress for unit ${this.unit.id}: ${this.progress * 100}%`);
    if (this.isComplete()) {
      this.unit.isAnimating = false; // Set isAnimating to false when the animation completes
    //   print(`Animation complete for unit ${this.unit.id}`);
      if (this.onComplete) {
        this.onComplete();
      }
    }
  }
}