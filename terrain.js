function generateTerrain() {
  hexGrid.forEach((hex) => {
    let noiseValue = noise(hex.q * 0.1, hex.r * 0.1);
    hex.noiseValue = noiseValue;
    hex.text = noiseValue.toFixed(2); // Set the text to the noise value

    if (noiseValue < 0.3) { // Increase the threshold for water
      hex.type = 'water';
      hex.fertility = 0; // Water has 0 fertility
      hex.colour = color(50, 100, 200); // Always blue for water
      claimableTiles.delete(hex.getKey()); // Remove water tiles from claimable tiles
    } else if (noiseValue < 0.4) {
      hex.type = 'grass';
      hex.fertility = 0.8 + random(-0.1, 0.1); // Grass has high fertility with some randomness
    } else if (noiseValue < 0.6) {
      hex.type = 'desert';
      hex.fertility = 0.1 + random(-0.05, 0.05); // Desert has very low fertility with some randomness
    } else if (noiseValue < 0.7) {
      hex.type = 'mountain'; // Mountain tiles
      hex.fertility = 0.3 + random(-0.1, 0.1); // Mountain has low fertility with some randomness
    } else if (noiseValue < 0.8) {
      hex.type = 'forest';
      hex.fertility = 0.9 + random(-0.1, 0.1); // Forest has very high fertility with some randomness
    } else {
      hex.type = 'snow';
      hex.fertility = 0.1 + random(-0.05, 0.05); // Snow has very low fertility with some randomness
    }

    hex.colour = getTerrainColor(hex.type, hex.fertility, noiseValue);

    if (hex.type !== 'water' && hex.type !== 'snow') {
      hex.setColourByFertility(); // Set the colour based on fertility
    }
  });
}