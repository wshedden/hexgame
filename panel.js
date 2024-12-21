class Panel {
    constructor(x, y, width, header, contentFunction, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.header = header;
        this.contentFunction = contentFunction; // Function that generates content
        this.padding = options.padding || 10;
        this.backgroundColour = options.backgroundColour || color(0, 0, 0, 200); // Default semi-transparent black
        this.textSize = options.textSize || 16;
        this.headerSize = options.headerSize || 18;
        this.contentHeight = 0;
        this.rightAligned = options.rightAligned || false; // New attribute for right-aligned panels
        this.bottomAligned = options.bottomAligned || false; // New attribute for bottom-aligned panels
    }

    // Calculate dynamic height based on the content
    calculateHeight() {
        push();
        textSize(this.textSize);
        textAlign(LEFT, TOP);
        this.contentHeight = this.headerSize + this.padding; // Initial space for the header

        // Temporarily measure the content height
        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            this.contentHeight += textAscent() + textDescent() + this.padding / 2;
        });
        pop();
    }

    draw() {
        this.calculateHeight();
        fill(this.backgroundColour);
        noStroke();
        rect(this.x, this.y, this.width, this.contentHeight, 10);

        fill(255);
        textSize(this.headerSize);
        textAlign(LEFT, TOP);
        text(this.header, this.x + this.padding, this.y + this.padding);

        textSize(this.textSize);
        let yOffset = this.y + this.headerSize + this.padding; // Space for the header
        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            text(line, this.x + this.padding, yOffset);
            yOffset += textAscent() + textDescent() + this.padding / 2;
        });
    }
}

class PanelManager {
    constructor() {
        this.panels = [];
    }

    registerPanel(panel) {
        this.panels.push(panel);
    }

    updatePanels() {
        this.panels.forEach(panel => panel.draw());
    }

    createPanel(x, y, width, header, contentFunction, options = {}) {
        const panel = new Panel(x, y, width, header, contentFunction, options);
        this.registerPanel(panel);
        return panel;
    }

    registerPanels() {
        this.createPanel(0, 0, 200, 'Game State', () => [
            `State: ${currentState}`,
            `Player: ${players[currentPlayerIndex].id}`,
            `Turn: ${turnNumber}`,
            `Time Left: ${(Math.max(0, turnDuration * (1 / speedMultiplier) - (millis() - turnStartTime)) / 1000).toFixed(1)}s`,
            `Speed: ${speedMultiplier.toFixed(3)}x`
        ]);

        this.createPanel(0, 0, 200, 'Hex Info', () => {
            if (!selectedHex) return ['No hex selected'];
            let content = [
                `Hex: (${selectedHex.q}, ${selectedHex.r})`,
                `Type: ${selectedHex.type}`,
                `Noise: ${selectedHex.noiseValue.toFixed(2)}`,
                `Fertility: ${selectedHex.fertility.toFixed(2)}`, // Display fertility
                `Claimed By: ${selectedHex.claimedBy ? `Player ${selectedHex.claimedBy}` : 'Unclaimed'}` // Display claimed status
            ];

            selectedHex.units.forEach((unit, i) => {
                content.push(
                    `Unit ${i + 1}: ${unit.type}`,
                    `Health: ${unit.health}`,
                    `Attack: ${unit.attack}`,
                    `Defence: ${unit.defence}`,
                    '' // Add a blank line for spacing
                );
            });

            return content;
        });

        this.createPanel(0, 0, 200, 'Player 1 Hexes', () => generatePlayerPanelContent(players[0]), { rightAligned: true });
        this.createPanel(0, 0, 200, 'Player 2 Hexes', () => generatePlayerPanelContent(players[1]), { rightAligned: true });

        this.createPanel(0, 0, 200, 'Selected Unit', () => [
            `Selected Unit: ${selectedUnitType}`
        ], { bottomAligned: true });

        this.organizePanels();
    }

    organizePanels() {
        let xOffset = 10;
        let yOffset = 10;
        const padding = 10;
        const columnWidth = 200 + padding; // Panel width + padding
        const canvasWidth = 1800; // Assuming canvas width is 1800
        const canvasHeight = 900; // Assuming canvas height is 900
        const columns = 2; // Number of columns

        let columnHeights = Array(columns).fill(yOffset);
        let rightColumnHeights = Array(columns).fill(yOffset);
        let bottomColumnHeights = Array(columns).fill(canvasHeight - yOffset - 200); // Start from near the bottom

        this.panels.forEach((panel, index) => {
            if (panel.rightAligned) {
                const columnIndex = index % columns;
                panel.x = canvasWidth - xOffset - columnWidth + columnIndex * columnWidth - 200; // Move 200 pixels to the left
                panel.y = rightColumnHeights[columnIndex];
                rightColumnHeights[columnIndex] += panel.contentHeight + padding;
            } else if (panel.bottomAligned) {
                const columnIndex = index % columns;
                panel.x = xOffset + columnIndex * columnWidth;
                panel.y = bottomColumnHeights[columnIndex];
                bottomColumnHeights[columnIndex] -= panel.contentHeight + padding;
            } else {
                const columnIndex = index % columns;
                panel.x = xOffset + columnIndex * columnWidth;
                panel.y = columnHeights[columnIndex];
                columnHeights[columnIndex] += panel.contentHeight + padding;
            }
        });
    }
}

function generatePlayerPanelContent(player) {
    let claimedHexesArray = Array.from(player.claimedHexes);

    let lines = [
        `Claimed Hexes: ${claimedHexesArray.length}`
    ];

    for (let i = 0; i < claimedHexesArray.length; i += 3) {
        let hex1 = claimedHexesArray[i];
        let hex2 = claimedHexesArray[i + 1];
        let hex3 = claimedHexesArray[i + 2];
        if (hex3) {
            lines.push(`${hex1.q}, ${hex1.r}    ${hex2.q}, ${hex2.r}    ${hex3.q}, ${hex3.r}`);
        } else if (hex2) {
            lines.push(`${hex1.q}, ${hex1.r}    ${hex2.q}, ${hex2.r}`);
        } else {
            lines.push(`${hex1.q}, ${hex1.r}`);
        }
    }

    return lines;
}