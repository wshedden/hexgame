const GameState = {
  INIT: 'init',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
};

let currentState = GameState.INIT;
let currentPlayerIndex = 0;
let turnDuration = 200;
let turnStartTime;
let turnNumber = 1; // Initialize turn number
let speedMultiplier = 1.0;

const players = [
  new Player(1, [139, 0, 0]), // Dark red for player 1
  new Player(2, [0, 0, 139])  // Dark blue for player 2
];

function setState(newState) {
  currentState = newState;
  console.log(`Game state changed to: ${currentState}`);
  if (newState === GameState.PLAYING) {
    turnStartTime = millis();
  }
}

function getState() {
  return currentState;
}

function drawGameState() {
  switch (currentState) {
    case GameState.INIT:
      drawInitState();
      break;
    case GameState.PLAYING:
      drawPlayingState();
      break;
    case GameState.PAUSED:
      drawPausedState();
      break;
    case GameState.GAME_OVER:
      drawGameOverState();
      break;
  }
}

function drawInitState() {
  // Draw initialization screen
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Press any key to start', width / 2, height / 2);
}

function drawPlayingState() {
  // Draw the playing state
  drawGrid();
  drawUnits();

  // Check if the turn duration has elapsed
  if (millis() - turnStartTime > turnDuration / speedMultiplier) {
    switchPlayer();
    turnStartTime = millis();
  }
}

function drawPausedState() {
  // Draw the playing state behind the pause overlay
  drawGrid();
  drawUnits();
}

function drawGameOverState() {
  // Draw the game over state
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Game Over', width / 2, height / 2);
}

function drawGameStatePopup() {
  rectMode(CORNER); // Ensure rectMode is set to CORNER
  fill(0, 0, 0, 150); // Semi-transparent black background
  rect(10, 10, 190, 120, 10); // Adjusted height to accommodate the speed multiplier
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`State: ${currentState}`, 20, 30);
  text(`Player: ${players[currentPlayerIndex].id}`, 20, 50);
  text(`Turn: ${turnNumber}`, 20, 70); // Display the current turn number

  // Calculate the remaining time for the current turn
  let remainingTime = Math.max(0, turnDuration - (millis() - turnStartTime));
  text(`Time Left: ${(remainingTime / 1000).toFixed(1)}s`, 20, 90);

  // Display the speed multiplier
  text(`Speed: ${speedMultiplier.toFixed(3)}x`, 20, 110);
}

function keyPressed() {
  if (currentState === GameState.INIT) {
    setState(GameState.PLAYING);
  } else if (key === ' ') { // Check if the space key is pressed
    if (currentState === GameState.PLAYING) {
      setState(GameState.PAUSED);
    } else if (currentState === GameState.PAUSED) {
      setState(GameState.PLAYING);
    }
  } else if (key === 'p' || key === 'P') { // Check if the 'P' key is pressed
    switchPlayer();
  } else if (keyCode === LEFT_ARROW) {
    speedMultiplier = max(0.1, speedMultiplier / 1.1); // Decrease speed, minimum 0.1x
  } else if (keyCode === RIGHT_ARROW) {
    speedMultiplier = min(1000, speedMultiplier * 1.1); // Increase speed, maximum 1000x
  }
}

function switchPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  players[currentPlayerIndex].resetBattles(); // Reset battles at the start of the turn
  players[currentPlayerIndex].addRandomUnit();

  if (currentPlayerIndex === 0) {
    turnNumber++; // Increment turn number when all players have taken their turn
  }
}

function adjustSpeed() {
  if (keyIsDown(LEFT_ARROW)) {
    speedMultiplier = max(0.2, speedMultiplier / 1.02); // Decrease speed, minimum 0.1x
  } else if (keyIsDown(RIGHT_ARROW)) {
    speedMultiplier = min(1000, speedMultiplier * 1.01); // Increase speed, maximum 1000x
  }
}