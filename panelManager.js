class PanelManager {
    constructor() {
        this.panels = [];
        this.canvasWidth = 1800; // Default canvas width
        this.canvasHeight = 900; // Default canvas height
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

        // Calculate grid dimensions dynamically
        const columns = Math.ceil(Math.sqrt(panelCount)); // Square-like layout
        const rows = Math.ceil(panelCount / columns);

        // Calculate panel dimensions
        this.panels.forEach(panel => panel.calculateDimensions());
        const maxPanelWidth = Math.max(...this.panels.map(panel => panel.contentWidth));
        const panelHeight = this.canvasHeight / rows;

        // Position panels in the grid
        this.panels.forEach((panel, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            panel.x = col * maxPanelWidth;
            panel.y = row * panelHeight;
            panel.width = maxPanelWidth;
            panel.height = panelHeight;
        });
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
