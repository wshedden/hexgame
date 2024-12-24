class Building {
  constructor(type, owner_id, q = 0, r = 0) {
    this.type = type;
    this.owner_id = owner_id;
    this.q = q; // Hex coordinate q
    this.r = r; // Hex coordinate r
    this.level = 1; // Buildings can be upgraded
    this.health = 100; // Default health
  }

  // Set hex coordinates
  setHexCoordinates(q, r) {
    this.q = q;
    this.r = r;
  }

  // Upgrade the building
  upgrade() {
    this.level++;
    this.health += 50; // Upgrading also increases health
  }

  // Take damage
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  // Destroy the building
  destroy() {
    console.log(`Building of type ${this.type} at (${this.q}, ${this.r}) destroyed.`);
    // Add logic to remove the building from the game state
  }

  // Display the building
  display() {
    const pos = hexToPixel(this.q, this.r);
    fill(150);
    rect(pos.x - 25, pos.y - 25, 50, 50); // Default size for display
    fill(255);
    textAlign(CENTER, CENTER);
    text(this.type, pos.x, pos.y); // Show building type in the center
  }
}
