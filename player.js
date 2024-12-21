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
    this.movesLeft = 2;
    this.maxReasoningLength = 1000; // Maximum length for decisionReasoning
  }

  resetMoves() {
    this.movesLeft = 2;
  }

  makeDecision() {
    makeDecision(this);
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
      // console.log(`Player ${this.id} has no battles left this turn.`);
    }
  }

  moveUnit(fromHex, toHex) {
    return moveUnit(this, fromHex, toHex);
  }
}

function placeUnit(q, r, unit) {
  let hex = getHex(q, r);
  if (!hex || !claimableTiles.has(hex.getKey())) {
    // console.log(`Cannot place unit at (${q}, ${r}). Tile is not claimable.`);
    return false;
  }

  // console.log(`Turn Number: ${turnNumber}, Unit Type: ${unit.type}, Hex: (${q}, ${r})`); // Debugging log

  // First turn logic
  if (turnNumber === 1) {
    if (unit.type !== 'settler') {
      // console.log(`The first unit placed must be a settler.`);
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
    // console.log(`Cannot place unit at (${q}, ${r}). It must be adjacent to an occupied hex.`);
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
      hex.claimedColour = color(player.colour[0], player.colour[1], player.colour[2]); // Set the claimedColour
      player.claimedHexes.add(hex);
      let neighbours = getHexNeighbours(hex);
      neighbours.forEach(neighbour => {
        if (!neighbour.occupiedBy && claimableTiles.has(neighbour.getKey())) {
          player.claimedAdjacentHexes.add(neighbour.getKey());
        }
      });
      // Remove the current hex from claimedAdjacentHexes if it was there
      player.claimedAdjacentHexes.delete(hex.getKey());
      // console.log(`placeUnitOnHex: (${hex.q}, ${hex.r}) claimedBy = ${hex.claimedBy}`);
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

  // console.log(`Battle between Player ${attacker.id} and Player ${defender.id}`);
  // console.log(`Attacker dealt ${damageToDefender} damage, Defender dealt ${damageToAttacker} damage`);

  // Check for unit deaths
  if (defender.health <= 0) {
    // console.log(`Player ${attacker.id} wins the battle!`);
    animateUnitMovement(attackerHex, defenderHex); // Animate the unit movement
  }

  if (attacker.health <= 0) {
    // console.log(`Player ${defender.id} wins the battle!`);
    attackerHex.unit = null; // Remove the attacker unit
    attackerHex.occupiedBy = null;
  }
}

function moveUnit(player, fromHex, toHex) {
  if (fromHex.units.length === 0) {
    return false;
  }

  if (toHex.units.length >= MAX_UNITS_PER_HEX) {
    return false;
  }

  let unitToMove = random(fromHex.units);

  // Check if the unit can move
  if (unitToMove.movement <= 0) {
    return false;
  }

  toHex.units.push(unitToMove);
  fromHex.units.splice(fromHex.units.indexOf(unitToMove), 1);

  if (fromHex.units.length === 0) {
    player.occupiedHexes.delete(fromHex);
  }
  player.occupiedHexes.add(toHex);

  return true;
}

function createUnit(player, unitType) {
  switch (unitType) {
    case 'soldier':
      return new Unit(player.id, unitType, 50, 10, 5, player.colour, 1); // Example values for soldier
    case 'farmer':
      return new Unit(player.id, unitType, 30, 5, 2, player.colour, 1); // Example values for farmer
    case 'settler':
      return new Unit(player.id, unitType, 20, 0, 1, player.colour, 0); // Example values for settler with 0 movement
    case 'builder':
      return new Unit(player.id, unitType, 40, 0, 3, player.colour, 1); // Example values for builder
    default:
      return new Unit(player.id, 'farmer', 30, 5, 2, player.colour, 1); // Default to farmer
  }
}