const animationManager = new AnimationManager();
const stateManager = new StateManager();
let clickedPath = [];
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
let progressBar; // Progress bar for animations
let previousState = null;// Track the previous game state
let decisionsMadeElapsedTime = 0;
let animationElapsedTime = 0;
let delaySlider;
let unitInfoExpanded = false; // Add this line at the top of the file

function setup() {
  offsetX = 900;
  offsetY = 450;
  createCanvas(1800, 900);
  initialiseGrid(10);
  initialiseTerrainColours();
  generateTerrain();
  setState(new InitState());

  delaySlider = new Slider(50, height - 50, 300, 0.01, 5, delayMultiplier);

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

  const resetButton = createButton('Reset Panel Positions');
  resetButton.id('resetButton');
  resetButton.class('toggle-button');
  resetButton.position(width - 150, 130);
  resetButton.style('background-color', '#6c757d');
  resetButton.mousePressed(() => panelManager.resetPanelPositions());

  const toggleUnitInfoButton = createButton('Expand unit info');
  toggleUnitInfoButton.id('toggleUnitInfoButton');
  toggleUnitInfoButton.class('toggle-button');
  toggleUnitInfoButton.position(width - 150, 170);
  toggleUnitInfoButton.style('background-color', '#6c757d');
  toggleUnitInfoButton.mousePressed(toggleUnitInfo);

  progressBar = new ProgressBarAnimation(0, 200, 10000);
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
  if (stateManager.currentState instanceof InitState) {
    if (key === 't' || key === 'T') {
      players[0].isHuman = true;
      setState(new PlayingHumanState());
    } else {
      setState(new PlayingState());
    }
  } else if (key === 'p' || key === 'P') { // Pause the game with 'p'
    if (!(stateManager.currentState instanceof PausedState)) {
      stateManager.pause();
    } else {
      stateManager.resume();
    }
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
  delaySlider.keyPressed();
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
        if (clickedPath.length === 0) {
          clickedPath.push(clickedHex);
        } else if (clickedPath.length === 1) {
          clickedPath.push(clickedHex);
          clickedPath = aStar(clickedPath[0], clickedPath[1], hexGrid);
        } else {
          clickedPath = [clickedHex];
        }
      }
    }
  }
  delaySlider.mousePressed();
}

function mouseDragged() {
  panelManager.panels.forEach(panel => panel.mouseDragged());
}

function mouseReleased() {
  panelManager.panels.forEach(panel => panel.mouseReleased());
  delaySlider.mouseReleased();
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

function toggleUnitInfo() {
  unitInfoExpanded = !unitInfoExpanded;
  const button = document.getElementById('toggleUnitInfoButton');
  button.innerText = unitInfoExpanded ? 'Collapse unit info' : 'Expand unit info';
  panelManager.updatePanels(); // Update the panels to reflect the change
}



