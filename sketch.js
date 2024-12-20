let selectedHex = null;
let selectedUnitType = 'settler'; // Default to 'settler'
let panelManager;

function setup() {
  createCanvas(1800, 900);
  initializeGrid(9);
  initializeTerrainColors();
  generateTerrain();
  setState(GameState.INIT);

  panelManager = new PanelManager();

  // Create and register panels
  panelManager.createPanel(10, 10, 200, 'Game State', () => [
    `State: ${currentState}`,
    `Player: ${players[currentPlayerIndex].id}`,
    `Turn: ${turnNumber}`,
    `Time Left: ${(Math.max(0, turnDuration * (1 / speedMultiplier) - (millis() - turnStartTime)) / 1000).toFixed(1)}s`,
    `Speed: ${speedMultiplier.toFixed(3)}x`
  ]);

  panelManager.createPanel(220, 10, 200, 'Hex Info', () => {
    if (!selectedHex) return ['No hex selected'];
    return [
      `Hex: (${selectedHex.q}, ${selectedHex.r})`,
      `Type: ${selectedHex.type}`,
      `Noise: ${selectedHex.noiseValue.toFixed(2)}`,
      ...selectedHex.units.map((unit, i) => [
        `Unit ${i}: ${unit.type}`,
        `Health: ${unit.health}`,
        `Attack: ${unit.attack}`,
        `Defence: ${unit.defense}`
      ]).flat()
    ];
  });

  panelManager.createPanel(10, 270, 200, 'Player 1 Hexes', () => [
    `Claimed Hexes: ${players[0].claimedHexes.length}`,
    ...players[0].claimedHexes.map((hex, i) => `Hex ${i}: (${hex.q}, ${hex.r})`)
  ]);

  panelManager.createPanel(220, 270, 200, 'Player 2 Hexes', () => [
    `Claimed Hexes: ${players[1].claimedHexes.length}`,
    ...players[1].claimedHexes.map((hex, i) => `Hex ${i}: (${hex.q}, ${hex.r})`)
  ]);

  panelManager.createPanel(10, height - 60, 200, 'Selected Unit', () => [
    `Selected Unit: ${selectedUnitType}`
  ]);
}

function draw() {
  background(20); // Set the background to a dark color
  drawGameState();
  drawGameStatePopup(); // Draw the game state popup in the top left corner
  drawHexInfoPopup(selectedHex); // Draw the hex info popup in the top right corner
  drawPlayerHexesPopup(players[0], 10, 270); // Draw the player 1 hexes popup
  drawPlayerHexesPopup(players[1], 210, 270); // Draw the player 2 hexes popup next to player 1
  drawSelectedUnitTypePanel(); // Draw the selected unit type panel

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
  if (currentState === GameState.INIT) {
    if (key === 't' || key === 'T') {
      players[0].isHuman = true;
      setState(GameState.PLAYING_HUMAN);
    } else {
      setState(GameState.PLAYING);
    }
  } else if (key === ' ') { // Check if the space key is pressed
    if (currentState === GameState.PLAYING) {
      setState(GameState.PAUSED);
    } else if (currentState === GameState.PAUSED) {
      setState(GameState.PLAYING);
    }
  } else if (key === 'p' || key === 'P') { // Check if the 'P' key is pressed
    switchPlayer();
  } else if (keyCode === LEFT_ARROW) {
    speedMultiplier = max(0.1, speedMultiplier / 1.1); // Decrease speed, minimum 0.1x
  } else if (keyCode === RIGHT_ARROW) {
    speedMultiplier = min(1000, speedMultiplier * 1.1); // Increase speed, maximum 1000x
  } else if (key === '1') {
    selectedUnitType = 'settler';
  } else if (key === '2') {
    selectedUnitType = 'soldier';
  }
}

function mousePressed() {
  let clickedHex = pixelToHex(mouseX - width / 2, mouseY - height / 2);
  if (clickedHex) {
    selectedHex = clickedHex;

    if (currentPlayerIndex === 0 && currentState === GameState.PLAYING_HUMAN) {
      let player = players[currentPlayerIndex];
      let unitType = selectedUnitType; // Use the selected unit type
      let newUnit = new Unit(player.id, unitType, unitType === 'soldier' ? 100 : 50, unitType === 'soldier' ? 20 : 5, unitType === 'soldier' ? 10 : 5, player.color); // Example values for attack and defense

      if (placeUnit(clickedHex.q, clickedHex.r, newUnit)) {
        switchPlayer(); // Switch to the next player if unit placement is successful
        turnStartTime = millis();
        // Update turn number
        turnNumber++;
      } else {
        print(`Cannot place unit at (${clickedHex.q}, ${clickedHex.r}).`);
      }
    }
  }
}

function drawSelectedUnitTypePanel() {
  rectMode(CORNER); // Ensure rectMode is set to CORNER
  fill(0, 0, 0, 150); // Semi-transparent black background
  rect(10, height - 60, 190, 50, 10); // Position the panel at the bottom left
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Selected Unit: ${selectedUnitType}`, 20, height - 35);
}
