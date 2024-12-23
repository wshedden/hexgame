class AIPlayer {
  constructor(player) {
    this.player = player;
    this.initialReasoning = player.decisionReasoning;
  }

  makeDecision() {
    this.player.decisionReasoning += '🛠️ '; // Emoji for decision-making

    if (!this.canAffordCheapestUnit() && !this.hasMovableUnits() && this.player.movesLeft === 0) {
      this.passTurn();
      return false;
    }

    if (turnNumber > 2 && Math.random() < 0.5) {
      this.handleUnitMovement();
    } else {
      this.handleUnitPlacement();
    }

    this.finaliseDecisionReasoning();
    return true;
  }

  canAffordCheapestUnit() {
    const cheapestUnitCost = Math.min(...Object.values(UNIT_COSTS));
    return this.player.money >= cheapestUnitCost;
  }

  hasMovableUnits() {
    return Array.from(this.player.occupiedHexes).some(hex => hex.getMovableUnits().length > 0);
  }

  passTurn() {
    this.player.decisionReasoning += '🚫 No valid moves or placements available, passing turn\n'; // Pass emoji
  }

  finaliseDecisionReasoning() {
    this.player.decisionReasoning = this.initialReasoning + this.player.decisionReasoning;
    if (this.player.decisionReasoning.length > this.player.maxReasoningLength) {
      this.player.decisionReasoning = this.player.decisionReasoning.slice(-this.player.maxReasoningLength);
    }
  }

  handleUnitMovement() {
    let unitHexes = Array.from(this.player.occupiedHexes);
    let moved = false;

    for (let hex of unitHexes) {
      let movableUnits = hex.getMovableUnits().filter(unit => unit.movement > 0);
      if (movableUnits.length > 0) {
        let unitToMove = random(movableUnits);
        let path = this.player.paths.get(unitToMove);

        if (path && path.length > 1) {
          moved = this.moveUnitAlongPath(unitToMove, hex, path);
        } else {
          moved = this.findNewPathForUnit(unitToMove, hex);
        }

        if (moved) break;
      }
    }

    if (!moved) {
      this.player.decisionReasoning += '❌ No units to move or no valid paths found\n'; // Failure emoji
    }
  }

  moveUnitAlongPath(unit, hex, path) {
  let nextHex = path[1];
  if (moveUnit(this.player, hex, nextHex)) {
    // Check if the next hex has enemy units
    if (nextHex.hasEnemyUnits(this.player)) {
      const enemyUnit = nextHex.units.find(unit => unit.player !== this.player);
      this.startBattle(unit, enemyUnit, nextHex);
    }

    path = path.slice(1);
    if (path.length === 1) {
      this.player.paths.delete(unit);
    } else {
      this.player.paths.set(unit, path);
    }
    this.player.movesLeft--;
    return true;
  }
  return false;
}

  startBattle(attackingUnit, defendingUnit, hex) {
  // Create an array of sets for each player
  const units = [
    new Set(hex.units.filter(unit => unit.player === attackingUnit.player)), // Set of attacking units
    new Set(hex.units.filter(unit => unit.player === defendingUnit.player))  // Set of defending units
  ];

  // Create a Battle instance with the hex and units
  const battle = new Battle(hex, units, { enablePrinting: true });
//   battle.start();

  // Update player battles
  this.player.battleHexes.add(hex.getKey());
  this.player.decisionReasoning += `⚔️ Battle started at (${hex.q}, ${hex.r}) between ${attackingUnit.type} and ${defendingUnit.type}\n`; // Battle emoji
}

  findNewPathForUnit(unit, hex) {
    if (this.player.paths.size < 3) {
      let randomHex = random(Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit));
      let newPath = aStar(hex, randomHex, hexGrid);

      if (newPath.length > 0) {
        this.player.paths.set(unit, newPath);
        this.player.decisionReasoning += `➡️ Path found for unit from (${hex.q}, ${hex.r}) to (${randomHex.q}, ${randomHex.r})\n`; // Pathfinding emoji
        this.player.movesLeft--;
        return true;
      } else {
        this.player.decisionReasoning += `❌ No path: (${hex.q}, ${hex.r}) -> (${randomHex.q}, ${randomHex.r})\n`; // Failure emoji
      }
    } else {
    //   this.player.decisionReasoning += `❌ Path limit\n`; // Failure emoji
    }
    return false;
  }

  handleUnitPlacement() {
    if (!this.canAffordCheapestUnit()) {
      this.player.decisionReasoning += '❌ Not enough money to place any unit\n'; // Failure emoji
      return;
    }

    let isFirstTurn = (turnNumber === 1);
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(isFirstTurn);

    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = this.decideUnitType();
      let newUnit = createUnit(this.player, unitType);
      let emoji = getUnitEmoji(unitType); // Use getUnitEmoji from unit.js
      if (placeUnit(randomHex.q, randomHex.r, newUnit)) {
        this.player.decisionReasoning += `✅ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`; // Success emoji
        this.player.movesLeft--;
      } else {
        this.player.decisionReasoning += `❌ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`; // Failure emoji
      }
    } else {
      this.player.decisionReasoning += '❌ No hexes available for unit placement\n'; // Failure emoji
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