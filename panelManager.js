class PanelManager {
    constructor() {
        this.panels = [];
        this.grid = [];
        this.columns = 3; // Example column count for grid layout
        this.rows = 3; // Example row count for grid layout
        this.canvasWidth = 1800; // Assuming canvas width is 1800
        this.canvasHeight = 900; // Assuming canvas height is 900
    }

    registerPanel(panel) {
        this.panels.push(panel);
        this.organizePanels();
    }

    updatePanels() {
        this.panels.forEach(panel => panel.draw());
    }

    createPanel(header, contentFunction, options = {}) {
        const panel = new Panel(0, 0, 0, header, contentFunction, options);
        this.registerPanel(panel);
        return panel;
    }

    organizePanels() {
        const panelWidth = this.canvasWidth / this.columns;
        const panelHeight = this.canvasHeight / this.rows;

        this.panels.forEach((panel, index) => {
            const col = index % this.columns;
            const row = Math.floor(index / this.columns);

            panel.x = col * panelWidth;
            panel.y = row * panelHeight;
            panel.width = panelWidth;
            panel.height = panelHeight;
        });
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

        this.organizePanels();
    }
}