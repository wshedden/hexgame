const MAX_AI_DECISION_ATTEMPTS = 10;
let currentPlayerIndex = 0;
let turnStartTime;
let turnNumber = 1; // Initialise turn number

// New variables for adjustable delays
let decisionDelay = 1000 * delayMultiplier; // 1 second delay for decisions made

const players = [
  new Player(1, [139, 0, 0]), // Dark red for player 1
  new Player(2, [0, 0, 139])  // Dark blue for player 2
];

function setState(newState) {
  stateManager.changeState(newState);
}

function switchPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}

function queueAIDecisionAttempts(playerIndex) {
  players[playerIndex].decisionReasoning = ''; // Clear previous reasoning

  let attempts = 0;

  while (players[playerIndex].actionPoints > 0 && attempts < MAX_AI_DECISION_ATTEMPTS) {
    if (players[playerIndex].makeDecision()) {
      // Decision made successfully
    }
    attempts++;
  }

  if (attempts >= MAX_AI_DECISION_ATTEMPTS) {
    // Add to AI panel
    players[playerIndex].decisionReasoning += '❌ Max attempts reached\n';
  }
}

function startNewTurn() {
  this.totalAnimationDuration = stateManager.currentState.minimumDuration; // Reset total animation duration
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

function executeDecisions() {
  players.forEach(player => {
    player.decisionQueue.forEach(move => {
      move.unit.hex = move.hex;
      move.hex.addUnit(move.unit);
    });
    player.decisionQueue = [];
  });
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