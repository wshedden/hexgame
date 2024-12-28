const GameState = {
  INIT: 'init',
  PLAYING: 'playing',
  PLAYING_HUMAN: 'playing_human',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  THINKING: 'thinking', // New state for AI thinking
  DECISIONS_MADE: 'decisions_made', // New state for decisions made
  APPLYING_MOVES: 'applying_moves', // New state for applying moves
  ANIMATING: 'animating',
  ANIMATION_COMPLETE: 'animation_complete'
};

let currentState = GameState.INIT;
let currentPlayerIndex = 0;
let turnStartTime;
let turnNumber = 1; // Initialise turn number
let speedMultiplier = 1.0;
let decisionsMadeTime; // Time when decisions were made
let animationStartTime; // Time when animation started
let moveQueue = []; // Queue for moves to be applied

// New variables for adjustable delays
let decisionDelay = 1000 * delayMultiplier; // 1 second delay for decisions made

const players = [
  new Player(1, [139, 0, 0]), // Dark red for player 1
  new Player(2, [0, 0, 139])  // Dark blue for player 2
];

function setState(newState) {
  currentState = newState;
  if (newState === GameState.PLAYING) {
    setState(GameState.THINKING);
    startNewTurn();
  } else if (newState === GameState.THINKING) {
    handleAIDecision(currentPlayerIndex);
    setState(GameState.DECISIONS_MADE);
  } else if (newState === GameState.DECISIONS_MADE) {
    if (previousState === GameState.PAUSED) {
      decisionsMadeTime = millis() - decisionsMadeElapsedTime;
    } else {
      decisionsMadeTime = millis();
    }
    progressBar.setDuration(1000);
    progressBar.setText(`Player ${players[currentPlayerIndex].id} done thinking`);
  } else if (newState === GameState.ANIMATING) {
    if (previousState === GameState.PAUSED) {
      animationStartTime = millis() - animationElapsedTime;
    } else {
      animationStartTime = millis();
    }
    progressBar.setDuration(animationManager.totalAnimationDuration);
    progressBar.setText(`Player ${players[currentPlayerIndex].id} animating...`);
  } else if (newState === GameState.ANIMATION_COMPLETE) {
    setState(GameState.APPLYING_MOVES);
  } else if (newState === GameState.APPLYING_MOVES) {
    applyMoves();
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
    case GameState.DECISIONS_MADE:
      drawDecisionsMadeState();
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
  text('Press any key to start', 0, 0);
}

function drawPlayingState() {
  // Draw the playing state
  drawGrid();
  drawUnits();

  // print("Playing state");
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

function drawDecisionsMadeState() {
  // Draw the state after decisions are made
  drawGrid();
  drawUnits();

  // Check if 2 seconds have passed since decisions were made, then animate
  if (millis() - decisionsMadeTime > decisionDelay) {
    setState(GameState.ANIMATING);
  }
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
  // let remainingTime = Math.max(0, adjustedTurnDuration - (millis() - turnStartTime));
  // text(`Time Left: ${(remainingTime / 1000).toFixed(1)}s`, 20, 90);

  // Display the speed multiplier
  // text(`Speed: ${speedMultiplier.toFixed(3)}x`, 20, 110);
}

function switchPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}

function handleAIDecision(playerIndex) {
  players[playerIndex].decisionReasoning = ''; // Clear previous reasoning

  let maxAttempts = 10; // Maximum number of attempts to make decisions
  let attempts = 0;

  while (players[playerIndex].actionPoints > 0 && attempts < maxAttempts) {
    if (players[playerIndex].makeDecision()) {
      
    }
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // Add to ai panel
    players[playerIndex].decisionReasoning += '❌ Max attempts reached\n';
  }

  // Update the AI Decision Reasoning panel
  // const aiPanel = panelManager.getPanelByHeader('AI Decision Reasoning');
  // if (aiPanel) {
  //   aiPanel.contentFunction = () => {
  //     const lines = players[playerIndex].decisionReasoning.split('\n');
  //     return showFailedOutput ? lines : lines.filter(line => !line.includes('❌'));
  //   };
  // }

  setState(GameState.DECISIONS_MADE); // Transition to DECISIONS_MADE state after AI decisions
}

function startNewTurn() {
  this.totalAnimationDuration = BASE_ANIMATION_DURATION; // Reset total animation duration
  players[currentPlayerIndex].resetMoves();

  // Increment the turn number if we're on player 1
  if (currentPlayerIndex === 1) {
    turnNumber++;
  }
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
  drawGrid();
  drawUnits();

  animationManager.handleAnimations();

  if (animationManager.animationsComplete() && millis() - animationStartTime > animationManager.totalAnimationDuration) {
    // console.log(`All animations complete for player ${players[currentPlayerIndex].id}`);
    // Reset animationsLeft for all units
    players.forEach(player => {
      player.occupiedHexes.forEach(hex => {
        hex.units.forEach(unit => {
          unit.animationsLeft = 0;
        });
      });
    });

    setState(GameState.ANIMATION_COMPLETE);
    animationManager.totalAnimationDuration = BASE_ANIMATION_DURATION;
    progressGameState();
    return;
  }
}

function progressGameState() {
  if (currentState === GameState.ANIMATING) {
    // Do nothing special in the ANIMATING state
  } else if (currentState === GameState.ANIMATION_COMPLETE) {
    // Transition to the next state after ANIMATION_COMPLETE
    startNewTurn();
    switchPlayer();
    setState(GameState.PLAYING);
  }
}

function applyMoves() {
  moveQueue.forEach(move => {
    move.unit.hex = move.hex;
    move.hex.addUnit(move.unit);
  });
  moveQueue = [];
  setTimeout(() => {
    setState(GameState.ANIMATNG);
  }, 1000);
}

function progressAllBattles() {
  // Go through all battle hexes and progress the battles
  // Make sure to not double count hexes, as all players involved
  // have the hex in their battleHexes set. so combine the sets
  let allBattleHexes = new Set();

  players.forEach(player => {
    player.battleHexes.forEach(hex => {
      allBattleHexes.add(hex);
    });
  });

  allBattleHexes.forEach(hex => {
    if (hex.battle) { // Ensure it's a battle hex before progressing
      hex.battle.progressBattle();
    }
  });
}