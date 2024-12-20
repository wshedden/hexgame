function generateTerrain() {
  hexGrid.forEach((hex) => {
    let noiseValue = noise(hex.q * 0.1, hex.r * 0.1);
    hex.noiseValue = noiseValue;
    hex.text = noiseValue.toFixed(2); // Set the text to the noise value
    if (noiseValue < 0.2) hex.type = 'water';
    else if (noiseValue < 0.4) hex.type = 'grass';
    else if (noiseValue < 0.6) hex.type = 'desert';
    else if (noiseValue < 0.8) hex.type = 'forest';
    else hex.type = 'snow';
  });
}