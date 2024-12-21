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
    }

    calculateDimensions() {
        this.calculateContentWidth();
        this.calculateContentHeight();
    }

    calculateContentWidth() {
        push();
        textSize(this.textSize);
        textAlign(LEFT, TOP);
        this.contentWidth = textWidth(this.header) + 2 * this.padding; // Include header width

        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            let wrappedLines = this.wrapText(line, this.width - 2 * this.padding);
            wrappedLines.forEach(wrappedLine => {
                this.contentWidth = max(this.contentWidth, textWidth(wrappedLine) + 2 * this.padding);
            });
        });

        pop();
    }

    calculateContentHeight() {
        push();
        textSize(this.textSize);
        textAlign(LEFT, TOP);
        this.contentHeight = this.headerSize + this.padding * 2; // Add extra padding for the header

        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            let wrappedLines = this.wrapText(line, this.width - 2 * this.padding);
            this.contentHeight += wrappedLines.length * (textAscent() + textDescent() + this.padding); // Increase padding between lines
        });

        // Add extra padding at the bottom
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
                yOffset += textAscent() + textDescent() + this.padding; // Increase padding between lines
            });
        });
    }
}


function generatePlayerPanelContent(player) {
    let claimedHexesArray = Array.from(player.claimedHexes);

    let lines = [
        `🔷 Claimed Hexes: ${claimedHexesArray.length}`,
        `💰 Money: ${player.money}`, // Display money
        `🔢 Unit Limit: ${player.unitLimit}` // Display unit limit
    ];

    for (let i = 0; i < claimedHexesArray.length; i++) {
        let hex = claimedHexesArray[i];
        lines.push(`📍 ${hex.q}, ${hex.r}`);
    }

    return lines;
}