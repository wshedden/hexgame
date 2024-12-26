class Slider {
  constructor(x, y, w, min, max, value, step = 0.01) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.min = min;
    this.max = max;
    this.value = value;
    this.step = step;
    this.dragging = false;
    this.handleRadius = 10;
    this.trackHeight = 6;
    this.trackColor = color(200);
    this.handleColor = color(50, 150, 255);
    this.handleHoverColor = color(100, 200, 255);
    this.handleActiveColor = color(0, 100, 200);
    this.backgroundColor = color(0, 0, 0, 200);
    this.textColor = color(255);
    this.padding = 10;
    this.textSize = 16;
  }

  display() {
    // Draw background
    fill(this.backgroundColor);
    noStroke();
    rect(this.x - this.padding, this.y - this.padding - this.textSize, this.w + this.padding * 2, this.handleRadius * 2 + this.trackHeight + this.padding * 2, 10);

    // Draw text
    fill(this.textColor);
    textSize(this.textSize);
    textAlign(CENTER, BOTTOM);
    let textVal = "Delay multiplier: " + this.value.toFixed(2);
    text(textVal, this.x + this.w / 2, this.y - this.padding);

    // Draw track
    strokeWeight(this.trackHeight);
    stroke(this.trackColor);
    line(this.x, this.y, this.x + this.w, this.y);

    // Draw handle
    let handleX = map(this.value, this.min, this.max, this.x, this.x + this.w);
    noStroke();
    fill(this.dragging ? this.handleActiveColor : this.handleColor);
    ellipse(handleX, this.y, this.handleRadius * 2);

    // Handle hover effect
    if (this.isMouseOverHandle()) {
      fill(this.handleHoverColor);
      ellipse(handleX, this.y, this.handleRadius * 2);
    }
  }

  isMouseOverHandle() {
    let handleX = map(this.value, this.min, this.max, this.x, this.x + this.w);
    return dist(mouseX, mouseY, handleX, this.y) < this.handleRadius;
  }

  mousePressed() {
    if (mouseX >= this.x && mouseX <= this.x + this.w && mouseY >= this.y - this.handleRadius && mouseY <= this.y + this.handleRadius) {
      this.dragging = true;
      this.updateValueFromMouse();
    }
  }

  mouseReleased() {
    this.dragging = false;
  }

  update() {
    if (this.dragging) {
      this.updateValueFromMouse();
    }
  }

  updateValueFromMouse() {
    let newValue = map(mouseX, this.x, this.x + this.w, this.min, this.max);
    this.value = constrain(newValue, this.min, this.max);
  }

  keyPressed() {
    if (keyCode === LEFT_ARROW) {
      this.value = max(this.min, this.value - this.step);
    } else if (keyCode === RIGHT_ARROW) {
      this.value = min(this.max, this.value + this.step);
    }
  }
}