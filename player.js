// Define unit costs
const UNIT_COSTS = {
  settler: 100,  // Reduced from 500
  soldier: 50,   // Reduced from 300
  farmer: 40,    // Reduced from 200
  builder: 50    // Reduced from 250
};

const MAX_ACTIONS_PER_TURN = 4; // Maximum number of actions per turn

class Player {
  constructor(id, colour) {
    this.id = id;
    this.colour = colour;
    this.occupiedHexes = new Set();
    this.claimedHexes = new Set();
    this.claimedAdjacentHexes = new Set();
    this.humanControlled = false;
    this.decisionReasoning = '';
    this.strategicDecisions = ''; // Initialize strategic decisions string
    this.actionPoints = MAX_ACTIONS_PER_TURN;
    this.maxReasoningLength = 1000;
    this.money = 10000;
    this.unitLimit = 10;
    this.battleHexes = new Set();
    this.paths = new Map();
    this.farmers = new Set();
    this.numOfUnits = 0;
    this.decisionQueue = [];
  }

  resetMoves() {
    this.actionPoints = MAX_ACTIONS_PER_TURN; // Reset the action points at the start of each turn
  }

  makeDecision() {
    makeDecision(this, turnNumber);
  }

  initiateBattle() {
    
  }
    
  moveUnit(unit, fromHex, toHex) {
    return moveUnit(this, unit, fromHex, toHex);
  }

  canAffordCheapestUnit() {
    const cheapestUnitCost = Math.min(...Object.values(UNIT_COSTS));
    return this.money >= cheapestUnitCost;
  }

  hasMovableUnits() {
    return Array.from(this.occupiedHexes).some(hex => hex.getMovableUnits().length > 0);
  }

  placeNewUnit(hex, unitType) {
    let newUnit = createUnit(this, unitType);
    if (purchaseUnit(hex.q, hex.r, newUnit)) {
      this.numOfUnits++;
      this.money -= UNIT_COSTS[unitType];
      if (unitType === 'farmer') {
        this.farmers.add(newUnit); // Add farmer to the set
        // print(`Farmer added at (${hex.q}, ${hex.r}). Total farmers: ${this.farmers.size}`);
      }
      return true;
    }
    return false;
  }

  findNewPathForUnit(unit, hex) {
    print("Finding new path for unit " + unit.id);
    if (this.paths.size < 3) {
      let randomHex = random(Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit));
      let newPath = aStar(hex, randomHex, hexGrid);
      print("New path:");
      print(newPath);
      if (newPath.length > 0) {
        this.paths.set(unit, newPath);
        return true;
      }
    }
    return false;
  }

  moveUnitAlongPath(unit, hex, path) {
    // TODO: should return false if the path is less than the minimum length
    let nextHex = path[1];
    print(`Moving unit ${unit.id} from (${hex.q}, ${hex.r}) to (${nextHex.q}, ${nextHex.r})\n\n`);
    if (this.moveUnit(unit, hex, nextHex)) {
      this.decisionReasoning += `(${hex.q}, ${hex.r}) ➡️ (${nextHex.q}, ${nextHex.r}) 🚶 ${this.actionPoints - 1}\n`;
  
      if (nextHex.hasEnemyUnits(this.id)) {
        this.startBattle(nextHex);
        this.paths.delete(unit);
        return true;
      }
      print("Path before shift:");
      print(path);
      path = path.slice(1);
      print("Path after shift:");
      print(path);
      if (path.length === 1) {
        this.paths.delete(unit);
      } else {
        this.paths.set(unit, path);
      }
      this.actionPoints--;
      return true;
    }
    return false;
  }

  startBattle(hex) {
    const playerUnits = new Set(hex.units.filter(unit => unit.playerID === this.id));
    const enemyUnits = new Set(hex.units.filter(unit => unit.playerID !== this.id));

    const units = [playerUnits, enemyUnits];
    const battle = new Battle(hex, units, { enablePrinting: true });
    battle.start();

    playerUnits.forEach(unit => {
      this.paths.delete(unit);
    });

    this.battleHexes.add(hex.getKey());
    const enemyPlayer = players.find(player => player.id !== this.id);
    enemyUnits.forEach(unit => {
      enemyPlayer.paths.delete(unit);
    });
    enemyPlayer.battleHexes.add(hex.getKey());
  }

  buildBuilding(unit, hex) {
    // print(`Attempting to build a building at (${hex.q}, ${hex.r})`);
    if (unit.build(hex)) {
      this.actionPoints--;
      this.decisionReasoning += `🏗️ ${getUnitEmoji(unit.type)} built ${hex.building.type} at (${hex.q}, ${hex.r}) 🚶 ${this.actionPoints}\n`;
      return true;
    }
    return false;
  }

  getMovableUnits() {
    let movableUnits = [];
    this.occupiedHexes.forEach(hex => {
      if (!hex.isInBattle()) {
        hex.units.forEach(unit => {
            if(unit.type === 'farmer' && unit.hex.building !== "Farm") {
              movableUnits.push(unit);
            }
            else if(unit.type !== 'settler') {
              movableUnits.push(unit);
          }
          else if(!unit.isInBattle()) {
            movableUnits.push(unit);
          }
        });
      }
    });
    return movableUnits;
  }
}

function purchaseUnit(q, r, unit) {
  let hex = getHex(q, r);
  if (!hex || !claimableTiles.has(hex.getKey())) {
    return false;
  }

  let player = players.find(p => p.id === unit.playerID);
  if (player.money < UNIT_COSTS[unit.type]) {
    player.decisionReasoning += `❌💰 ${getUnitEmoji(unit.type)} (${UNIT_COSTS[unit.type]} needed)\n`; // Failure emoji
    return false;
  }

  if (player.occupiedHexes.size >= player.unitLimit) {
    print(`Player ${player.id} has reached the unit limit of ${player.unitLimit}. Cannot purchase more units.`);
    return false;
  }

  if (turnNumber === 1) {
    if (unit.type !== 'settler') {
      return false;
    }
    return placeUnitOnHex(hex, unit);
  }

  let neighbours = getHexNeighbours(hex);
  let isAdjacentToOccupiedHex = neighbours.some(neighbour => neighbour.occupiedBy === unit.playerID);

  if (isAdjacentToOccupiedHex && (!hex.occupiedBy || hex.occupiedBy === unit.playerID)) {
    if (placeUnitOnHex(hex, unit)) {
      player.money -= UNIT_COSTS[unit.type]; // Deduct the cost from the player's money
      return true;
    }
  } else {
    return false;
  }
}

function placeUnitOnHex(hex, unit) {
  // print("Attempting to place unit " + unit.id + " on hex " + hex.getKey());
  if (!hex.addUnit(unit)) {
    return false;
  }
  hex.occupiedBy = unit.playerID;
  unit.q = hex.q; // Set unit's q coordinate
  unit.r = hex.r; // Set unit's r coordinate
  let player = players.find(p => p.id === unit.playerID);
  if (player) {
    player.occupiedHexes.add(hex); // TODO: occupiedHexes added to here BROKEN
    if (unit.type === 'settler') {
      hex.claimedBy = unit.playerID; // Only claim hex if the unit is a settler
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

  // Create and add the unit placement animation
  let duration = 1000 * delayMultiplier; // 1 second duration
  let animation = new Animation('unitPlacement', unit, hex, duration);
  animationManager.addAnimation(unit, animation);

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

function updatePlayerOccupiedHexes(player, fromHex, toHex) {
  // Remove fromHex if it has no units left or no units belonging to the player
  if (fromHex.units.length === 0 || !fromHex.doesPlayerHaveUnits(player)) {
    player.occupiedHexes.delete(fromHex);
  }

  // Add toHex to the player's occupied hexes
  player.occupiedHexes.add(toHex);
}

function moveUnit(player, unit, fromHex, toHex) {
  if (!canMoveUnit(fromHex, toHex)) {
    return false;
  }

  if (unit.movement === 0) {
    return false;
  }

  if (!isAdjacent(fromHex, toHex)) {
    console.log(`Cannot move unit: Hexes (${fromHex.q}, ${fromHex.r}) and (${toHex.q}, ${toHex.r}) are not adjacent.`);
    return false;
  }

  let duration = 1000 * delayMultiplier;
  let animation = new Animation('unitMovement', unit, toHex, duration);

  animationManager.addAnimation(unit, animation);
  player.decisionQueue.push({ type: "move", unit: unit, hex: toHex });

  console.log(`MOVE: ${unit.id} from (${fromHex.q}, ${fromHex.r}) to (${toHex.q}, ${toHex.r})`);
  updatePlayerOccupiedHexes(player, fromHex, toHex);

  return true;
}


function createUnit(player, unitType) {
  switch (unitType) {
    case 'soldier':
      return new Unit(player.id, unitType, 50, 10, 5, player.colour, 1); // Example values for soldier
    case 'farmer':
      return new Unit(player.id, unitType, 30, 5, 2, player.colour, 1, Farm); // Example values for farmer with build capability
    case 'settler':
      return new Unit(player.id, unitType, 20, 0, 1, player.colour, 0); // Example values for settler with 0 movement
    case 'builder':
      return new Unit(player.id, unitType, 40, 0, 3, player.colour, 1); // Example values for builder
    default:
      return new Unit(player.id, 'farmer', 30, 5, 2, player.colour, 1, Farm); // Default to farmer with build capability
  }
}

function moveRandomUnit(player, fromHex, toHex, options = {}) {
  if (!canMoveUnit(fromHex, toHex)) {
    return false;
  }

  let unitToMove = random(player.getMovableUnits());

  if (unitToMove.movement === 0) {
    return false;
  }

  return player.moveUnit(unitToMove, fromHex, toHex);
}