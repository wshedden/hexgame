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
    this.claimedBy = claimedBy; // New attribute
    this.fertility = fertility; // New attribute
    this.colour = getTerrainColour(type);
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
      this.claimedBy = unit.id;
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
    this.claimedBy = player.id;
  }

  unclaim() {
    this.claimedBy = null;
  }
}