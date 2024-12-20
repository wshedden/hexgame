function generateTerrain() {
  hexGrid.forEach((hex) => {
    let noiseValue = noise(hex.q * 0.1, hex.r * 0.1);
    hex.noiseValue = noiseValue;
    hex.text = noiseValue.toFixed(2); // Set the text to the noise value

    // Adjust the noise thresholds to make water more common
    if (noiseValue < 0.3) { // Increase the threshold for water
      hex.type = 'water';
      claimableTiles.delete(hex.getKey()); // Remove water tiles from claimable tiles
    } else if (noiseValue < 0.4) hex.type = 'grass';
    else if (noiseValue < 0.6) hex.type = 'desert';
    else if (noiseValue < 0.7) hex.type = 'mountain'; // Mountain tiles
    else if (noiseValue < 0.8) hex.type = 'forest';
    else hex.type = 'snow';
  });
}