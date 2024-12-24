class Building {
    constructor(type, owner_id, q = 0, r = 0) {
        this.type = type;
        this.owner_id = owner_id;
        this.q = q; // Hex coordinate q
        this.r = r; // Hex coordinate r
    }

    setHexCoordinates(q, r) {
        this.q = q;
        this.r = r;
    }

    display() {
        // Assuming you have a function to convert hex coordinates to pixel coordinates
        const pos = hexToPixel(this.q, this.r);
        fill(150);
        rect(pos.x, pos.y, 50, 50); // Default size for display
    }
}
