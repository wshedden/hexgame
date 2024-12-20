class Player {
  constructor(id, color) {
    this.id = id;
    this.color = color;
    this.occupiedHexes = [];
    this.adjacentHexes = new Set();
    this.battlesLeft = 3; // Example: Allow 3 battles per turn
  }

  addRandomUnit() {
    let isFirstTurn = (turnNumber === 1);
    let hexesToConsider = isFirstTurn ? Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit) : Array.from(this.adjacentHexes).map(key => hexGrid.get(key)).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));

    if (hexesToConsider.length > 0) {
      let randomHex = random(hexesToConsider);
      let newUnit = new Unit(this.id, 'soldier', 100, 20, 10, this.color); // Example values for attack and defense
      placeUnit(randomHex.q, randomHex.r, newUnit);

      console.log(`Player ${this.id} added unit to Hex: (${randomHex.q}, ${randomHex.r})`);
    } else {
      console.log(`Player ${this.id} has no adjacent hexes available for unit placement.`);
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
    return;
  }

  // Check if it's the first turn
  let isFirstTurn = (turnNumber === 1);

  // Check if the hex is adjacent to an occupied hex
  let neighbors = getHexNeighbors(hex);
  let isAdjacentToOccupiedHex = neighbors.some(neighbor => neighbor.occupiedBy === unit.id);

  if ((isFirstTurn || isAdjacentToOccupiedHex) && !hex.unit) {
    hex.unit = unit;
    hex.occupiedBy = unit.id;
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
  } else {
    console.log(`Cannot place unit at (${q}, ${r}). It must be adjacent to an occupied hex.`);
  }
}

function drawUnits() {
  hexGrid.forEach((hex) => {
    if (hex.unit) {
      let { x, y } = hexToPixel(hex);
      drawUnit(x, y, hex.unit);
    }
  });
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