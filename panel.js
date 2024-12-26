class Panel {
    constructor(x, y, width, header, contentFunction, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.header = header;
        this.contentFunction = contentFunction;
        this.padding = options.padding || 10;
        this.backgroundColour = options.backgroundColour || color(0, 0, 0, 200);
        this.textSize = options.textSize || 16;
        this.headerSize = options.headerSize || 18;
        this.contentHeight = 0;
        this.contentWidth = 0;
        this.visible = true;
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.wasDragged = false;
    }

    calculateDimensions() {
        this.calculateContentWidth();
        this.calculateContentHeight();
    }

    calculateContentWidth() {
        push();
        textSize(this.textSize);
        textAlign(LEFT, TOP);
        this.contentWidth = textWidth(this.header) + 5 * this.padding;

        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            let wrappedLines = this.wrapText(line, this.width - 2 * this.padding);
            wrappedLines.forEach(wrappedLine => {
                this.contentWidth = max(this.contentWidth, textWidth(wrappedLine) + 5 * this.padding);
            });
        });

        pop();
    }

    calculateContentHeight() {
        push();
        textSize(this.textSize);
        textAlign(LEFT, TOP);
        this.contentHeight = this.headerSize + this.padding * 2;

        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            let wrappedLines = this.wrapText(line, this.width - 2 * this.padding);
            this.contentHeight += wrappedLines.length * (textAscent() + textDescent() + this.padding);
        });

        this.contentHeight += this.padding * 2;

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
        if (!this.visible) return;

        this.calculateDimensions();
        fill(this.backgroundColour);
        noStroke();
        rect(this.x, this.y, this.contentWidth, this.contentHeight, 10);

        fill(255);
        textSize(this.headerSize);
        textAlign(LEFT, TOP);
        text(this.header, this.x + this.padding, this.y + this.padding);

        textSize(this.textSize);
        let yOffset = this.y + this.headerSize + this.padding * 2;
        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            let wrappedLines = this.wrapText(line, this.contentWidth - 2 * this.padding);
            wrappedLines.forEach(wrappedLine => {
                text(wrappedLine, this.x + this.padding, yOffset);
                yOffset += textAscent() + textDescent() + this.padding;
            });
        });
    }

    mousePressed() {
        if (mouseX > this.x && mouseX < this.x + this.contentWidth && mouseY > this.y && mouseY < this.y + this.contentHeight) {
            this.dragging = true;
            this.offsetX = this.x - mouseX;
            this.offsetY = this.y - mouseY;
            this.wasDragged = false;
        }
    }

    mouseDragged() {
        if (this.dragging) {
            this.x = mouseX + this.offsetX;
            this.y = mouseY + this.offsetY;
            this.wasDragged = true;
        }
    }

    mouseReleased() {
        this.dragging = false;
        if (this.wasDragged) {
            panelManager.savePanelPositions();
        }
    }
}

function generatePlayerPanelContent(player) {
    let claimedHexesArray = Array.from(player.claimedHexes);

    let lines = [
        `🔷 Claimed Hexes: ${claimedHexesArray.length}`,
        `💰 Money: ${player.money}`, // Display money
        `🔢 Unit Limit: ${player.unitLimit}`, // Display unit limit
        `🛤️ Paths: ${player.paths.size}`, // Display the number of paths
        `⚔️ Battles: ${player.battleHexes.size}`, // Display the number of battles
        `👥 Units: ${player.numOfUnits}`, // Display the number of units
        `🏠 Occupied Hexes: ${player.occupiedHexes.size}` // Display the number of occupied hexes
    ];

    for (let i = 0; i < claimedHexesArray.length; i++) {
        let hex = claimedHexesArray[i];
        lines.push(`📍 ${hex.q}, ${hex.r}`);
        hex.units.forEach((unit, i) => {
            let unitEmoji = getUnitEmoji(unit.type);
            let unitTypeCapitalized = unit.type.charAt(0).toUpperCase() + unit.type.slice(1);
            let playerSymbol = unit.playerId === 1 ? '🔴' : '🔵'; // Red circle for Player 1, Blue circle for Player 2
            lines.push(
                `${playerSymbol} ${unitEmoji} ${unitTypeCapitalized} ❤️${unit.health} ⚔️${unit.attack} 🛡️${unit.defence} 🚶${unit.movement} 🆔 ${unit.id}`
            );
        });
    }

    return lines;
}