class Player {
  constructor(id, color) {
    this.id = id;
    this.color = color;
    this.occupiedHexes = [];
    this.adjacentHexes = new Set();
    this.battlesLeft = 3; // Example: Allow 3 battles per turn
    this.humanControlled = false;
  }

  makeDecision() {
    // For now, just call addRandomUnit as a placeholder for more complex decision-making
    this.addRandomUnit();
  }

  addRandomUnit() {
    let isFirstTurn = (turnNumber === 1);
    let hexesToConsider = this.getHexesToConsiderForUnitPlacement(isFirstTurn);

    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let unitType = this.decideUnitType();
      let newUnit = this.createUnit(unitType);
      this.placeUnit(randomHex, newUnit);
    } else {
      console.log(`Player ${this.id} has no adjacent hexes available for unit placement.`);
    }
  }

  getHexesToConsiderForUnitPlacement(isFirstTurn) {
    if (isFirstTurn) {
      return Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit);
    } else {
      return Array.from(this.adjacentHexes).map(key => hexGrid.get(key)).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));
    }
  }

  decideUnitType() {
    return random(1) < 0.5 ? 'farmer' : 'soldier';
  }

  createUnit(unitType) {
    return new Unit(this.id, unitType, unitType === 'soldier' ? 50 : 5, 5, 5, this.color); // Example values for attack and defense
  }

  placeUnit(hex, unit) {
    if (placeUnit(hex.q, hex.r, unit)) {
      console.log(`Player ${this.id} added ${unit.type} unit to Hex: (${hex.q}, ${hex.r})`);
    } else {
      console.log(`Player ${this.id} could not place unit at Hex: (${hex.q}, ${hex.r})`);
    }
  }

  resetBattles() {
    this.battlesLeft = 3; // Reset the battle counter at the start of each turn
  }

  canInitiateBattle() {
    if (this.battlesLeft <= 0) return false;
    for (let hex of this.occupiedHexes) {
      let neighbors = getHexNeighbors(hex);
      if (neighbors.some(neighbor => neighbor.unit && neighbor.unit.id !== this.id)) {
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

  // Allow placement anywhere on the first turn
  if (turnNumber === 1) {
    hex.addUnit(unit);
    hex.occupiedBy = unit.id;
    hex.claimedBy = unit.id; // Set claimedBy attribute
    let player = players.find(p => p.id === unit.id);
    if (player) {
      player.occupiedHexes.push(hex);
      let neighbors = getHexNeighbors(hex);
      neighbors.forEach(neighbor => {
        if (!neighbor.occupiedBy && claimableTiles.has(neighbor.getKey())) {
          player.adjacentHexes.add(neighbor.getKey());
        }
      });
      // Remove the current hex from adjacentHexes if it was there
      player.adjacentHexes.delete(hex.getKey());
    }
    return true;
  }

  // Check if the hex is adjacent to an occupied hex
  let neighbors = getHexNeighbors(hex);
  let isAdjacentToOccupiedHex = neighbors.some(neighbor => neighbor.occupiedBy === unit.id);

  if (isAdjacentToOccupiedHex) {
    hex.addUnit(unit);
    hex.occupiedBy = unit.id;
    hex.claimedBy = unit.id; // Set claimedBy attribute
    let player = players.find(p => p.id === unit.id);
    if (player) {
      player.occupiedHexes.push(hex);
      neighbors.forEach(neighbor => {
        if (!neighbor.occupiedBy && claimableTiles.has(neighbor.getKey())) {
          player.adjacentHexes.add(neighbor.getKey());
        }
      });
      // Remove the current hex from adjacentHexes if it was there
      player.adjacentHexes.delete(hex.getKey());
    }
    return true;
  } else {
    console.log(`Cannot place unit at (${q}, ${r}). It must be adjacent to an occupied hex.`);
    return false;
  }
}

function drawUnit(x, y, unit, size) {
  push();
  translate(x, y);
  fill(unit.color);
  ellipse(0, 0, size, size);
  pop();
}

function battle(attackerHex, defenderHex) {
  if (!attackerHex.unit || !defenderHex.unit) return;

  let attacker = attackerHex.unit;
  let defender = defenderHex.unit;

  // Calculate damage with randomness
  let attackMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2
  let defenseMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2

  // Apply defensive bonus if defender is on a mountain tile
  let defenseBonus = defenderHex.type === 'mountain' ? 1.5 : 1.0;

  let damageToDefender = Math.max(0, Math.floor(attacker.attack * attackMultiplier - defender.defense * defenseMultiplier * defenseBonus));
  let damageToAttacker = Math.max(0, Math.floor(defender.attack * defenseMultiplier - attacker.defense * attackMultiplier));

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