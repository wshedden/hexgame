class Player {
  constructor(id, colour) {
    this.id = id;
    this.colour = colour;
    this.occupiedHexes = new Set();
    this.claimedHexes = new Set();
    this.claimedAdjacentHexes = new Set();
    this.battlesLeft = 3; // Example: Allow 3 battles per turn
    this.humanControlled = false;
    this.decisionReasoning = ''; // Store reasoning behind decisions
    this.movesLeft = 3; // Allow 3 moves per turn
  }

  resetMoves() {
    this.movesLeft = 3;
  }

  makeDecision() {
    // For now, just call addRandomUnit as a placeholder for more complex decision-making
    this.decisionReasoning = 'Adding a random unit.';
    this.addRandomUnit();
  }

  addRandomUnit() {
    let isFirstTurn = (turnNumber === 1);
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(isFirstTurn);

    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = this.decideUnitType();
      let newUnit = this.createUnit(unitType);
      if (this.placeUnit(randomHex, newUnit)) {
        this.decisionReasoning += ` Placed a ${unitType} at (${randomHex.q}, ${randomHex.r}).`;
      } else {
        this.decisionReasoning += ` Failed to place a ${unitType} at (${randomHex.q}, ${randomHex.r}).`;
      }
    } else {
      console.log(`Player ${this.id} has no adjacent hexes available for unit placement.`);
      this.decisionReasoning += ' No adjacent hexes available for unit placement.';
    }
  }

  getHexesToConsiderForUnitPlacement(isFirstTurn) {
    if (isFirstTurn) {
      return Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit);
    } else {
      return Array.from(this.claimedAdjacentHexes).map(key => hexGrid.get(key)).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));
    }
  }

  decideUnitType() {
    // If first turn, settler
    // Otherwise 70% farmer, 20% soldier, 5% settler, 5% builder
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

  createUnit(unitType) {
    switch (unitType) {
      case 'soldier':
        return new Unit(this.id, unitType, 50, 10, 5, this.colour); // Example values for soldier
      case 'farmer':
        return new Unit(this.id, unitType, 30, 5, 2, this.colour); // Example values for farmer
      case 'settler':
        return new Unit(this.id, unitType, 20, 0, 1, this.colour); // Example values for settler
      case 'builder':
        return new Unit(this.id, unitType, 40, 0, 3, this.colour); // Example values for builder
      default:
        return new Unit(this.id, 'farmer', 30, 5, 2, this.colour); // Default to farmer
    }
  }

  placeUnit(hex, unit) {
    if (placeUnit(hex.q, hex.r, unit)) {
      console.log(`Player ${this.id} added ${unit.type} unit to Hex: (${hex.q}, ${hex.r})`);
      return true;
    } else {
      console.log(`Player ${this.id} could not place unit at Hex: (${hex.q}, ${hex.r})`);
      return false;
    }
  }

  resetBattles() {
    this.battlesLeft = 3; // Reset the battle counter at the start of each turn
  }

  canInitiateBattle() {
    if (this.battlesLeft <= 0) return false;
    for (let hex of this.occupiedHexes) {
      let neighbours = getHexNeighbours(hex);
      if (neighbours.some(neighbour => neighbour.unit && neighbour.unit.id !== this.id)) {
        return true;
      }
    }
    return false;
  }

  initiateBattle(attackerHex, defenderHex) {
    if (this.battlesLeft > 0) {
      battle(attackerHex, defenderHex);
      this.battlesLeft--;
    } else {
      console.log(`Player ${this.id} has no battles left this turn.`);
    }
  }
}

function placeUnit(q, r, unit) {
  let hex = getHex(q, r);
  if (!hex || !claimableTiles.has(hex.getKey())) {
    console.log(`Cannot place unit at (${q}, ${r}). Tile is not claimable.`);
    return false;
  }

  // First turn logic
  if (turnNumber === 1) {
    if (unit.type !== 'settler') {
      console.log(`The first unit placed must be a settler.`);
      return false;
    }
    return placeUnitOnHex(hex, unit);
  }

  // Other turns logic
  let neighbours = getHexNeighbours(hex);
  let isAdjacentToOccupiedHex = neighbours.some(neighbour => neighbour.occupiedBy === unit.id);

  if (isAdjacentToOccupiedHex) {
    return placeUnitOnHex(hex, unit);
  } else {
    console.log(`Cannot place unit at (${q}, ${r}). It must be adjacent to an occupied hex.`);
    return false;
  }
}

function placeUnitOnHex(hex, unit) {
  if (!hex.addUnit(unit)) {
    return false;
  }
  hex.occupiedBy = unit.id;
  let player = players.find(p => p.id === unit.id);
  if (player) {
    player.occupiedHexes.add(hex);
    if (unit.type === 'settler') {
      hex.claimedBy = unit.id; // Only claim hex if the unit is a settler
      player.claimedHexes.add(hex);
      let neighbours = getHexNeighbours(hex);
      neighbours.forEach(neighbour => {
        if (!neighbour.occupiedBy && claimableTiles.has(neighbour.getKey())) {
          player.claimedAdjacentHexes.add(neighbour.getKey());
        }
      });
      // Remove the current hex from claimedAdjacentHexes if it was there
      player.claimedAdjacentHexes.delete(hex.getKey());
    }
  }
  return true;
}

function drawUnit(x, y, unit, size) {
  push();
  translate(x, y);
  fill(unit.colour);
  ellipse(0, 0, size, size);
  pop();
}

function battle(attackerHex, defenderHex) {
  if (!attackerHex.unit || !defenderHex.unit) return;

  let attacker = attackerHex.unit;
  let defender = defenderHex.unit;

  // Calculate damage with randomness
  let attackMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2
  let defenceMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2

  // Apply defensive bonus if defender is on a mountain tile
  let defenceBonus = defenderHex.type === 'mountain' ? 1.5 : 1.0;

  let damageToDefender = Math.max(0, Math.floor(attacker.attack * attackMultiplier - defender.defence * defenceMultiplier * defenceBonus));
  let damageToAttacker = Math.max(0, Math.floor(defender.attack * defenceMultiplier - attacker.defence * attackMultiplier));

  // Apply damage
  defender.health -= damageToDefender;
  attacker.health -= damageToAttacker;

  console.log(`Battle between Player ${attacker.id} and Player ${defender.id}`);
  console.log(`Attacker dealt ${damageToDefender} damage, Defender dealt ${damageToAttacker} damage`);

  // Check for unit deaths
  if (defender.health <= 0) {
    console.log(`Player ${attacker.id} wins the battle!`);
    animateUnitMovement(attackerHex, defenderHex); // Animate the unit movement
  }

  if (attacker.health <= 0) {
    console.log(`Player ${defender.id} wins the battle!`);
    attackerHex.unit = null; // Remove the attacker unit
    attackerHex.occupiedBy = null;
  }
}