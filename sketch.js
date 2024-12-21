let selectedHex = null;
let selectedUnitType = 'settler'; // Default to 'settler'
let panelManager;
let aiPanelVisible = true; // Track the visibility of the AI panel
let toggleButton; // Declare the toggle button
let toggleFailedOutputButton; // Declare the toggle failed output button
let showFailedOutput = true; // Track the visibility of failed AI decision output

function setup() {
  createCanvas(1800, 900);
  initialiseGrid(9);
  initialiseTerrainColours();
  generateTerrain();
  setState(GameState.INIT);

  panelManager = new PanelManager();
  panelManager.registerPanels(); // Register panels

  // Create the toggle button
  toggleButton = createButton('Toggle AI Panel');
  toggleButton.id('toggleButton'); // Assign the ID for styling
  toggleButton.class('toggle-button'); // Assign the class for styling
  toggleButton.position(width - 150, 10); // Position the button on the right
  toggleButton.mousePressed(toggleAIPanel); // Attach the event listener

  // Create the toggle failed output button
  toggleFailedOutputButton = createButton('Toggle Failed Output');
  toggleFailedOutputButton.id('toggleFailedOutputButton'); // Assign the ID for styling
  toggleFailedOutputButton.class('toggle-button'); // Assign the class for styling
  toggleFailedOutputButton.position(width - 150, 50); // Position the button below the toggle button
  toggleFailedOutputButton.mousePressed(toggleFailedOutput); // Attach the event listener
}

function draw() {
  background(20); // Set the background to a dark color
  drawGameState();
  // Draw panels
  panelManager.updatePanels();

  if (currentState === GameState.PAUSED) {
    drawPausedState();
  }
}

function initialiseTerrainColours() {
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  panelManager.resizeCanvas(windowWidth, windowHeight);
}

function toggleAIPanel() {
  aiPanelVisible = !aiPanelVisible;
  const aiPanel = panelManager.getPanelByHeader('AI Decision Reasoning');
  if (aiPanel) {
    aiPanel.visible = aiPanelVisible;
  }
}

function toggleFailedOutput() {
  showFailedOutput = !showFailedOutput;
  const aiPanel = panelManager.getPanelByHeader('AI Decision Reasoning');
  if (aiPanel) {
    aiPanel.contentFunction = () => {
      const lines = players[currentPlayerIndex].decisionReasoning.split('\n');
      return showFailedOutput ? lines : lines.filter(line => !line.includes('❌'));
    };
  }
}

