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

    updateAndDrawPanels() {
        this.panels.forEach(panel => panel.draw());
    }

    createPanel(header, contentFunction, options = {}) {
        const x = options.x || 0;
        const y = options.y || 0;
        const width = options.width || 200; // Default width if not provided
        const panel = new Panel(x, y, width, header, contentFunction, options);
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
        return this.panels.filter(panel => panel.options.side === side);
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
    }

    getPanelByHeader(header) {
        return this.panels.find(panel => panel.header === header);
    }

    positionAIPanel(panel) {
        panel.width = this.hexGridStartX;
        panel.x = 0;
        panel.y = this.canvasHeight - panel.contentHeight - 360; // Position it at the bottom left with some margin
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
        ], { side: 'left' });

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
        }, { side: 'left' });

        this.createPanel('Player 1 Hexes', () => generatePlayerPanelContent(players[0]), { side: 'left' });
        this.createPanel('Player 2 Hexes', () => generatePlayerPanelContent(players[1]), { side: 'right' });
        this.createPanel('AI Decision Reasoning', () => {
            let lines = players[currentPlayerIndex].decisionReasoning.split('\n');
            lines.unshift(`Player ${currentPlayerIndex + 1} decisions:`);
            return lines;
        }, { side: 'right' });
        this.createPanel('Animation Queue', () => this.generateAnimationQueueContent(), { side: 'right' });

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
        this.savePanelPositions(); // Save the reset positions
    }
}
