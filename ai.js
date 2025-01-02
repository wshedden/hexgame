class AIPlayer {
  constructor(player, turnNumber) {
    this.player = player;
    this.turnNumber = turnNumber;
    this.attemptedActions = new Set(); // Track attempted actions
    this.calculateMovementLikelihood(); // Set the initial movement likelihood
  }

  calculateMovementLikelihood() {
    if (this.turnNumber <= 3) {
      this.movementLikelihood = 0.6;
    } else {
      this.movementLikelihood = min(0.95, 0.6 + (this.turnNumber - 3) * (0.95 - 0.6) / (30 - 3));
    }
  }

  makeDecision() {
    if (!this.player.canAffordCheapestUnit() && !this.player.hasMovableUnits() && this.player.actionPoints === 0) {
      this.passTurn();
      return false;
    }

    if(this.player.farmers.size > 0 && this.player.actionPoints > 0) {
      if(random(1) < 0.5) {
        this.createRandomFarm();
        this.finaliseDecisionReasoning();
        return true;
      }
    }

    let isFirstTurn = (this.turnNumber === 1);
    if (isFirstTurn) {
      this.handleFirstTurnUnitPlacement();
      return true;
    }
    let rand = random(1); 
    let chooseMove = rand < this.movementLikelihood;
    if (!chooseMove && this.player.canAffordCheapestUnit()) {
      this.handleUnitPlacement();
      return true;
    } 
    if (this.player.hasMovableUnits()) {
      this.handleUnitMovement();
    } else {
      this.passTurn();
    }

    this.finaliseDecisionReasoning();
    return true;
  }

  passTurn() {
    this.player.decisionReasoning += '🚫 Passing 🚫\n';
    this.player.strategicDecisions += '🚫 Passing 🚫\n'; // Add to strategic decisions
  }

  finaliseDecisionReasoning() {
    if (this.player.decisionReasoning.length > this.player.maxReasoningLength) {
      this.player.decisionReasoning = this.player.decisionReasoning.slice(-this.player.maxReasoningLength);
    }
  }

  handleUnitMovement() {
    print("Handling unit movement");
    let moved = false;
    let hex = this.getRandomMovableHex();
  
    if (hex) {
      let unitToMove = this.getRandomMovableUnit(hex);
  
      if (unitToMove) {
        let path = this.player.paths.get(unitToMove);
  
        if (path && path.length > 1) {
          moved = this.player.moveUnitAlongPath(unitToMove, hex, path);
        } else {
          moved = this.player.findNewPathForUnit(unitToMove, hex);
        }
  
        if (moved) {
          this.attemptedActions.add(`move:${unitToMove.playerId}:${hex.q},${hex.r}`);
          this.player.strategicDecisions += `Moved unit ${unitToMove.id} from (${hex.q}, ${hex.r})\n`; // Add to strategic decisions
        }
      }
    }
  
    if (!moved) {
      this.player.decisionReasoning += '❌ No moves\n';
      this.player.strategicDecisions += '❌ No moves\n'; // Add to strategic decisions
    }
  }

  getRandomMovableHex() {
    let unitHexes = Array.from(this.player.occupiedHexes).filter(hex => !hex.isInBattle() && hex.getMovableUnits().length > 0);
    if (unitHexes.length === 0) {
      return null;
    }
    return random(unitHexes);
  }
  
  getRandomMovableUnit(hex) {
    let movableUnits = hex.getMovableUnits().filter(unit => unit.movement > 0);
    if (movableUnits.length === 0) {
      return null;
    }
    return random(movableUnits);
  }
    
  handleUnitPlacement() {
    if (!this.player.canAffordCheapestUnit()) {
      this.player.decisionReasoning += '❌ Not enough money to place any unit\n';
      this.player.strategicDecisions += '❌ Not enough money to place any unit\n'; // Add to strategic decisions
      return;
    }
  
    if (this.player.occupiedHexes.size >= this.player.unitLimit || this.player.numOfUnits >= this.player.unitLimit) {
      this.player.decisionReasoning += `❌ Unit limit of ${this.player.unitLimit} reached. Cannot place more units\n`;
      this.player.strategicDecisions += `❌ Unit limit of ${this.player.unitLimit} reached. Cannot place more units\n`; // Add to strategic decisions
      return;
    }
  
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(false);
  
    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = this.decideUnitType();
      let emoji = getUnitEmoji(unitType);
      if (this.player.placeNewUnit(randomHex, unitType)) {
        this.player.actionPoints--;
        this.player.decisionReasoning += `✅ ${emoji} at (${randomHex.q}, ${randomHex.r}) ${emoji} ${this.player.actionPoints}\n`;
        this.player.strategicDecisions += `Placed ${unitType} at (${randomHex.q}, ${randomHex.r})\n`; // Add to strategic decisions
        this.attemptedActions.add(`place:${unitType}:${randomHex.q},${randomHex.r}`);
      } else {
        this.player.decisionReasoning += `❌ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`;
        this.player.strategicDecisions += `❌ Failed to place ${unitType} at (${randomHex.q}, ${randomHex.r})\n`; // Add to strategic decisions
      }
    } else {
      this.player.decisionReasoning += '❌ No hexes available for unit placement\n';
      this.player.strategicDecisions += '❌ No hexes available for unit placement\n'; // Add to strategic decisions
    }
  }

  handleFirstTurnUnitPlacement() {
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(true);

    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = 'settler';
      let emoji = getUnitEmoji(unitType);
      if (this.player.placeNewUnit(randomHex, unitType)) {
        this.player.actionPoints--;
        this.player.decisionReasoning += `✅ ${emoji} at (${randomHex.q}, ${randomHex.r}) ${emoji}; AP=${this.player.actionPoints}\n`;
        this.player.strategicDecisions += `Placed settler at (${randomHex.q}, ${randomHex.r})\n`; // Add to strategic decisions
        this.attemptedActions.add(`place:${unitType}:${randomHex.q},${randomHex.r}`);
      } else {
        this.player.decisionReasoning += `❌ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`;
        this.player.strategicDecisions += `❌ Failed to place settler at (${randomHex.q}, ${randomHex.r})\n`; // Add to strategic decisions
      }
    } else {
      this.player.decisionReasoning += '❌ No hexes available for settler placement\n';
      this.player.strategicDecisions += '❌ No hexes available for settler placement\n'; // Add to strategic decisions
    }
  }

  getHexesToConsiderForUnitPlacement(isFirstTurn) {
    if (isFirstTurn) {
      return Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => hex.units.length === 0);
    } else {
      return Array.from(this.player.claimedAdjacentHexes).map(key => hexGrid.get(key)).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));
    }
  }

  decideUnitType() {
    let unitType = 'farmer';
    if (this.turnNumber === 1) {
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

  createRandomFarm() {
    if (this.player.farmers.size === 0) {
      this.player.decisionReasoning += '❌ No farmers available to build a farm\n';
      this.player.strategicDecisions += '❌ No farmers available to build a farm\n'; // Add to strategic decisions
      return false;
    }

    let farmersArray = Array.from(this.player.farmers);
    let randomFarmer = random(farmersArray);
    let farmerHex = hexGrid.get(`${randomFarmer.q},${randomFarmer.r}`);


    if (this.player.buildBuilding(randomFarmer, farmerHex)) {
      this.player.farmers.delete(randomFarmer); // Remove the farmer from the set
      this.player.strategicDecisions += `Built farm at (${farmerHex.q}, ${farmerHex.r})\n`; // Add to strategic decisions
      return true;
    } else {
      this.player.decisionReasoning += `❌ Failed to build a farm at (${farmerHex.q}, ${farmerHex.r})\n`;
      this.player.strategicDecisions += `❌ Failed to build a farm at (${farmerHex.q}, ${farmerHex.r})\n`; // Add to strategic decisions
      return false;
    }
  }
}

function makeDecision(player) {
  const aiPlayer = new AIPlayer(player, turnNumber);
  return aiPlayer.makeDecision();
}