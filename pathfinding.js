function aStar(startHex, endHex, hexGrid) {
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

        print(`Current hex: (${current.q}, ${current.r})`);

        if (current === endHex) {
            print("Path found!");
            return reconstructPath(cameFrom, current);
        }

        getHexNeighbours(current).forEach(neighbour => {
            if (!hexGrid.has(neighbour.getKey())) {
                print(`Neighbour (${neighbour.q}, ${neighbour.r}) is not in the hex grid`);
                return;
            }

            // Use the validation function to check if the neighbour is valid
            if (!isValidHexForPathfinding(neighbour)) {
                print(`Neighbour (${neighbour.q}, ${neighbour.r}) is not valid for pathfinding`);
                return;
            }

            print(`Evaluating neighbour: (${neighbour.q}, ${neighbour.r})`);
            const tentativeGScore = gScore.get(current) + neighbour.movementCost;

            if (tentativeGScore < gScore.get(neighbour)) {
                cameFrom.set(neighbour, current);
                gScore.set(neighbour, tentativeGScore);
                fScore.set(neighbour, tentativeGScore + heuristic(neighbour, endHex));
                if (!openSet.includes(neighbour)) {
                    openSet.push(neighbour);
                    print(`Neighbour hex: (${neighbour.q}, ${neighbour.r}) added to open set`);
                }
            }
        });

        // Commented out the printing of the open set
        // print(`Open set: ${openSet.map(hex => `(${hex.q}, ${hex.r})`).join(', ')}`);
        // print(`gScore: ${Array.from(gScore.entries()).map(([hex, score]) => `(${hex.q}, ${hex.r}): ${score}`).join(', ')}`);
        // print(`fScore: ${Array.from(fScore.entries()).map(([hex, score]) => `(${hex.q}, ${hex.r}): ${score}`).join(', ')}`);
    }

    print("No path found");
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

function mousePressed() {
  let clickedHex = pixelToHex(mouseX - width / 2, mouseY - height / 2);
  if (clickedHex) {
    selectedHex = clickedHex;

    if (pathfindingMode) {
      if (path.length === 0) {
        path.push(clickedHex); // Set the start hex
        print(`Start hex: (${clickedHex.q}, ${clickedHex.r})`);
      } else if (path.length === 1) {
        path.push(clickedHex); // Set the end hex
        print(`End hex: (${clickedHex.q}, ${clickedHex.r})`);
        path = aStar(path[0], path[1], hexGrid); // Find the path using A* algorithm
        print("Path found:");
        path.forEach(hex => print(`(${hex.q}, ${hex.r})`));
      } else {
        path = [clickedHex]; // Reset the path
        print(`Start hex: (${clickedHex.q}, ${clickedHex.r})`);
      }
    } else if (currentPlayerIndex === 0 && currentState === GameState.PLAYING_HUMAN) {
      let player = players[currentPlayerIndex];
      let unitType = selectedUnitType; // Use the selected unit type
      let newUnit = new Unit(player.id, unitType, unitType === 'soldier' ? 100 : 50, unitType === 'soldier' ? 20 : 5, unitType === 'soldier' ? 10 : 5, player.colour); // Example values for attack and defence

      if (placeUnit(clickedHex.q, clickedHex.r, newUnit)) {
        switchPlayer(); // Switch to the next player if unit placement is successful
        turnStartTime = millis();
        // Update turn number
        turnNumber++;
      } else {
        print(`Cannot place unit at (${clickedHex.q}, ${clickedHex.r}).`);
      }
    }
  }
}
