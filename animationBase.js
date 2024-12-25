class Animation {
  constructor(start, end, duration) {
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.startTime = millis();
    this.progress = 0; // Add progress property
    this.manualProgress = false; // Flag to indicate manual progress control
    this.complete = false; // Track completion status
  }

  update() {
    if (!this.manualProgress) {
      let elapsedTime = millis() - this.startTime;
      this.progress = min(elapsedTime / this.duration, 1);
    }

    if(this.progress === 0) {
        logAnimationDetails(this, 'Started');
    }
    // console.log('Updating animation with progress:', this.progress); // Commented out
    this.draw(this.progress);
    if (this.progress === 1) {
      this.complete = true;
    }
  }

  setProgress(progress) {
    this.progress = constrain(progress, 0, 1);
    this.manualProgress = true;
    this.draw(this.progress);
  }

  draw(progress) {
    // Implement the drawing logic for the animation
  }

  isComplete() {
    return this.complete;
  }
}