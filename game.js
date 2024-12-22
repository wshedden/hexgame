const GameState = {
  INIT: 'init',
  PLAYING: 'playing',
  PLAYING_HUMAN: 'playing_human',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  THINKING: 'thinking', // New state for AI thinking
  ANIMATING: 'animating' // New state for animations
};

let currentState = GameState.INIT;
let currentPlayerIndex = 0;
let turnDuration = 500;
let turnStartTime;
let turnNumber = 1; // Initialize turn number
let speedMultiplier = 1.0;

const players = [
  new Player(1, [139, 0, 0]), // Dark red for player 1
  new Player(2, [0, 0, 139])  // Dark blue for player 2
];

function setState(newState) {
  currentState = newState;
  if (newState === GameState.PLAYING) {
    turnStartTime = millis();
  } else if (newState === GameState.THINKING) {
    handleAIDecision();
    setState(GameState.ANIMATING); // Transition to ANIMATING state after AI decisions
  } else if (newState === GameState.ANIMATING) {
    // For now, do nothing special in the ANIMATING state
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
    case GameState.PLAYING_HUMAN:
      drawPlayingState_human();
      break;
    case GameState.PAUSED:
      drawPausedState();
      break;
    case GameState.GAME_OVER:
      drawGameOverState();
      break;
    case GameState.THINKING:
      // For now, do nothing special in the THINKING state
      break;
    case GameState.ANIMATING:
      drawAnimatingState();
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

  // Adjust the turn duration based on the speed multiplier
  let adjustedTurnDuration = turnDuration * (1 / speedMultiplier);

  // Check if the turn duration has elapsed
  if (millis() - turnStartTime > adjustedTurnDuration) {
    startNewTurn();
  }
}

function drawPlayingState_human() {
  // Draw the playing state with human input
  drawGrid();
  drawUnits();

  // Handle human input
  handleHumanInput();
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
  let adjustedTurnDuration = turnDuration * (1 / speedMultiplier);
  let remainingTime = Math.max(0, adjustedTurnDuration - (millis() - turnStartTime));
  text(`Time Left: ${(remainingTime / 1000).toFixed(1)}s`, 20, 90);

  // Display the speed multiplier
  text(`Speed: ${speedMultiplier.toFixed(3)}x`, 20, 110);
}



function switchPlayer() {
  players[currentPlayerIndex].movesLeft--;

  if (players[currentPlayerIndex].movesLeft > 0) {
    return;
  }

  players[currentPlayerIndex].resetMoves();

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  players[currentPlayerIndex].resetBattles();

  if (currentPlayerIndex === 0 && players[0].isHuman) {
    return;
  }

  handleAIDecision({ enablePrinting: false }); // Disable printing for AI decisions
}

function handleAIDecision() {
  players[currentPlayerIndex].decisionReasoning = ''; // Clear previous reasoning

  let maxAttempts = 10; // Maximum number of attempts to make decisions
  let attempts = 0;

  while (players[currentPlayerIndex].movesLeft > 0 && attempts < maxAttempts) {
    players[currentPlayerIndex].makeDecision();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // print(`Player ${players[currentPlayerIndex].id} reached the maximum number of decision attempts.`);
  }

  if (currentPlayerIndex === 0) {
    turnNumber++; // Increment turn number when all players have taken their turn
  }

  // Update the AI Decision Reasoning panel
  const aiPanel = panelManager.getPanelByHeader('AI Decision Reasoning');
  if (aiPanel) {
    aiPanel.contentFunction = () => {
      const lines = players[currentPlayerIndex].decisionReasoning.split('\n');
      return showFailedOutput ? lines : lines.filter(line => !line.includes('❌'));
    };
  }

  setState(GameState.ANIMATING); // Transition to ANIMATING state after AI decisions
}

function startNewTurn() {
  switchPlayer();
  turnStartTime = millis();
}

function handleHumanInput() {
  // Handle human input logic here
  if (currentPlayerIndex === 1) {
    switchPlayer();
    turnStartTime = millis();
  }
}

function drawAnimatingState() {
  // For now, do nothing special in the ANIMATING state
  drawGrid();
  drawUnits();
}

function progressGameState() {
  if (currentState === GameState.ANIMATING) {
    // Transition to the next state after ANIMATING
    if (currentPlayerIndex === players.length - 1) {
      // If the last player has finished their turn, start a new turn
      startNewTurn();
    } else {
      // Otherwise, switch to the next player
      switchPlayer();
    }
    setState(GameState.PLAYING);
  }
}