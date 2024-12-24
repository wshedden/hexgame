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
    drawFarmTexture(pos.x, pos.y, 30); // Draw the farm texture
    fill(255);
    textAlign(CENTER, CENTER);
    text('Farm', pos.x, pos.y); // Show building type in the center
  }
}
