function generateTerrain() {
  hexGrid.forEach((hex) => {
    let noiseValue = noise(hex.q * 0.1, hex.r * 0.1);
    hex.noiseValue = noiseValue;
    hex.text = noiseValue.toFixed(2); // Set the text to the noise value

    // Adjust the noise thresholds to make water more common
    if (noiseValue < 0.3) { // Increase the threshold for water
      hex.type = 'water';
      hex.fertility = 0; // Water has 0 fertility
      claimableTiles.delete(hex.getKey()); // Remove water tiles from claimable tiles
    } else if (noiseValue < 0.4) {
      hex.type = 'grass';
      hex.fertility = 0.8; // Grass has high fertility
    } else if (noiseValue < 0.6) {
      hex.type = 'desert';
      hex.fertility = 0.1; // Desert has very low fertility
    } else if (noiseValue < 0.7) {
      hex.type = 'mountain'; // Mountain tiles
      hex.fertility = 0.3; // Mountain has low fertility
    } else if (noiseValue < 0.8) {
      hex.type = 'forest';
      hex.fertility = 0.9; // Forest has very high fertility
    } else {
      hex.type = 'snow';
      hex.fertility = 0.1; // Snow has very low fertility
    }
  });
}