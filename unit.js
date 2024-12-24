class Unit {
  constructor(id, type, health, attack, defence, playerColour, movement, canBuild = null) {
    this.id = id;
    this.type = type;
    this.health = health;
    this.attack = attack;
    this.defence = defence;
    this.movement = movement; // Add movement attribute
    this.battle = null; // Track the battle the unit is involved in
    this.q = -1; // Initialize hex q coordinate to -1
    this.r = -1; // Initialize hex r coordinate to -1
    this.canBuild = canBuild; // Add canBuild attribute
    if (type === 'settler') {
      this.colour = lerpColor(color(0, 255, 0), color(playerColour[0], playerColour[1], playerColour[2]), 0.5); // Interpolated colour for settlers
    } else if (type === 'farmer') {
      this.colour = lerpColor(color(255, 215, 0), color(playerColour[0], playerColour[1], playerColour[2]), 0.5); // Blended colour for farmers
    } else {
      this.colour = color(playerColour[0], playerColour[1], playerColour[2]);
    }
    this.size = 20; // Default size
  }

  build(hex) {
    if (this.canBuild && hex.building === null) {
      let building = new this.canBuild(this.id, hex.q, hex.r);
      hex.building = building;
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