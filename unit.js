class Unit {
  constructor(playerID, type, health, attack, defence, playerColour, movement, canBuild = null) {
    this.id = generateUniqueID(); // Generate a unique ID for the unit
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