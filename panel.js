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
        this.alignment = options.alignment || 'top-left'; // New attribute for alignment
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
            let wrappedLines = this.wrapText(line, this.width - 2 * this.padding);
            this.contentHeight += wrappedLines.length * (textAscent() + textDescent() + this.padding / 2);
        });
        pop();
    }

    wrapText(text, maxWidth) {
        let words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let width = textWidth(currentLine + ' ' + word);
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
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
            let wrappedLines = this.wrapText(line, this.width - 2 * this.padding);
            wrappedLines.forEach(wrappedLine => {
                text(wrappedLine, this.x + this.padding, yOffset);
                yOffset += textAscent() + textDescent() + this.padding / 2;
            });
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
        this.createPanel(10, 10, 200, 'Game State', () => [
            `State: ${currentState}`,
            `Player: ${players[currentPlayerIndex].id}`,
            `Turn: ${turnNumber}`,
            `Time Left: ${(Math.max(0, turnDuration * (1 / speedMultiplier) - (millis() - turnStartTime)) / 1000).toFixed(1)}s`,
            `Speed: ${speedMultiplier.toFixed(3)}x`
        ]);

        this.createPanel(10, 220, 200, 'Hex Info', () => {
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

        this.createPanel(10, 430, 200, 'Player 1 Hexes', () => generatePlayerPanelContent(players[0]), { alignment: 'top-left' });
        this.createPanel(10, 640, 200, 'Player 2 Hexes', () => generatePlayerPanelContent(players[1]), { alignment: 'top-left' });

        this.createPanel(10, 850, 200, 'Selected Unit', () => [
            `Selected Unit: ${selectedUnitType}`
        ], { alignment: 'bottom-left' });

        // Adjust the position of the AI Decision Reasoning panel
        this.createPanel(300, 450, 300, 'AI Decision Reasoning', () => [
            `Reasoning: ${players[currentPlayerIndex].decisionReasoning}`
        ], { alignment: 'custom' });

        this.organizePanels();
    }

    organizePanels() {
        const canvasWidth = 1800; // Assuming canvas width is 1800
        const canvasHeight = 900; // Assuming canvas height is 900

        this.panels.forEach(panel => {
            switch (panel.alignment) {
                case 'top-left':
                    // Already positioned correctly
                    break;
                case 'bottom-left':
                    panel.y = canvasHeight - panel.contentHeight - panel.padding;
                    break;
                case 'top-right':
                    panel.x = canvasWidth - panel.width - panel.padding;
                    break;
                case 'bottom-right':
                    panel.x = canvasWidth - panel.width - panel.padding;
                    panel.y = canvasHeight - panel.contentHeight - panel.padding;
                    break;
                case 'center':
                    panel.x = (canvasWidth - panel.width) / 2;
                    panel.y = (canvasHeight - panel.contentHeight) / 2;
                    break;
                case 'custom':
                    // Custom positioning, already set
                    break;
                default:
                    // Default to top-left
                    break;
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