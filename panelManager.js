class PanelManager {
    constructor(canvasWidth = 1800, canvasHeight = 900, hexGridStartX = 300, hexGridEndX = 1500) {
        this.panels = [];
        this.canvasWidth = canvasWidth; // Default canvas width
        this.canvasHeight = canvasHeight; // Default canvas height
        this.hexGridStartX = hexGridStartX; // Example value, adjust based on actual hex grid start
        this.hexGridEndX = hexGridEndX; // Example value, adjust based on actual hex grid end
        this.grid = []; // To store grid cells
    }

    registerPanel(panel) {
        this.panels.push(panel);
        this.organisePanels(); // Reorganise whenever a panel is added
    }

    updateAndDrawPanels() {
        restrictPanelPositions();

        this.panels.forEach(panel => panel.draw());
        restrictPanelPositions();
    }

    createPanel(header, contentFunction, options = {}) {
        const panel = new Panel(0, 0, 0, header, contentFunction, options);
        this.registerPanel(panel);
        return panel;
    }

    organisePanels() {
        // Reset and rebuild the grid
        this.buildGrid();

        this.panels.forEach(panel => {
            const position = this.findNextGridCell(panel.options.size || { width: 1, height: 1 });
            if (position) {
                this.placePanel(panel, position);
            }
        });
    }

    buildGrid() {
        const gridColumns = Math.floor(this.canvasWidth / 200); // Example: 200px cell width
        const gridRows = Math.floor(this.canvasHeight / 100); // Example: 100px cell height

        this.grid = Array.from({ length: gridRows }, () => Array(gridColumns).fill(null));
    }

    findNextGridCell(size) {
        const rows = this.grid.length;
        const cols = this.grid[0].length;

        for (let row = 0; row < rows - size.height + 1; row++) {
            for (let col = 0; col < cols - size.width + 1; col++) {
                if (this.canPlaceAt(row, col, size)) {
                    return { row, col };
                }
            }
        }
        return null; // No space found
    }

    canPlaceAt(startRow, startCol, size) {
        for (let row = 0; row < size.height; row++) {
            for (let col = 0; col < size.width; col++) {
                if (this.grid[startRow + row][startCol + col] !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    placePanel(panel, position) {
        const cellWidth = this.canvasWidth / this.grid[0].length;
        const cellHeight = this.canvasHeight / this.grid.length;

        panel.x = position.col * cellWidth;
        panel.y = position.row * cellHeight;
        panel.width = cellWidth * panel.options.size.width - 10; // Subtract margin
        panel.height = cellHeight * panel.options.size.height - 10; // Subtract margin

        // Mark the grid cells as occupied
        for (let row = 0; row < panel.options.size.height; row++) {
            for (let col = 0; col < panel.options.size.width; col++) {
                this.grid[position.row + row][position.col + col] = panel;
            }
        }
    }

    resizeCanvas(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.organisePanels(); // Reorganise panels based on the new dimensions
    }

    

    registerPanels() {
        this.createPanel('Game State', () => [
            `State: ${panelManager.currentState}`,
            `Player: ${players[currentPlayerIndex].id}`,
            `Turn: ${turnNumber}`,
            `Pathfinding: ${pathfindingMode ? '✅' : '❌'}`
        ], { side: 'left', size: { width: 1, height: 1 } });

        this.createPanel('Hex Info', () => {
            if (!selectedHex) return ['No hex selected'];
            let content = [
                `📍 (${selectedHex.q}, ${selectedHex.r})`,
                `🌍 ${selectedHex.type}`,
                `🔢 ${selectedHex.noiseValue.toFixed(2)}`,
                `🌱 ${selectedHex.fertility.toFixed(2)}`,
                `👑 ${selectedHex.claimedBy ? `Player ${selectedHex.claimedBy}` : 'Unclaimed'}`
            ];

            if (selectedHex.building) {
                content.push(`🏢 Building: ${selectedHex.building.type}`);
            }

            if (selectedHex.units.length > 0) {
                selectedHex.units.forEach((unit, i) => {
                    let unitEmoji = getUnitEmoji(unit.type);
                    let unitTypeCapitalized = unit.type.charAt(0).toUpperCase() + unit.type.slice(1);
                    let playerSymbol = unit.playerID === 1 ? '🔴' : '🔵'; // Red circle for Player 1, Blue circle for Player 2
                    let idEmoji = '🆔'; // ID emoji
                    content.push(
                        `${playerSymbol} ${unitEmoji} ${unitTypeCapitalized} ${idEmoji} ${unit.id} ❤️${unit.health} ⚔️${unit.attack} 🛡️${unit.defence} 🚶${unit.movement}`
                    );
                });
            }

            // Check if there's a battle happening in the selected hex
            if (players.some(player => player.battleHexes.has(selectedHex.getKey()))) {
                content.push('⚔️🔥💥 Battle in progress! 💥🔥⚔️');
            }

            return content;
        }, { side: 'left', size: { width: 1, height: 2 } });

        this.createPanel('Player 1 Hexes', () => generatePlayerPanelContent(players[0]), { side: 'left', size: { width: 1, height: 1 } });
        this.createPanel('Player 2 Hexes', () => generatePlayerPanelContent(players[1]), { side: 'right', size: { width: 1, height: 1 } });
        this.createPanel('AI Decision Reasoning', () => {
            let lines = players[currentPlayerIndex].decisionReasoning.split('\n');
            lines.unshift(`Player ${currentPlayerIndex + 1} decisions:`);
            return lines;
        }, { side: 'right', size: { width: 1, height: 2 } });
        this.createPanel('Animation Queue', () => this.generateAnimationQueueContent(), { side: 'right', size: { width: 1, height: 1 } });

        this.organisePanels(); // Organise panels after registering them
    }

    generateAnimationQueueContent() {
        const content = [];
        if (animationManager.animations.length === 0) {
            content.push("No animations in queue");
        } else {
            animationManager.animations.forEach((animation, index) => {
                content.push(`  Animation ${index + 1}:`);
                content.push(`    Type: ${animation.type}`);
                content.push(`    Hex: (${animation.hex.q}, ${animation.hex.r})`);
                content.push(`    Duration: ${animation.duration}ms`);
                if (animation.isAnimating) {
                    content.push(`    Progress: ${(animation.progress * 100).toFixed(2)}%`);
                } else {
                    content.push(`    🚫 Not started`);
                }
                content.push(""); // Add a newline after each animation
            });
        }
        return content;
    }

    getPanelByHeader(header) {
        return this.panels.find(panel => panel.header === header);
    }

    savePanelPositions() {
        const positions = this.panels.map(panel => ({ header: panel.header, x: panel.x, y: panel.y }));
        localStorage.setItem('panelPositions', JSON.stringify(positions));
    }

    loadPanelPositions() {
        const positions = JSON.parse(localStorage.getItem('panelPositions'));
        if (positions) {
            positions.forEach(pos => {
                const panel = this.getPanelByHeader(pos.header);
                if (panel) {
                    panel.x = pos.x;
                    panel.y = pos.y;
                }
            });
        }
    }

    resetPanelPositions() {
        this.panels.forEach(panel => {
            panel.x = 0;
            panel.y = 0;
        });
        this.organisePanels(); // Reorganise panels after resetting positions
        restrictPanelPositions();
        this.savePanelPositions(); // Save the reset positions
    }
}

function restrictPanelPositions() {
  const padding = 10; // Optional padding to keep panels slightly away from the edges
  const minX = padding;
  const minY = padding;
  const maxX = panelManager.canvasWidth - padding;
  const maxY = panelManager.canvasHeight - padding;

  panelManager.panels.forEach(panel => {

    if (panel.x < minX) {
      panel.x = minX;
    }
    if (panel.x + panel.width > maxX) {
      panel.x = maxX - panel.width;
    }
    if (panel.y < minY) {
      panel.y = minY;
    }
    if (panel.y + panel.height > maxY) {
      panel.y = maxY - panel.height;
    }

  });
}