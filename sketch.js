let selectedHex = null;
let selectedUnitType = 'settler'; // Default to 'settler'
let panelManager;
let aiPanelVisible = true; // Track the visibility of the AI panel
let toggleButton; // Declare the toggle button
let toggleFailedOutputButton; // Declare the toggle failed output button
let showFailedOutput = true; // Track the visibility of failed AI decision output
let buttonColor1 = '#28a745'; // Green color
let buttonColor2 = '#dc3545'; // Red color
let pathfindingMode = true;
let path = []; // Store the path found by A* algorithm

function setup() {
  createCanvas(1800, 900);
  initialiseGrid(7);
  initialiseTerrainColours();
  generateTerrain();
  setState(GameState.INIT);

  panelManager = new PanelManager();
  panelManager.registerPanels();
  panelManager.loadPanelPositions(); // Load panel positions

  toggleButton = createButton('Toggle AI Panel');
  toggleButton.id('toggleButton');
  toggleButton.class('toggle-button');
  toggleButton.position(width - 150, 10);
  toggleButton.style('background-color', '#6c757d');
  toggleButton.mousePressed(toggleAIPanel);

  toggleFailedOutputButton = createButton('Toggle Failed Output');
  toggleFailedOutputButton.id('toggleFailedOutputButton');
  toggleFailedOutputButton.class('toggle-button');
  toggleFailedOutputButton.position(width - 150, 50);
  toggleFailedOutputButton.mousePressed(toggleFailedOutput);
  toggleFailedOutputButton.style('background-color', buttonColor1);

  const progressButton = createButton('Progress Game State');
  progressButton.id('progressButton');
  progressButton.class('toggle-button');
  progressButton.position(width - 150, 90);
  progressButton.style('background-color', '#6c757d');
  progressButton.mousePressed(progressGameState);

  // New button to reset panel positions
  const resetButton = createButton('Reset Panel Positions');
  resetButton.id('resetButton');
  resetButton.class('toggle-button');
  resetButton.position(width - 150, 130); // Position below the progress button
  resetButton.style('background-color', '#6c757d');
  resetButton.mousePressed(() => panelManager.resetPanelPositions());
}

function draw() {
  background(20); // Set the background to a dark color
  drawGameState();
  // Draw panels
  panelManager.updatePanels();
  toggleFailedOutputButton.style('background-color', showFailedOutput ? buttonColor1 : buttonColor2);

  if (currentState === GameState.PAUSED) {
    drawPausedState();
  }

  drawPath(); // Draw the path if in pathfinding mode

  // Draw AI paths
  drawAIPaths();
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
  } else if (key === 'p' || key === 'P') { // Pause the game with 'p'
    if (currentState != GameState.PAUSED) {
      setState(GameState.PAUSED);
    } else if (currentState === GameState.PAUSED) {
      setState(GameState.PLAYING);
    }
  } else if (key === "'") { // Switch player with '
    switchPlayer();
  } else if (keyCode === LEFT_ARROW) {
    speedMultiplier = max(0.1, speedMultiplier / 1.1); // Decrease speed, minimum 0.1x
  } else if (keyCode === RIGHT_ARROW) {
    speedMultiplier = min(1000, speedMultiplier * 1.1); // Increase speed, maximum 1000x
  } else if (key === '1') {
    selectedUnitType = 'settler';
  } else if (key === '2') {
    selectedUnitType = 'soldier';
  } else if (key === 'x' || key === 'X') { // Toggle pathfinding mode with 'x'
    pathfindingMode = !pathfindingMode;
    if (pathfindingMode) {
      print("Pathfinding mode activated.");
    } else {
      print("Pathfinding mode deactivated.");
      path = []; // Clear the path when exiting pathfinding mode
    }
  }
}
function mousePressed() {
  let wasPanelClicked = false;
  panelManager.panels.forEach(panel => {
    panel.mousePressed();
    if (panel.dragging) {
      wasPanelClicked = true;
    }
  });

  if (!wasPanelClicked) {
    let clickedHex = pixelToHex(mouseX - width / 2, mouseY - height / 2);
    if (clickedHex) {
      selectedHex = clickedHex;

      if (pathfindingMode) {
        if (path.length === 0) {
          path.push(clickedHex);
        } else if (path.length === 1) {
          path.push(clickedHex);
          path = aStar(path[0], path[1], hexGrid);
        } else {
          path = [clickedHex];
        }
      } else if (currentPlayerIndex === 0 && currentState === GameState.PLAYING_HUMAN) {
        let player = players[currentPlayerIndex];
        let unitType = selectedUnitType;
        let newUnit = new Unit(player.id, unitType, unitType === 'soldier' ? 100 : 50, unitType === 'soldier' ? 20 : 5, unitType === 'soldier' ? 10 : 5, player.color);

        if (placeUnit(clickedHex.q, clickedHex.r, newUnit)) {
          switchPlayer();
          turnStartTime = millis();
          turnNumber++;
        } else {
          print(`Cannot place unit at (${clickedHex.q}, ${clickedHex.r}).`);
        }
      }
    }
  }
}

function mouseDragged() {
  panelManager.panels.forEach(panel => panel.mouseDragged());
}

function mouseReleased() {
  panelManager.panels.forEach(panel => panel.mouseReleased());
}

function drawSelectedUnitTypePanel() {
  rectMode(CORNER); // Ensure rectMode is set to CORNER
  fill(0, 0, 0, 150); // Semi-transparent black background
  rect(10, height - 60, 190, 50, 10); // Position the panel at the bottom left
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);s
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
  // Swap button colors
  const button = document.getElementById('toggleFailedOutputButton');
  if (showFailedOutput) {
    button.style.backgroundColor = buttonColor1;
  } else {
    button.style.backgroundColor = buttonColor2;
  }
}

function drawAIPaths() {
  players.forEach(player => {
    player.paths.forEach((path, unit) => {
      drawUnitPath(path, player.colour);
    });
  });
}



