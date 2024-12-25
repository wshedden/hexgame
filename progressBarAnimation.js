class ProgressBarAnimation extends Animation {
  constructor(start, end, duration) {
    super(start, end, duration);
    this.text = ''; // Initialize text property
  }

  setDuration(duration) {
    this.duration = duration;
    this.startTime = millis(); // Reset the start time
    // print(`Progress bar duration set to ${duration}ms`);
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
}