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
            if (panel.header === 'Player 1 Hexes') {
                panel.x = 0;
                panel.y = index * maxPanelHeight;
                panel.width = width;
                panel.height = maxPanelHeight;
            } else if (panel.header === 'Player 2 Hexes') {
                const player1Panel = this.getPanelByHeader('Player 1 Hexes');
                panel.x = player1Panel.x + player1Panel.width - 20; // Position to the right of Player 1 panel with some margin
                panel.y = player1Panel.y;
                panel.width = width;
                panel.height = maxPanelHeight;
            } else {
                panel.x = side === 'left' ? 0 : this.hexGridEndX;
                panel.y = index * maxPanelHeight;
                panel.width = width;
                panel.height = maxPanelHeight;
            }
        });
    }

    positionSpecialPanels() {
        const aiPanel = this.getPanelByHeader('AI Decision Reasoning');
        const selectedUnitPanel = this.getPanelByHeader('Selected Unit');
        const player2Panel = this.getPanelByHeader('Player 2 Hexes');

        if (selectedUnitPanel && player2Panel) {
            selectedUnitPanel.x = player2Panel.x;
            selectedUnitPanel.y = player2Panel.y + player2Panel.height + 10; // Position below Player 2 panel with some margin
            selectedUnitPanel.width = player2Panel.width;
            selectedUnitPanel.height = this.canvasHeight - selectedUnitPanel.y; // Adjust height to fit within the canvas
        }

        if (aiPanel) {
            this.positionAIPanel(aiPanel);
        }
    }

    getPanelByHeader(header) {
        return this.panels.find(panel => panel.header === header);
    }

    positionAIPanel(panel) {
        panel.width = this.hexGridStartX;
        panel.x = 0;
        panel.y = this.canvasHeight - panel.contentHeight - 360; // Position it at the bottom left with some margin
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
                `📍 (${selectedHex.q}, ${selectedHex.r})`,
                `🌍 ${selectedHex.type}`,
                `🔢 ${selectedHex.noiseValue.toFixed(2)}`,
                `🌱 ${selectedHex.fertility.toFixed(2)}`,
                `👑 ${selectedHex.claimedBy ? `Player ${selectedHex.claimedBy}` : 'Unclaimed'}`
            ];

            selectedHex.units.forEach((unit, i) => {
                let unitEmoji = getUnitEmoji(unit.type);
                content.push(
                    `${unitEmoji} ${unit.type} ❤️${unit.health} ⚔️${unit.attack} 🛡️${unit.defence} 🚶${unit.movement}`
                );
            });

            return content;
        });

        this.createPanel('Player 1 Hexes', () => generatePlayerPanelContent(players[0]));
        this.createPanel('Player 2 Hexes', () => generatePlayerPanelContent(players[1]));
        this.createPanel('Selected Unit', () => [`Selected Unit: ${selectedUnitType}`]);
        this.createPanel('AI Decision Reasoning', () => players[currentPlayerIndex].decisionReasoning.split('\n'));

        this.organisePanels(); // Organise panels after registering them
    }
}
