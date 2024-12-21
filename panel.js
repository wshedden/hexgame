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
        push();
        textSize(this.textSize);
        textAlign(LEFT, TOP);
        this.contentHeight = this.headerSize + this.padding;
        this.contentWidth = 0;

        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            let wrappedLines = this.wrapText(line, this.width - 2 * this.padding);
            this.contentHeight += wrappedLines.length * (textAscent() + textDescent() + this.padding / 2);
            wrappedLines.forEach(wrappedLine => {
                this.contentWidth = max(this.contentWidth, textWidth(wrappedLine));
            });
        });

        this.contentWidth += 2 * this.padding; // Add padding to the content width
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
        let yOffset = this.y + this.headerSize + this.padding;
        let contentLines = this.contentFunction();
        contentLines.forEach(line => {
            let wrappedLines = this.wrapText(line, this.contentWidth - 2 * this.padding);
            wrappedLines.forEach(wrappedLine => {
                text(wrappedLine, this.x + this.padding, yOffset);
                yOffset += textAscent() + textDescent() + this.padding / 2;
            });
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