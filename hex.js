const MAX_UNITS_PER_HEX = 5;

class Hex {
  constructor(occupiedBy, q, r, type = 'grass', units = [], text = '', noiseValue = 0, claimedBy = null, fertility = 0) {
    this.q = q;
    this.r = r;
    this.s = -q - r; // Cube coordinate
    this.type = type;
    this.units = units; // Store multiple units
    this.text = text;
    this.noiseValue = noiseValue;
    this.occupiedBy = occupiedBy;
    this.claimedBy = claimedBy;
    this.fertility = fertility;
    this.colour = getTerrainColor(type, fertility);
    this.claimedColour = null;
    this.movementCost = 1; // Example value, adjust as needed
    this.battle = null; // Track the battle the hex is involved in
    this.building = null; // Track the building on the hex
  }

  setColourByFertility() {
    if (this.claimedColour) {
      this.colour = lerpColor(this.claimedColour, getTerrainColor(this.type, this.fertility), 0.2);
    } else {
      this.colour = getTerrainColor(this.type, this.fertility);
    }
  }

  getBuilding() {
    return this.building;
  }

  setBuilding(building) {
    this.building = building;
  }

  getKey() {
    return `${this.q},${this.r}`;
  }

  addUnit(unit) {
    if (this.units.length >= MAX_UNITS_PER_HEX) {
      console.log(`Cannot add unit to Hex (${this.q}, ${this.r}). Maximum limit of ${MAX_UNITS_PER_HEX} units reached.`);
      return false;
    }
    this.units.push(unit);
    if (unit.type == "settler") {
      this.claimedBy = unit.playerId;
      this.claimedColour = color(255);
    }
    return true;
  }

  removeUnit(unit) {
    let index = this.units.indexOf(unit);
    if (index !== -1) {
      this.units.splice(index, 1);
    }
  }

  claim(player) {
    this.claimedBy = player.playerId;
    this.claimedColour = color(player.colour[0], player.colour[1], player.colour[2]); // Set the claimedColour
  }

  unclaim() {
    this.claimedBy = null;
    this.claimedColour = null; // Reset the claimedColour
  }

  getMovableUnits() {
    if (this.isInBattle()) {
      return []; // No units can move if the hex is in battle
    }
    return this.units.filter(unit => unit.type !== 'settler' && unit.movement > 0);
  }
    
  hasEnemyUnits(playerId) {
    return this.units.some(unit => unit.playerId !== playerId);
  }

  startBattle() {
    this.battle = true;
    print(`Battle started at hex (${this.q}, ${this.r})`);
  }

  endBattle() {
    this.battle = false;
    print(`Battle ended at hex (${this.q}, ${this.r})`);
  }

  isInBattle() {
    return this.battle;
  }
}