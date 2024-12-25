const BASE_ANIMATION_DURATION = 1000;
let animations = [];
let totalAnimationDuration = BASE_ANIMATION_DURATION;

function handleAnimations() {
  animations.forEach(animation => {
    animation.update();
  });
  animations = animations.filter(animation => {
    const isComplete = animation.isComplete();
    if (isComplete) {
      logAnimationDetails(animation, 'Ended');
    }
    return !isComplete;
  });
}

function animationsComplete() {
  return animations.length === 0;
}

function logAnimationDetails(animation, event) {
  const { constructor: { name }, start, end, duration, startTime, unit } = animation;
  const currentTime = millis();
  console.log(`[${currentTime}] ${event}: ${name}`);
  console.log(`  From: (${start.q}, ${start.r}) To: (${end.q}, ${end.r})`);
  console.log(`  Duration: ${duration}ms (started at ${startTime}ms)`);
  if (unit) {
    console.log(`  Unit: ID=${unit.id}, Type=${unit.type}, Position=(${unit.q},${unit.r})`);
  }
}