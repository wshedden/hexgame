let animations = [];

function handleAnimations() {
  // Update and draw animations
  animations.forEach(animation => animation.update());
  animations = animations.filter(animation => !animation.isComplete());
}

function animationsComplete() {
  return animations.length === 0;
}

class Animation {
  constructor(start, end, duration) {
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.startTime = millis();
  }

  update() {
    let elapsedTime = millis() - this.startTime;
    let progress = min(elapsedTime / this.duration, 1);
    this.draw(progress);
    if (progress === 1) {
      this.complete = true;
    }
  }

  draw(progress) {
    // Implement the drawing logic for the animation
  }

  isComplete() {
    return this.complete;
  }
}