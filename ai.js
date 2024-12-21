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

  // Check for hexes with 5 units and try to move one unit
  for (let hex of unitHexes) {
    if (hex.units.length >= 5) {
      let neighbours = getHexNeighbours(hex).filter(neighbour => !neighbour.unit && claimableTiles.has(neighbour.getKey()));
      // print(`Hex (${hex.q}, ${hex.r}) has ${hex.units.length} units. Neighbours: ${neighbours.map(n => `(${n.q}, ${n.r})`).join(', ')}`);
      if (neighbours.length > 0) {
        let toHex = random(neighbours);
        let unitToMove = hex.units[0]; // Move the first unit
        // print(`Trying to move unit from (${hex.q}, ${hex.r}) to (${toHex.q}, ${toHex.r})`);
        if (moveUnit(player, hex, toHex, unitToMove)) {
          player.decisionReasoning += `➡️ Moved unit from (${hex.q}, ${hex.r}) to (${toHex.q}, ${toHex.r})\n`; // Movement emoji
          player.movesLeft--; // Decrement movesLeft only if the move is successful
          moved = true;
          // print(`Successfully moved unit from (${hex.q}, ${hex.r}) to (${toHex.q}, ${toHex.r})`);
          break;
        } else {
          player.decisionReasoning += `❌ Failed to move unit from (${hex.q}, ${hex.r}) to (${toHex.q}, ${toHex.r})\n`; // Failure emoji
          // print(`Failed to move unit from (${hex.q}, ${hex.r}) to (${toHex.q}, ${toHex.r})`);
        }
      } else {
        // print(`No valid neighbours to move to from Hex (${hex.q}, ${hex.r})`);
      }
    } else {
      // print(`Hex (${hex.q}, ${hex.r}) does not have enough units to move`);
    }
  }

  if (!moved) {
    // print(`No suitable hex found with 5 units. Trying to move any unit.`);
    moveAnyUnit(player, unitHexes);
  }
}

function moveAnyUnit(player, unitHexes) {
  if (unitHexes.length > 0) {
    let fromHex = random(unitHexes);
    let neighbours = getHexNeighbours(fromHex).filter(hex => !hex.unit && claimableTiles.has(hex.getKey()));
    // print(`Trying to move unit from (${fromHex.q}, ${fromHex.r}). Neighbours: ${neighbours.map(n => `(${n.q}, ${n.r})`).join(', ')}`);
    if (neighbours.length > 0) {
      let toHex = random(neighbours);
      // print(`Selected neighbour (${toHex.q}, ${toHex.r}) for movement`);
      if (moveUnit(player, fromHex, toHex)) {
        player.decisionReasoning += `➡️ Moved unit to (${toHex.q}, ${toHex.r})\n`; // Movement emoji
        player.movesLeft--; // Decrement movesLeft only if the move is successful
        // print(`Successfully moved unit to (${toHex.q}, ${toHex.r})`);
      } else {
        player.decisionReasoning += `❌ Failed to move unit to (${toHex.q}, ${toHex.r})\n`; // Failure emoji
        // print(`Failed to move unit to (${toHex.q}, ${toHex.r})`);
      }
    } else {
      player.decisionReasoning += '❌ No adjacent hexes for movement\n'; // Failure emoji
      // print(`No valid neighbours to move to from Hex (${fromHex.q}, ${fromHex.r})`);
    }
  } else {
    player.decisionReasoning += '❌ No units to move\n'; // Failure emoji
    // print(`No units available to move for player ${player.id}`);
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

function createUnit(player, unitType) {
  switch (unitType) {
    case 'soldier':
      return new Unit(player.id, unitType, 50, 10, 5, player.colour); // Example values for soldier
    case 'farmer':
      return new Unit(player.id, unitType, 30, 5, 2, player.colour); // Example values for farmer
    case 'settler':
      return new Unit(player.id, unitType, 20, 0, 1, player.colour); // Example values for settler
    case 'builder':
      return new Unit(player.id, unitType, 40, 0, 3, player.colour); // Example values for builder
    default:
      return new Unit(player.id, 'farmer', 30, 5, 2, player.colour); // Default to farmer
  }
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

function moveUnit(player, fromHex, toHex) {
  if (fromHex.units.length === 0) {
    // console.log(`No unit to move from Hex (${fromHex.q}, ${fromHex.r})`);
    return false;
  }

  if (toHex.units.length >= MAX_UNITS_PER_HEX) {
    // console.log(`Hex (${toHex.q}, ${toHex.r}) is already occupied by another unit`);
    return false;
  }

  // Select a random unit from the fromHex
  let unitToMove = random(fromHex.units);

  // Move the unit
  toHex.units.push(unitToMove);
  fromHex.units.splice(fromHex.units.indexOf(unitToMove), 1);

  // Update player's occupied hexes if necessary
  if (fromHex.units.length === 0) {
    player.occupiedHexes.delete(fromHex);
  }
  player.occupiedHexes.add(toHex);

  // console.log(`Player ${player.id} moved unit to Hex: (${toHex.q}, ${toHex.r})`);
  return true;
}