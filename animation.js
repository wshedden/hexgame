let animations = [];

function handleAnimations() {
  // Update and draw animations
  animations.forEach(animation => animation.update());
  animations = animations.filter(animation => !animation.isComplete());
}

function animationsComplete() {
  return animations.length === 0;
}

export { animations, handleAnimations, animationsComplete };