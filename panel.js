class Panel {
    constructor(x, y, width, header, contentFunction, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.header = header;
        this.contentFunction = contentFunction; // Function that generates content
        this.padding = options.padding || 10;
        this.backgroundColor = options.backgroundColor || color(0, 0, 0, 200); // Default semi-transparent black
        this.textSize = options.textSize || 16;
        this.headerSize = options.headerSize || 18;
        this.contentHeight = 0;
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
        fill(this.backgroundColor);
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
        this.createPanel(this.calculateX(0), this.calculateY(0), this.calculateWidth(), 'Game State', () => [
            `State: ${currentState}`,
            `Player: ${players[currentPlayerIndex].id}`,
            `Turn: ${turnNumber}`,
            `Time Left: ${(Math.max(0, turnDuration * (1 / speedMultiplier) - (millis() - turnStartTime)) / 1000).toFixed(1)}s`,
            `Speed: ${speedMultiplier.toFixed(3)}x`
        ]);

        this.createPanel(this.calculateX(1), this.calculateY(1), this.calculateWidth(), 'Hex Info', () => {
            if (!selectedHex) return ['No hex selected'];
            return [
                `Hex: (${selectedHex.q}, ${selectedHex.r})`,
                `Type: ${selectedHex.type}`,
                `Noise: ${selectedHex.noiseValue.toFixed(2)}`,
                ...selectedHex.units.map((unit, i) => [
                    `Unit ${i}: ${unit.type}`,
                    `Health: ${unit.health}`,
                    `Attack: ${unit.attack}`,
                    `Defence: ${unit.defense}`
                ]).flat()
            ];
        });

        this.createPanel(this.calculateX(2), this.calculateY(2), this.calculateWidth(), 'Player 1 Hexes', () => [
            `Occupied Hexes: ${players[0].occupiedHexes.length}`,
            ...players[0].occupiedHexes.map((hex, i) => `Hex ${i}: (${hex.q}, ${hex.r})`)
        ]);

        this.createPanel(this.calculateX(3), this.calculateY(3), this.calculateWidth(), 'Player 2 Hexes', () => [
            `Occupied Hexes: ${players[1].occupiedHexes.length}`,
            ...players[1].occupiedHexes.map((hex, i) => `Hex ${i}: (${hex.q}, ${hex.r})`)
        ]);

        this.createPanel(this.calculateX(4), this.calculateY(4), this.calculateWidth(), 'Selected Unit', () => [
            `Selected Unit: ${selectedUnitType}`
        ]);
    }

    calculateX(index) {
        // Skeleton code for calculating x position
        return 10 + index * 210; // Example calculation
    }

    calculateY(index) {
        // Skeleton code for calculating y position
        return 10 + index * 260; // Example calculation
    }

    calculateWidth() {
        // Skeleton code for calculating width
        return 200; // Example fixed width
    }

    organizePanels() {
        const leftPanels = this.panels.filter(panel => panel.x < width / 2);
        const rightPanels = this.panels.filter(panel => panel.x >= width / 2);

        // Organize left panels
        let yOffset = 10;
        leftPanels.forEach(panel => {
            panel.y = yOffset;
            yOffset += panel.contentHeight + 10;
        });

        // Organize right panels
        yOffset = 10;
        rightPanels.forEach(panel => {
            panel.y = yOffset;
            yOffset += panel.contentHeight + 10;
        });
    }
}