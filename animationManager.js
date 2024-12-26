BASE_ANIMATION_DURATION = 20;

class Animation {
  constructor(type, unit, hex, duration, path = []) {
    this.type = type;
    this.unit = unit;
    this.hex = hex;
    this.duration = duration;
    this.progress = 0;
    this.path = path; // Store the path
    this.onComplete = type === 'unitMovement' ? () => {
      this.unit.hex = this.hex;
      this.hex.addUnit(this.unit);
    } : null;
    this.started = false;
    this.complete = false;
    this.isAnimating = false;
  }

  update() {
    let elapsedTime = millis() - this.startTime;
    this.progress = min(elapsedTime / this.duration, 1);
    this.draw(this.progress);
    if (this.progress === 1) {
      this.complete = true;
      if (this.onComplete) {
        this.onComplete();
      }
      if (this.type === 'unitMovement' || this.type === 'unitPlacement') {
        this.unit.isAnimating = false;
      }
    }
    if (!this.started && this.type === 'unitMovement') {
      this.unit.hex.removeUnit(this.unit);
      this.started = true;
    }
  }

  draw(progress) {
    if (this.type === 'unitMovement') {
      this.drawUnitMovement(progress);
    } else if (this.type === 'unitPlacement') {
      this.drawUnitPlacement(progress);
    } else if (this.type === 'progressBar') {
      this.drawProgressBar(progress);
    }
  }

  drawUnitMovement(progress) {
    let startPos = hexToPixel(this.unit.hex);
    let endPos = hexToPixel(this.hex);
    let currentX = lerp(startPos.x, endPos.x, progress);
    let currentY = lerp(startPos.y, endPos.y, progress);

    // Draw the path
    if (this.path.length > 1) {
      let movesToShow = this.unit.animationsLeft;
      let pathToShow = this.path.slice(0, movesToShow + 1); // Slice the path based on animationsLeft

      push();
      stroke(this.unit.colour);
      strokeWeight(2);
      noFill();
      beginShape();
      // Start the path from the current position of the unit
      vertex(currentX, currentY);
      pathToShow.forEach((hex, index) => {
        if (index > 0) { // Skip the first hex as we already added the current position
          let { x, y } = hexToPixel(hex);
          vertex(x, y);
        }
      });
      endShape();
      // Draw the arrowhead at the final line segment
      if (pathToShow.length > 1) {
        let lastHex = pathToShow[pathToShow.length - 1];
        let secondLastHex = pathToShow[pathToShow.length - 2];
        let { x: x1, y: y1 } = hexToPixel(secondLastHex);
        let { x: x2, y: y2 } = hexToPixel(lastHex);
        drawArrowhead(x1, y1, x2, y2, this.unit.colour);
      }
      pop();
    }

    drawUnit(currentX, currentY, this.unit, 18);
  }

  drawUnitPlacement(progress) {
    let pos = hexToPixel(this.hex);
    let size = lerp(1, 35, progress); // Increase size from 30 to 40
    stroke(255, 215, 0); // Gold color for highlighting
    strokeWeight(4);
    fill(255, 223, 0, 100); // Semi-transparent gold fill
    ellipse(pos.x, pos.y, size + 10, size + 10); // Golden outline
    drawUnit(pos.x, pos.y, this.unit, this.unit.size);
  }

  isComplete() {
    return this.complete;
  }

  initialise() {
    this.startTime = millis();
    if (this.type === "unitMovement") {
      // console.log(`Starting movement animation for unit ${this.unit.playerID} from (${this.unit.q}, ${this.unit.r}) to (${this.hex.q}, ${this.hex.r})`);
      // this.unit.hex.removeUnit(this.unit);    
    } else if (this.type === "unitPlacement") {
      this.unit.hex = this.hex;
    }
  }
}

class AnimationManager {
  constructor() {
    this.animations = [];
    this.totalAnimationDuration = 0;
  }
    
  addAnimation(unit, animation) {
    unit.animationsLeft += 1; // Increment animationsLeft
    this.animations.push(animation);
    this.totalAnimationDuration += animation.duration;
    if (this.animations.length === 1) {
      this.startAnimation(animation);
    }
  }

  startAnimation(animation) {
    animation.unit.isAnimating = true;
    animation.isAnimating = true;
    animation.initialise();
  }

  handleAnimations() {
    if (this.animations.length > 0) {
      let animation = this.animations[0];
      animation.update();
      if (animation.isComplete()) {
        animation.unit.animationsLeft -= 1; // Decrement animationsLeft
        this.animations.shift();
        if (this.animations.length > 0) {
          this.startAnimation(this.animations[0]);
        }
      }
    }
  }

  animationsComplete() {
    return this.animations.length === 0;
  }
}

class ProgressBarAnimation extends Animation {
  constructor(start, end, duration) {
    super('progressBar', null, null, duration, null);
    this.text = ''; // Initialize text property
    this.start = start;
    this.end = end;
  }

  setDuration(duration) {
    this.duration = duration;
    this.startTime = millis(); // Reset the start time
  }

  setText(text) {
    this.text = text;
  }

  draw(progress) {
    this.drawProgressBar(progress);
  }

  setProgress(progress) {
    this.progress = progress;
  }

  drawProgressBar(progress) {
    let barWidth = lerp(this.start, this.end, progress);
    let playerColor = color(players[currentPlayerIndex].colour[0], players[currentPlayerIndex].colour[1], players[currentPlayerIndex].colour[2]);
    let hexGridEndX = 1500;
    let canvasWidth = width;
    let barX = hexGridEndX + (canvasWidth - hexGridEndX - this.end) / 2;
    let barY = height - 30 - 50;
    stroke(255);
    strokeWeight(2);
    fill(0, 0, 0, 150);
    rect(barX, barY, this.end, 20, 10);
    noStroke();
    fill(playerColor);
    rect(barX, barY, barWidth, 20, 10);
    fill(255);
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(this.text, barX + this.end / 2, barY - 5);
  }
}