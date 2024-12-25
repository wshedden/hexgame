BASE_ANIMATION_DURATION = 1000; // 1 second

class Animation {
  constructor(type, unit, start, end, duration, onComplete) {
    this.type = type;
    this.unit = unit;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.startTime = millis();
    this.progress = 0;
    this.onComplete = onComplete;
    this.complete = false;
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
    }
  }

  draw(progress) {
    if (this.type === 'unitMovement') {
      let startPos = hexToPixel(this.start);
      let endPos = hexToPixel(this.end);
      let currentX = lerp(startPos.x, endPos.x, progress);
      let currentY = lerp(startPos.y, endPos.y, progress);
      push();
      translate(width/2, height/2);
      drawUnit(currentX, currentY, this.unit, 18);
      pop ();
    } else if (this.type === 'progressBar') {
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
  }

  isComplete() {
    return this.complete;
  }
}

class AnimationManager {
  constructor() {
    this.unitAnimationQueues = new Map();
    this.animations = [];
    this.totalAnimationDuration = 0;
  }

  addAnimation(unit, animation) {
    if (!this.unitAnimationQueues.has(unit)) {
      this.unitAnimationQueues.set(unit, []);
    }
    this.unitAnimationQueues.get(unit).push(animation);
    this.logAnimationDetails(animation, 'Created');

    if (this.unitAnimationQueues.get(unit).length === 1) {
      this.animations.push(animation);
      this.totalAnimationDuration += animation.duration;
      this.logAnimationDetails(animation, 'Started');
    }
  }

  processNextAnimation(unit) {
    const queue = this.unitAnimationQueues.get(unit);
    if (queue) {
      queue.shift(); // Remove the completed animation
      if (queue.length > 0) {
        this.animations.push(queue[0]); // Start the next animation
        this.logAnimationDetails(queue[0], 'Started');
      }
    }
  }

  handleAnimations() {
    this.animations.forEach(animation => animation.update());
    this.animations = this.animations.filter(animation => !animation.isComplete());
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
    let barWidth = lerp(this.start, this.end, progress);
    let playerColor = color(players[currentPlayerIndex].colour[0], players[currentPlayerIndex].colour[1], players[currentPlayerIndex].colour[2]);

    // Calculate the position and size of the progress bar
    let hexGridEndX = 1500; // Example value, adjust based on actual hex grid end
    let canvasWidth = width;
    let barX = hexGridEndX + (canvasWidth - hexGridEndX - this.end) / 2;
    let barY = height - 30 - 300;

    // Draw the border
    stroke(255); // White border
    strokeWeight(2);
    fill(0, 0, 0, 150); // Semi-transparent black background
    rect(barX, barY, this.end, 20, 10); // Border with rounded corners

    // Draw the progress bar
    noStroke();
    fill(playerColor);
    rect(barX, barY, barWidth, 20, 10); // Progress bar with rounded corners

    // Draw the text above the progress bar
    fill(255);
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(this.text, barX + this.end / 2, barY - 5);
  }

  setProgress(progress) {
    this.progress = progress;
  }
}