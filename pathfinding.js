function aStar(startHex, endHex, hexGrid, options = {}) {
    const { enablePrinting = false } = options;

    const openSet = [startHex];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    hexGrid.forEach((hex, key) => {
        gScore.set(hex, Infinity);
        fScore.set(hex, Infinity);
    });

    gScore.set(startHex, 0);
    fScore.set(startHex, heuristic(startHex, endHex));

    while (openSet.length > 0) {
        openSet.sort((a, b) => fScore.get(a) - fScore.get(b)); // Lowest fScore first
        const current = openSet.shift();

        if (enablePrinting) {
            print(`Current hex: (${current.q}, ${current.r})`);
        }

        if (current === endHex) {
            if (enablePrinting) {
                print("Path found!");
            }
            return reconstructPath(cameFrom, current);
        }

        getHexNeighbours(current).forEach(neighbour => {
            if (!hexGrid.has(neighbour.getKey())) {
                if (enablePrinting) {
                    print(`Neighbour (${neighbour.q}, ${neighbour.r}) is not in the hex grid`);
                }
                return;
            }

            if (!isValidHexForPathfinding(neighbour)) {
                if (enablePrinting) {
                    print(`Neighbour (${neighbour.q}, ${neighbour.r}) is not valid for pathfinding`);
                }
                return;
            }

            if (enablePrinting) {
                print(`Evaluating neighbour: (${neighbour.q}, ${neighbour.r})`);
            }
            const tentativeGScore = gScore.get(current) + neighbour.movementCost;

            if (tentativeGScore < gScore.get(neighbour)) {
                cameFrom.set(neighbour, current);
                gScore.set(neighbour, tentativeGScore);
                fScore.set(neighbour, tentativeGScore + heuristic(neighbour, endHex));
                if (!openSet.includes(neighbour)) {
                    openSet.push(neighbour);
                    if (enablePrinting) {
                        print(`Neighbour hex: (${neighbour.q}, ${neighbour.r}) added to open set`);
                    }
                }
            }
        });

    }

    if (enablePrinting) {
        print("No path found");
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

function isValidHexForPathfinding(hex) {
    // Initially, check if the hex type is water
    return hex.type !== 'water';
}

