function makeDecision(player) {
    let initialReasoning = player.decisionReasoning;
    player.decisionReasoning += '🛠️ '; // Emoji for decision-making

    if (turnNumber > 2 && Math.random() < 0.5) {
        handleUnitMovement(player);
    } else {
        handleUnitPlacement(player);
    }

    // Append the decision reasoning to the initial reasoning
    player.decisionReasoning = initialReasoning + player.decisionReasoning;

    // Ensure decisionReasoning does not exceed max length
    if (player.decisionReasoning.length > player.maxReasoningLength) {
        player.decisionReasoning = player.decisionReasoning.slice(-player.maxReasoningLength);
    }
}

function handleUnitMovement(player) {
    let unitHexes = Array.from(player.occupiedHexes);
    let moved = false;

    // Check for hexes with movable units and try to find a path
    for (let hex of unitHexes) {
        let movableUnits = hex.getMovableUnits();
        if (movableUnits.length > 0) {
            let unitToMove = movableUnits[0]; // Move the first movable unit
            let randomHex = random(Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit));
            let path = aStar(hex, randomHex, hexGrid);

            if (path.length > 0) {
                player.paths.set(unitToMove, path);
                player.decisionReasoning += `➡️ Path found for unit from (${hex.q}, ${hex.r}) to (${randomHex.q}, ${randomHex.r})\n`; // Pathfinding emoji
                player.movesLeft--; // Decrement movesLeft only if the path is found
                moved = true;
                break;
            } else {
                player.decisionReasoning += `❌ No path found from (${hex.q}, ${hex.r}) to (${randomHex.q}, ${randomHex.r})\n`; // Failure emoji
            }
        }
    }

    if (!moved) {
        player.decisionReasoning += '❌ No units to move or no valid paths found\n'; // Failure emoji
    }
}

function moveAnyUnit(player, unitHexes) {
    if (unitHexes.length > 0) {
        let fromHex = random(unitHexes);
        let movableUnits = fromHex.getMovableUnits();
        if (movableUnits.length > 0) {
            let neighbours = getHexNeighbours(fromHex).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));
            if (neighbours.length > 0) {
                let toHex = random(neighbours);
                if (moveUnit(player, fromHex, toHex)) {
                    player.decisionReasoning += `➡️ Moved unit to (${toHex.q}, ${toHex.r})\n`; // Movement emoji
                    player.movesLeft--; // Decrement movesLeft only if the move is successful
                } else {
                    player.decisionReasoning += `❌ Move failed to (${toHex.q}, ${toHex.r})\n`; // Failure emoji
                }
            } else {
                player.decisionReasoning += '❌ No adjacent hexes for movement\n'; // Failure emoji
            }
        } else {
            player.decisionReasoning += '❌ No units to move\n'; // Failure emoji
        }
    } else {
        player.decisionReasoning += '❌ No units to move\n'; // Failure emoji
    }
}

function handleUnitPlacement(player) {
    let isFirstTurn = (turnNumber === 1);
    let hexesToConsider = getHexesToConsiderForUnitPlacement(player, isFirstTurn);

    if (hexesToConsider.length > 0) {
        let randomHex = random(hexesToConsider);
        let unitType = decideUnitType(player);
        let newUnit = createUnit(player, unitType);
        let emoji = getUnitEmoji(unitType);
        if (placeUnit(randomHex.q, randomHex.r, newUnit)) { // Pass q and r values correctly
            player.decisionReasoning += `✅ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`; // Success emoji
            player.movesLeft--; // Decrement movesLeft only if the move is successful
        } else {
            player.decisionReasoning += `❌ ${emoji} at (${randomHex.q}, ${randomHex.r})\n`; // Failure emoji
        }
    } else {
        player.decisionReasoning += '❌ No hexes available for unit placement\n'; // Failure emoji
    }
}

function getHexesToConsiderForUnitPlacement(player, isFirstTurn) {
    if (isFirstTurn) {
        return Array.from(claimableTiles).map(key => hexGrid.get(key)).filter(hex => !hex.unit);
    } else {
        return Array.from(player.claimedAdjacentHexes).map(key => hexGrid.get(key)).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));
    }
}

function decideUnitType(player) {
    // If first turn, settler
    // Otherwise 70% farmer, 20% soldier, 5% settler, 5% builder
    let unitType = 'farmer';
    if (turnNumber === 1) {
        unitType = 'settler';
    } else {
        let rand = random(1);
        if (rand <= 0.70) {
            unitType = 'farmer';
        } else if (rand <= 0.90) {
            unitType = 'soldier';
        } else if (rand <= 0.95) {
            unitType = 'settler';
        } else {
            unitType = 'builder';
        }
    }
    return unitType;
}

function getUnitEmoji(unitType) {
    switch (unitType) {
        case 'soldier':
            return '⚔️'; // Sword emoji for soldier
        case 'farmer':
            return '🌾'; // Sheaf of rice emoji for farmer
        case 'settler':
            return '🏠'; // House emoji for settler
        case 'builder':
            return '🔨'; // Hammer emoji for builder
        default:
            return '❓'; // Question mark emoji for unknown unit type
    }
}

function moveUnit(player, fromHex, toHex, options = {}) {
    if (fromHex.units.length === 0) {
        return false;
    }

    if (toHex.units.length >= MAX_UNITS_PER_HEX) {
        return false;
    }

    let unitToMove = random(fromHex.units);

    // Check if the unit can move
    if (unitToMove.movement <= 0 || unitToMove.type === 'settler') {
        player.decisionReasoning += `❌ ${unitToMove.type} cannot move\n`; // Failure emoji
        return false;
    }

    // Check if the destination hex is occupied by an enemy unit
    if (toHex.units.length > 0 && toHex.units[0].id !== unitToMove.id) {
        if (options.enablePrinting) {
            print(`Battle condition met: fromHex (${fromHex.q}, ${fromHex.r}) toHex (${toHex.q}, ${toHex.r})`);
            print(`Unit to move: ${unitToMove.id}, Destination unit: ${toHex.units[0].id}`);
        }

        // Initiate a battle using the Battle class
        let battle = new Battle(fromHex, toHex, options);
        battle.start();
        player.movesLeft--; // Decrement movesLeft only if the battle is initiated
        return true;
    } else {
        if (options.enablePrinting) {
            print(`No battle: fromHex (${fromHex.q}, ${fromHex.r}) toHex (${toHex.q}, ${toHex.r})`);
            if (toHex.units.length === 0) {
                print('Reason: Destination hex has no units');
            } else if (toHex.units[0].id === unitToMove.id) {
                print('Reason: Destination unit is the same as the unit to move');
            }
        }
    }

    toHex.units.push(unitToMove);
    fromHex.units.splice(fromHex.units.indexOf(unitToMove), 1);

    if (fromHex.units.length === 0) {
        player.occupiedHexes.delete(fromHex);
    }
    player.occupiedHexes.add(toHex);

    return true;
}

