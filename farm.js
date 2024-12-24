class Farm extends Building {
  constructor(owner_id, q = 0, r = 0) {
    super('Farm', owner_id, q, r);
    this.foodOutput = 10; // Base food output per turn
  }

  // Calculate food production, including bonuses for adjacency
  calculateFoodOutput(adjacentTiles) {
    let bonus = 0;
    adjacentTiles.forEach(tile => {
      if (tile.type === 'fertile') {
        bonus += 2; // Bonus for fertile tiles
      }
    });
    return this.foodOutput + bonus;
  }

  // Display the farm with a unique color
  display() {
    const pos = hexToPixel(this.q, this.r);
    fill(100, 200, 100); // Green color for farms
    rect(pos.x - 25, pos.y - 25, 50, 50); // Default size
    fill(255);
    textAlign(CENTER, CENTER);
    text('Farm', pos.x, pos.y); // Show building type in the center
  }
}
