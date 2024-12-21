class PanelManager {
    constructor() {
        this.panels = [];
        this.canvasWidth = 1800; // Default canvas width
        this.canvasHeight = 900; // Default canvas height
        this.hexGridStartX = 300; // Example value, adjust based on actual hex grid start
        this.hexGridEndX = 1500; // Example value, adjust based on actual hex grid end
    }

    registerPanel(panel) {
        this.panels.push(panel);
        this.organisePanels(); // Reorganise whenever a panel is added
    }

    updatePanels() {
        this.panels.forEach(panel => panel.draw());
    }

    createPanel(header, contentFunction, options = {}) {
        const panel = new Panel(0, 0, 0, header, contentFunction, options);
        this.registerPanel(panel);
        return panel;
    }

    organisePanels() {
        const panelCount = this.panels.length;
        const leftPanels = [];
        const rightPanels = [];

        // Split panels between left and right sections
        this.panels.forEach((panel, index) => {
            if (index % 2 === 0) {
                leftPanels.push(panel);
            } else {
                rightPanels.push(panel);
            }
        });

        // Calculate available space
        const leftWidth = this.hexGridStartX;
        const rightWidth = this.canvasWidth - this.hexGridEndX;
        const maxPanelHeight = this.canvasHeight / Math.max(leftPanels.length, rightPanels.length);

        // Position left panels
        leftPanels.forEach((panel, index) => {
            panel.x = 0;
            panel.y = index * maxPanelHeight;
            panel.width = leftWidth;
            panel.height = maxPanelHeight;
        });

        // Position right panels
        rightPanels.forEach((panel, index) => {
            panel.x = this.hexGridEndX;
            panel.y = index * maxPanelHeight;
            panel.width = rightWidth;
            panel.height = maxPanelHeight;
        });

        // Specific placement for "AI Decision Reasoning" panel
        const aiPanel = this.panels.find(panel => panel.header === 'AI Decision Reasoning');
        if (aiPanel) {
            aiPanel.width = rightWidth;
            aiPanel.x = this.hexGridEndX;
            aiPanel.y = 20; // Position it at the top with some margin
        }

        // Specific placement for "Selected Unit" panel at the bottom left
        const selectedUnitPanel = this.panels.find(panel => panel.header === 'Selected Unit');
        if (selectedUnitPanel) {
            selectedUnitPanel.width = leftWidth;
            selectedUnitPanel.x = 0;
            selectedUnitPanel.y = this.canvasHeight - selectedUnitPanel.contentHeight - 20; // Position it at the bottom left with some margin
        }
    }

    // Call when canvas is resized
    resizeCanvas(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.organisePanels(); // Reorganise panels based on the new dimensions
    }

    registerPanels() {
        this.createPanel('Game State', () => [
            `State: ${currentState}`,
            `Player: ${players[currentPlayerIndex].id}`,
            `Turn: ${turnNumber}`,
            `Time Left: ${(Math.max(0, turnDuration * (1 / speedMultiplier) - (millis() - turnStartTime)) / 1000).toFixed(1)}s`,
            `Speed: ${speedMultiplier.toFixed(3)}x`
        ]);

        this.createPanel('Hex Info', () => {
            if (!selectedHex) return ['No hex selected'];
            let content = [
                `Hex: (${selectedHex.q}, ${selectedHex.r})`,
                `Type: ${selectedHex.type}`,
                `Noise: ${selectedHex.noiseValue.toFixed(2)}`,
                `Fertility: ${selectedHex.fertility.toFixed(2)}`,
                `Claimed By: ${selectedHex.claimedBy ? `Player ${selectedHex.claimedBy}` : 'Unclaimed'}`
            ];

            selectedHex.units.forEach((unit, i) => {
                content.push(
                    `Unit ${i + 1}: ${unit.type}`,
                    `Health: ${unit.health}`,
                    `Attack: ${unit.attack}`,
                    `Defence: ${unit.defence}`,
                    ''
                );
            });

            return content;
        });

        this.createPanel('Player 1 Hexes', () => generatePlayerPanelContent(players[0]));
        this.createPanel('Player 2 Hexes', () => generatePlayerPanelContent(players[1]));
        this.createPanel('Selected Unit', () => [`Selected Unit: ${selectedUnitType}`]);
        this.createPanel('AI Decision Reasoning', () => [`Reasoning: ${players[currentPlayerIndex].decisionReasoning}`]);

        this.organisePanels(); // Organise panels after registering them
    }
}
