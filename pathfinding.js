function aStar(startHex, endHex, hexGrid) {
    const openSet = [startHex];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    hexGrid.forEach(hex => {
        gScore.set(hex, Infinity);
        fScore.set(hex, Infinity);
    });

    gScore.set(startHex, 0);
    fScore.set(startHex, heuristic(startHex, endHex));

    while (openSet.length > 0) {
        openSet.sort((a, b) => fScore.get(a) - fScore.get(b)); // Lowest fScore first
        const current = openSet.shift();

        if (current === endHex) return reconstructPath(cameFrom, current);

        current.getNeighbors(hexGrid).forEach(neighbor => {
            if (neighbor.unit) return; // Skip occupied hexes
            const tentativeGScore = gScore.get(current) + neighbor.movementCost;

            if (tentativeGScore < gScore.get(neighbor)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + heuristic(neighbor, endHex));
                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        });
    }

    return []; // No path found
}

function reconstructPath(cameFrom, current) {
    const path = [];
    while (current) {
        path.unshift(current);
        current = cameFrom.get(current);
    }
    return path;
}

function heuristic(a, b) {
    return Math.abs(a.q - b.q) + Math.abs(a.r - b.r); // Manhattan distance for axial coordinates
}
