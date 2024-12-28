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
  stateManager.changeState(newState);
}

function drawGameState() {
  switch (stateManager.currentState) {
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