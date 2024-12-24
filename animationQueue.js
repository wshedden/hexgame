class AnimationQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(animation) {
    this.queue.push(animation);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}