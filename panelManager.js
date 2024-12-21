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
        this.managePanels(); // Reorganize whenever a panel is added
    }

    updatePanels() {
        this.panels.forEach(panel => panel.draw());
    }

    createPanel(header, contentFunction, options = {}) {
        const panel = new Panel(0, 0, 0, header, contentFunction, options);
        this.registerPanel(panel);
        return panel;
    }

    managePanels() {
        // Step 1: Assign panels to zones
        const zones = this.assignPanelsToZones();

        // Step 2: Organize each zone
        this.organizeZone(zones.left, 0, 100, this.hexGridStartX, this.canvasHeight - 200);
        this.organizeZone(zones.right, this.hexGridEndX, 100, this.canvasWidth - this.hexGridEndX, this.canvasHeight - 200);
        this.organizeZone(zones.top, 0, 0, this.canvasWidth, 100);
        this.organizeZone(zones.bottom, 0, this.canvasHeight - 100, this.canvasWidth, 100);

        // Step 3: Update floating panels
        this.updateFloatingPanels();

        // Step 4: Resize panels dynamically
        this.resizePanels();
    }

    assignPanelsToZones() {
        const zones = { left: [], right: [], top: [], bottom: [] };

        // Distribute panels into zones dynamically based on their header or priority
        this.panels.forEach(panel => {
            if (panel.header.includes('Player')) {
                zones.left.push(panel);
            } else if (panel.header === 'AI Decision Reasoning') {
                zones.top.push(panel);
            } else {
                zones.right.push(panel);
            }
        });

        return zones;
    }

    organizeZone(panels, startX, startY, width, height) {
        const panelHeight = height / panels.length;

        panels.forEach((panel, index) => {
            panel.x = startX;
            panel.y = startY + index * panelHeight;
            panel.width = width;
            panel.height = panelHeight;
        });
    }

    updateFloatingPanels() {
        const floatingPanels = this.panels.filter(panel => panel.floating);

        floatingPanels.forEach(panel => {
            panel.x = mouseX + 10; // Example: Follow mouse
            panel.y = mouseY + 10;
        });
    }

    resizePanels() {
        const totalPanelWidth = this.canvasWidth;
        const maxWidthPerPanel = totalPanelWidth / this.panels.length;

        this.panels.forEach(panel => {
            if (this.canvasWidth < 1000) {
                panel.width = Math.min(panel.width, maxWidthPerPanel / 2); // Shrink panels
                panel.collapsed = true;
            } else {
                panel.collapsed = false;
            }
        });
    }

    resizeCanvas(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.managePanels(); // Reorganize panels based on the new dimensions
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

        this.managePanels(); // Organize panels after registering them
    }
}
