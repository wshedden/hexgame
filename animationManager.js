class AnimationManager {
  constructor() {
    this.unitAnimationQueues = new Map();
  }

  addAnimation(unit, animation) {
    if (!this.unitAnimationQueues.has(unit)) {
      this.unitAnimationQueues.set(unit, new AnimationQueue());
    }
    this.unitAnimationQueues.get(unit).enqueue(animation);

    // If the unit is not currently animating, start the next animation
    if (this.unitAnimationQueues.get(unit).queue.length === 1) {
      animations.push(animation);
    }
  }

  processNextAnimation(unit) {
    const queue = this.unitAnimationQueues.get(unit);
    if (queue) {
      queue.dequeue(); // Remove the completed animation
      if (!queue.isEmpty()) {
        animations.push(queue.queue[0]); // Start the next animation
      }
    }
  }
}

