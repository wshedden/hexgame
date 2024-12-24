let animations = [];

function handleAnimations() {
  console.log("Handling animations...");
  // Update and draw animations
  animations.forEach(animation => {
    console.log("Updating animation:", animation);
    animation.update();
  });
  animations = animations.filter(animation => {
    const isComplete = animation.isComplete();
    console.log("Animation complete:", isComplete, animation);
    return !isComplete;
  });
  console.log("Remaining animations:", animations.length);
}

function animationsComplete() {
  return animations.length === 0;
}
