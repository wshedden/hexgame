let selectedHex = null;

function setup() {
  createCanvas(1800, 900);
  initializeGrid(9);
  initializeTerrainColors();
  generateTerrain();

  setState(GameState.INIT);
}

function draw() {
  background(20); // Set the background to a dark color
  drawGameState();
  drawGameStatePopup(); // Draw the game state popup in the top left corner
  drawHexInfoPopup(selectedHex); // Draw the hex info popup in the top right corner
  drawPlayerHexesPopup(players[0], 10, 270); // Draw the player 1 hexes popup
  drawPlayerHexesPopup(players[1], 210, 270); // Draw the player 2 hexes popup next to player 1

  if (currentState === GameState.PAUSED) {
    drawPausedState();
  }
}

function initializeTerrainColors() {
  registerTerrainType('grass', color(100, 200, 100));
  registerTerrainType('water', color(50, 100, 200));
  registerTerrainType('mountain', color(100, 100, 100));
  registerTerrainType('desert', color(237, 201, 175));
  registerTerrainType('forest', color(34, 139, 34));
  registerTerrainType('snow', color(255, 250, 250));
}

function keyPressed() {
  handleKeyPress();
}

function mousePressed() {
  let clickedHex = pixelToHex(mouseX - width / 2, mouseY - height / 2);
  if (clickedHex) {
    selectedHex = clickedHex;
    // print(selectedHex);
    // console.log(`Clicked Hex: (${clickedHex.q}, ${clickedHex.r})`);
    // console.log(`Type: ${clickedHex.type}`);
    // console.log(`Noise Value: ${clickedHex.noiseValue}`);
    // console.log(`Text: ${clickedHex.text}`);
    if (clickedHex.unit) {
      // console.log(`Unit Type: ${clickedHex.unit.type}`);
      // console.log(`Unit Health: ${clickedHex.unit.health}`);
    }
  }
}
