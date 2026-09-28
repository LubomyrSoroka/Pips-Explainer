// no longer used
const createsOddCountArea = ([i, j], direction) => {
    // need to temporarily remove all cells from valid indices.

    const validIndicesCopy = new Set(validIndices);
    validIndices.delete(`${i},${j}`);

    const key = JSON.stringify([i, j]) + direction;

    const [k, l] = getOtherIndex([i, j], direction);
    validIndices.delete(`${k},${l}`);

    let cellsToCheck = null;
    switch (direction) {
        case UP:
            cellsToCheck = [[i + 1, j], [i, j - 1], [i, j + 1], [k - 1, l], [k, l - 1], [k, l + 1]];
            break;
        case DOWN:
            cellsToCheck = [[i - 1, j], [i, j - 1], [i, j + 1], [k + 1, l], [k, l - 1], [k, l + 1]];
            break;
        case LEFT:
            cellsToCheck = [[i, j + 1], [i + 1, j], [i - 1, j], [k, l - 1], [k + 1, l], [k - 1, l]];
            break;
        case RIGHT:
            cellsToCheck = [[i, j - 1], [i + 1, j], [i - 1, j], [k, l + 1], [k + 1, l], [k - 1, l]];
            break;
    }
    // to find the number of connected components, we need to run BFS from every node and keep track of the nodes that were visited. 
    // if a bfs finds a node that was already visited, then those two components must be connected.
    const visitedNodes = new Set();
    const bfs = (startingNode) => {
        const queue = [startingNode];
        let i = 0;
        visitedNodes.add(JSON.stringify(startingNode));
        while (i < queue.length) {
            const neighbours = getNeighbours(queue[i]);
            for (const neighbour of neighbours) {
                if (!visitedNodes.has(JSON.stringify(neighbour)))
                    visitedNodes.add(JSON.stringify(neighbour));
            }
            queue.push(...neighbours)
            ++i;
        }
        return queue.length;
    }

    const getNeighbours = ([i, j]) => {
        const neighbours = [];

        if (!isOutOfBounds(i, j + 1) && !visitedNodes.has(JSON.stringify([i, j + 1]))) {
            neighbours.push([i, j + 1]);
        }

        if (!isOutOfBounds(i, j - 1) && !visitedNodes.has(JSON.stringify([i, j - 1]))) {
            neighbours.push([i, j - 1]);
        }

        if (!isOutOfBounds(i + 1, j) && !visitedNodes.has(JSON.stringify([i + 1, j]))) {
            neighbours.push([i + 1, j]);
        }

        if (!isOutOfBounds(i - 1, j) && !visitedNodes.has(JSON.stringify([i - 1, j]))) {
            neighbours.push([i - 1, j]);
        }
        return neighbours;
    }

    for (const node of cellsToCheck) {
        if (isOutOfBounds(node[0], node[1]) || visitedNodes.has(JSON.stringify(node)))
            continue;

        const result = bfs(node);
        if (result !== CONNECTED && result % 2 === 1) {
            // if this is a disconnected part
            // and it has an odd number of cells, then this is an odd count area
            validIndices = validIndicesCopy;
            return true;
        }
    }
    // if every node is next to a space with an even amount of cells, then this is not an odd count area
    validIndices = validIndicesCopy;
    //prevValuesOddCountAreas[key] = false;

    return false;
}
