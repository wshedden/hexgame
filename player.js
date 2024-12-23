// Define unit costs
const UNIT_COSTS = {
  settler: 100,  // Reduced from 500
  soldier: 50,   // Reduced from 300
  farmer: 40,    // Reduced from 200
  builder: 50    // Reduced from 250
};

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
    this.money = 1000; // New attribute: money
    this.unitLimit = 10; // New attribute: unit limit
    this.battleHexes = new Set(); // New attribute: hexes where battles are occurring
    this.paths = new Map(); // New attribute: paths for units
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

  initiateBattle(attackerHex, defenderHex) {
    if (this.battlesLeft > 0) {
      let battle = new Battle(attackerHex, defenderHex);
      battle.start();
      this.battlesLeft--;
      this.battleHexes.add(defenderHex.getKey()); // Add the hex to the battle hexes set
    }
  }

  moveUnit(fromHex, toHex) {
    return moveUnit(this, fromHex, toHex);
  }
}

function placeUnit(q, r, unit) {
  let hex = getHex(q, r);
  if (!hex || !claimableTiles.has(hex.getKey())) {
    return false;
  }

  let player = players.find(p => p.id === unit.id);
  if (player.money < UNIT_COSTS[unit.type]) {
    player.decisionReasoning += `❌💰 ${getUnitEmoji(unit.type)} (${UNIT_COSTS[unit.type]} needed)\n`; // Failure emoji
    return false;
  }

  if (turnNumber === 1) {
    if (unit.type !== 'settler') {
      return false;
    }
    return placeUnitOnHex(hex, unit);
  }

  let neighbours = getHexNeighbours(hex);
  let isAdjacentToOccupiedHex = neighbours.some(neighbour => neighbour.occupiedBy === unit.id);

  if (isAdjacentToOccupiedHex) {
    if (placeUnitOnHex(hex, unit)) {
      player.money -= UNIT_COSTS[unit.type]; // Deduct the cost from the player's money
      return true;
    }
  } else {
    return false;
  }
}

function placeUnitOnHex(hex, unit) {
  if (!hex.addUnit(unit)) {
    return false;
  }
  hex.occupiedBy = unit.id;
  unit.q = hex.q; // Set unit's q coordinate
  unit.r = hex.r; // Set unit's r coordinate
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
      player.claimedAdjacentHexes.delete(hex.getKey());
    }
  }
  return true;
}

function moveUnit(player, fromHex, toHex, options = {}) {
  if (!canMoveUnit(fromHex, toHex)) {
    return false;
  }

  let unitToMove = random(fromHex.units);

  if (!moveUnitToHex(unitToMove, fromHex, toHex)) {
    return false;
  }

  updatePlayerOccupiedHexes(player, fromHex, toHex);

  return true;
}

function canMoveUnit(fromHex, toHex) {
  if (fromHex.isInBattle() || fromHex.units.length === 0) {
    return false;
  }

  if (toHex.units.length >= MAX_UNITS_PER_HEX) {
    return false;
  }

  return true;
}

function moveUnitToHex(unit, fromHex, toHex) {
  if (unit.movement <= 0) {
    return false;
  }

  toHex.units.push(unit);
  fromHex.units.splice(fromHex.units.indexOf(unit), 1);

  return true;
}

function updatePlayerOccupiedHexes(player, fromHex, toHex) {
  if (fromHex.units.length === 0) {
    player.occupiedHexes.delete(fromHex);
  }
  player.occupiedHexes.add(toHex);
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
