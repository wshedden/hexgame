class ProgressBarAnimation extends Animation {
  constructor(start, end, duration) {
    super(start, end, duration);
  }

  draw(progress) {
    // console.log('Drawing progress bar with progress:', progress); // Commented out
    let barWidth = lerp(this.start, this.end, progress);
    fill(255, 0, 0); // Red color for the progress bar
    rect(width - barWidth - 10, height - 30 - 300, barWidth, 20); // Draw the progress bar at the bottom right, up 300 pixels
  }
}