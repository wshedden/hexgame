class Unit {
  constructor(playerID, type, health, attack, defence, playerColour, movement, canBuild = null) {
    this.playerID = playerID;
    this.type = type;
    this.health = health;
    this.attack = attack;
    this.defence = defence;
    this.movement = movement; // Add movement attribute
    this.battle = null; // Track the battle the unit is involved in
    this.q = -1; // Initialize hex q coordinate to -1
    this.r = -1; // Initialize hex r coordinate to -1
    this.canBuild = canBuild; // Add canBuild attribute
    this.isAnimating = false; // Add isAnimating attribute
    this.animationsLeft = 0; // New attribute
    this.allAnimationComplete = true;
    this.hex = null;
    this.colour = color(playerColour[0], playerColour[1], playerColour[2]); // Set unit.colour to player.colour
    this.size = 20; // Default size
  }

  build(hex) {
    if (this.canBuild && hex.building === null) {
      let building = new this.canBuild(this.playerID, hex.q, hex.r);
      hex.building = building;
      if (this.type === 'farmer') {
        this.movement = 0; // Set movement to 0 after building a farm
      }
      return true;
    }
    return false;
  }
}

function getUnitEmoji(unitType) {
  switch (unitType) {
    case 'soldier':
      return '⚔️'; // Sword emoji for soldier
    case 'farmer':
      return '🌾'; // Sheaf of rice emoji for farmer
    case 'settler':
      return '🏠'; // House emoji for settler
    case 'builder':
      return '🔨'; // Hammer emoji for builder
    default:
      return '❓'; // Question mark emoji for unknown unit type
  }
}

function moveUnitToHex(unit, fromHex, toHex) {
  if (unit.movement <= 0) {
    return false;
  }

  console.log(`Moving unit ${unit.playerID} from (${fromHex.q}, ${fromHex.r}) to (${toHex.q}, ${toHex.r})`);

  // toHex.units.push(unit);
  // fromHex.units.splice(fromHex.units.indexOf(unit), 1);

  return true;
}

function moveRandomUnit(player, fromHex, toHex, options = {}) {
  if (!canMoveUnit(fromHex, toHex)) {
    return false;
  }

  let unitToMove = random(fromHex.units);

  if (!moveUnitToHex(unitToMove, fromHex, toHex)) {
    return false;
  }

  let duration = 1000 * delayMultiplier; // Per unit of movement
  let path = player.paths.get(unitToMove); // Get the path for the unit
  // Create the animation
  let animation = new Animation('unitMovement', unitToMove, toHex, duration, path);

  // Add the animation to the unit's queue
  animationManager.addAnimation(unitToMove, animation);

  updatePlayerOccupiedHexes(player, fromHex, toHex);

  return true;
}