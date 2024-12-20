class Hex {
  constructor(occupiedBy, q, r, type = 'grass', unit = null, text = '', noiseValue = 0) {
    this.q = q;
    this.r = r;
    this.s = -q - r; // Cube coordinate
    this.type = type;
    this.unit = unit;
    this.text = text;
    this.noiseValue = noiseValue;
    this.occupiedBy = occupiedBy;
  }

  getKey() {
    return `${this.q},${this.r}`;
  }
}