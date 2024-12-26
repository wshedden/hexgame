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
    } else if (this.player.canAffordCheapestUnit() && random(1) > this.movementLikelihood) {
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
    this.player.decisionReasoning += '🚫 Passing 🚫';
  }

  finaliseDecisionReasoning() {
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

        if (moved) {
          this.attemptedActions.add(`move:${unitToMove.playerId}:${hex.q},${hex.r}`);
          break;
        }
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
  
    if (this.player.occupiedHexes.size >= this.player.unitLimit) {
      this.player.decisionReasoning += `❌ Unit limit of ${this.player.unitLimit} reached. Cannot place more units\n`;
      return;
    }
  
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(false);
  
    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = this.decideUnitType();
      let emoji = getUnitEmoji(unitType);
      if (this.player.placeUnit(randomHex, unitType)) {
        this.player.actionPoints--;
        this.player.decisionReasoning += `✅ ${emoji} at (${randomHex.q}, ${randomHex.r}) ${emoji} ${this.player.actionPoints}\n`;
        this.attemptedActions.add(`place:${unitType}:${randomHex.q},${randomHex.r}`);
      } else {
        this.player.decisionReasoning += `❌ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`;
      }
    } else {
      this.player.decisionReasoning += '❌ No hexes available for unit placement\n';
    }
  }

  handleFirstTurnUnitPlacement() {
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(true);

    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = 'settler';
      let emoji = getUnitEmoji(unitType);
      if (this.player.placeUnit(randomHex, unitType)) {
        this.player.actionPoints--;
        this.player.decisionReasoning += `✅ ${emoji} at (${randomHex.q}, ${randomHex.r}) ${emoji} ${this.player.actionPoints}\n`;
        this.attemptedActions.add(`place:${unitType}:${randomHex.q},${randomHex.r}`);
      } else {
        this.player.decisionReasoning += `❌ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`;
      }
    } else {
      this.player.decisionReasoning += '❌ No hexes available for settler placement\n';
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
    // print(`Number of farmers available: ${this.player.farmers.size}`);
    if (this.player.farmers.size === 0) {
      this.player.decisionReasoning += '❌ No farmers available to build a farm\n';
      // print('No farmers available to build a farm');
      return false;
    }

    let farmersArray = Array.from(this.player.farmers);
    // print(`Farmers array: ${farmersArray.map(farmer => `(${farmer.q}, ${farmer.r})`).join(', ')}`);
    let randomFarmer = random(farmersArray);
    let farmerHex = hexGrid.get(`${randomFarmer.q},${randomFarmer.r}`);

    // print(`Attempting to build a farm with farmer at (${randomFarmer.q}, ${randomFarmer.r})`);

    if (this.player.buildBuilding(randomFarmer, farmerHex)) {
      this.player.farmers.delete(randomFarmer); // Remove the farmer from the set
      this.player.decisionReasoning += `✅ 🌾 Farmer built a farm at (${farmerHex.q}, ${farmerHex.r}) 🚶 ${this.player.actionPoints}\n`;
      // print(`Farm successfully built at (${farmerHex.q}, ${farmerHex.r})`);
      return true;
    } else {
      this.player.decisionReasoning += `❌ Failed to build a farm at (${farmerHex.q}, ${farmerHex.r})\n`;
      // print(`Failed to build a farm at (${farmerHex.q}, ${farmerHex.r})`);
      return false;
    }
  }
}

function makeDecision(player) {
  const aiPlayer = new AIPlayer(player, turnNumber);
  return aiPlayer.makeDecision();
}