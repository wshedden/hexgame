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
        const leftPanels = this.getPanelsBySide('left');
        const rightPanels = this.getPanelsBySide('right');

        this.positionPanels(leftPanels, 'left');
        this.positionPanels(rightPanels, 'right');

        this.positionSpecialPanels();
    }

    getPanelsBySide(side) {
        return this.panels.filter((panel, index) => {
            return side === 'left' ? index % 2 === 0 : index % 2 !== 0;
        });
    }

    positionPanels(panels, side) {
        const width = side === 'left' ? this.hexGridStartX : this.canvasWidth - this.hexGridEndX;
        const maxPanelHeight = this.canvasHeight / panels.length;

        panels.forEach((panel, index) => {
            panel.x = side === 'left' ? 0 : this.hexGridEndX;
            panel.y = index * maxPanelHeight;
            panel.width = width;
            panel.height = maxPanelHeight;
        });
    }

    positionSpecialPanels() {
        const aiPanel = this.getPanelByHeader('AI Decision Reasoning');
        if (aiPanel) {
            this.positionAIPanel(aiPanel);
        }

        const selectedUnitPanel = this.getPanelByHeader('Selected Unit');
        if (selectedUnitPanel) {
            this.positionSelectedUnitPanel(selectedUnitPanel);
        }
    }

    getPanelByHeader(header) {
        return this.panels.find(panel => panel.header === header);
    }

    positionAIPanel(panel) {
        panel.width = this.canvasWidth - this.hexGridEndX;
        panel.x = this.hexGridEndX;
        panel.y = 500; // Position it at the top with some margin
    }

    positionSelectedUnitPanel(panel) {
        panel.width = this.hexGridStartX;
        panel.x = 0;
        panel.y = this.canvasHeight - panel.contentHeight - 200; // Position it at the bottom left with some margin
    }

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
