BASE_ANIMATION_DURATION = 20;

class Animation {
  constructor(type, unit, start, end, duration, onComplete) {
    this.type = type;
    this.unit = unit;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.progress = 0;
    this.onComplete = onComplete;
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
    let startPos = hexToPixel(this.start);
    let endPos = hexToPixel(this.end);
    let currentX = lerp(startPos.x, endPos.x, progress);
    let currentY = lerp(startPos.y, endPos.y, progress);
    push();
    translate(width / 2, height / 2);
    drawUnit(currentX, currentY, this.unit, 18);
    pop();
  }

  drawUnitPlacement(progress) {
    let pos = hexToPixel(this.start);
    let size = lerp(30, 40, progress); // Increase size from 30 to 40
    push();
    translate(width / 2, height / 2);
    stroke(255, 215, 0); // Gold color for highlighting
    strokeWeight(4);
    fill(255, 223, 0, 100); // Semi-transparent gold fill
    ellipse(pos.x, pos.y, size + 10, size + 10); // Golden outline
    drawUnit(pos.x, pos.y, this.unit, size);
    pop();
  }

  drawProgressBar(progress) {
    let barWidth = lerp(this.start, this.end, progress);
    let playerColor = color(players[currentPlayerIndex].colour[0], players[currentPlayerIndex].colour[1], players[currentPlayerIndex].colour[2]);
    let hexGridEndX = 1500;
    let canvasWidth = width;
    let barX = hexGridEndX + (canvasWidth - hexGridEndX - this.end) / 2;
    let barY = height - 30 - 300;
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

  isComplete() {
    return this.complete;
  }
}

class AnimationManager {
  constructor() {
    this.animations = [];
    this.totalAnimationDuration = 0;
  }

  addAnimation(unit, animation) {
    unit.isAnimating = true;
    animation.isAnimating = true; // Set isAnimating to true
    this.animations.push(animation);
    this.totalAnimationDuration += animation.duration;
    // this.logAnimationDetails(animation, 'Created');
  }

  handleAnimations() {
    if (this.animations.length > 0) {
      let animation = this.animations[0];
      animation.update();
      if (animation.isComplete()) {
        this.animations.shift();
        this.handleNextAnimation();
      }
    }
  }

  handleNextAnimation() {
    if (this.animations.length > 0) {
      let nextAnimation = this.animations[0];
      nextAnimation.startTime = millis(); // Set startTime when the animation begins
      nextAnimation.isAnimating = true; // Set isAnimating to true for the next animation
      // this.logAnimationDetails(nextAnimation, 'Started');
    }
  }

  animationsComplete() {
    return this.animations.length === 0;
  }

  logAnimationDetails(animation, event) {
    const { type, start, end, duration, startTime, unit } = animation;
    const currentTime = millis();
    console.log(`[${currentTime}] ${event}: ${type}`);
    console.log(`  From: (${start.q}, ${start.r}) To: (${end.q}, ${end.r})`);
    console.log(`  Duration: ${duration}ms (started at ${startTime}ms)`);
    if (unit) {
      console.log(`  Unit: ID=${unit.id}, Type=${unit.type}, Position=(${unit.q},${unit.r})`);
    }
  }
}

class ProgressBarAnimation extends Animation {
  constructor(start, end, duration) {
    super('progressBar', null, start, end, duration, null);
    this.text = ''; // Initialize text property
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
}