class AIPlayer {
  constructor(player) {
    this.player = player;
    this.initialReasoning = player.decisionReasoning;
  }

  makeDecision() {
    this.player.decisionReasoning += '🛠️ ';

    if (!this.player.canAffordCheapestUnit() && !this.player.hasMovableUnits() && this.player.movesLeft === 0) {
      this.passTurn();
      return false;
    }

    if (this.player.canAffordCheapestUnit()) {
      this.handleUnitPlacement();
    } else if (this.player.hasMovableUnits()) {
      this.handleUnitMovement();
    } else {
      this.passTurn();
    }

    this.finaliseDecisionReasoning();
    return true;
  }

  passTurn() {
    this.player.decisionReasoning += '🚫 No valid moves or placements available, passing turn\n';
  }

  finaliseDecisionReasoning() {
    this.player.decisionReasoning = this.initialReasoning + this.player.decisionReasoning;
    if (this.player.decisionReasoning.length > this.player.maxReasoningLength) {
      this.player.decisionReasoning = this.player.decisionReasoning.slice(-this.player.maxReasoningLength);
    }
  }

  handleUnitMovement() {
    let unitHexes = Array.from(this.player.occupiedHexes).filter(hex => !hex.isInBattle());
    let moved = false;

    for (let hex of unitHexes) {
      let movableUnits = hex.getMovableUnits().filter(unit => unit.movement > 0);
      if (movableUnits.length > 0) {
        let unitToMove = random(movableUnits);
        let path = this.player.paths.get(unitToMove);

        if (path && path.length > 1) {
          moved = this.player.moveUnitAlongPath(unitToMove, hex, path);
        } else {
          moved = this.player.findNewPathForUnit(unitToMove, hex);
        }

        if (moved) break;
      }
    }

    if (!moved) {
      this.player.decisionReasoning += '❌ No moves\n';
    }
  }

  handleUnitPlacement() {
    if (!this.player.canAffordCheapestUnit()) {
      this.player.decisionReasoning += '❌ Not enough money to place any unit\n';
      return;
    }

    let isFirstTurn = (turnNumber === 1);
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(isFirstTurn);

    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = this.decideUnitType();
      let emoji = getUnitEmoji(unitType);
      if (this.player.placeUnit(randomHex, unitType)) {
        this.player.decisionReasoning += `✅ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`;
        this.player.movesLeft--;
      } else {
        this.player.decisionReasoning += `❌ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`;
      }
    } else {
      this.player.decisionReasoning += '❌ No hexes available for unit placement\n';
    }
  }

  getHexesToConsiderForUnitPlacement(isFirstTurn) {
    if (isFirstTurn) {
      return Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit);
    } else {
      return Array.from(this.player.claimedAdjacentHexes).map(key => hexGrid.get(key)).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));
    }
  }

  decideUnitType() {
    let unitType = 'farmer';
    if (turnNumber === 1) {
      unitType = 'settler';
    } else {
      let rand = random(1);
      if (rand <= 0.70) {
        unitType = 'farmer';
      } else if (rand <= 0.90) {
        unitType = 'soldier';
      } else if (rand <= 0.95) {
        unitType = 'settler';
      } else {
        unitType = 'builder';
      }
    }
    return unitType;
  }
}

function makeDecision(player) {
  const aiPlayer = new AIPlayer(player);
  return aiPlayer.makeDecision();
}