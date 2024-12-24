class ProgressBarAnimation extends Animation {
  constructor(start, end, duration) {
    super(start, end, duration);
  }

  draw(progress) {
    let barWidth = lerp(this.start, this.end, progress);
    fill(255, 0, 0); // Red color for the progress bar
    rect(10, height - 30, barWidth, 20); // Draw the progress bar at the bottom
  }
}