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
  }

  getKey() {
    return `${this.q},${this.r}`;
  }

  addUnit(unit) {
    this.units.push(unit);
  }
}