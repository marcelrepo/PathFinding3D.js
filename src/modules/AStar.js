/**
 * A* path-finder.
 * @constructor
 * @extends PF.BaseFinder
 * @param {Function(integer, integer)->integer} [heuristic] Heuristic function
 *     being used to estimate the distance(defaults to manhattan).
 *     Available heuristics:
 *         * PF.AStarFinder.manhattan
 *         * PF.AStarFinder.euclidean
 *         * PF.AStarFinder.chebyshev
 */
PF.AStarFinder = function(heuristic) {
    PF.BaseFinder.call(this);

    this.heuristic = heuristic || PF.AStarFinder.manhattan;
};


/**
 * Extends the BaseFinder
 */
PF.AStarFinder.prototype = new PF.BaseFinder();


/**
 * Sets the constructor of the instances.
 */
PF.AStarFinder.prototype.constructor = PF.AStarFinder;


/**
 * @inheritDoc
 */
PF.AStarFinder.prototype.init = function(startX, startY, endX, endY, grid) {
    PF.BaseFinder.prototype.init.call(this, startX, startY, endX, endY, grid);

    this.openList = [];
    this.closeList = [];
};


/**
 * @inheritDoc
 */
PF.AStarFinder.prototype.findPath = function() {
    // TODO: use binary heap to maintain the open list.

    var x, y,
        nx, ny, 
        sx = this.startX,
        sy = this.startY,
        ex = this.endX,
        ey = this.endY,
        openList = this.openList,
        closeList = this.closeList,
        grid = this.grid,
        node;

        xOffsets = [-1, 0, 0, 1],
        yOffsets = [0, -1, 1, 0];
    
    // set the `g` and `f` value of the start node to be 0
    node = grid.getNodeAt(sx, sy);
    node.g = 0;
    node.f = 0;

    // push the start node into the open list
    openList.push([sx, sy]);
    node.opened = true;

    // while the open list is not empty
    while (openList.length) {
        // pop the position of node which has the minimum `f` value.
        pos = this._popMinNodePos();
        x = pos[0];
        y = pos[1];
        grid.setAttributeAt(x, y, 'closed', true);

        // if reached the end position, construct the path and return it
        if (x == ex && y == ey) {
            return this._constructPath();
        }

        // enumerate the ajacent positions
        // TODO: make this procedure independent and switchable
        for (var i = 0; i < xOffsets.length; ++i) {
            nx = x + xOffsets[i];
            ny = y + yOffsets[i];

            if (grid.isInside(nx, ny) && grid.isWalkableAt(nx, ny)) {
                this._inspectNodeAt(nx, ny, x, y);
            }
        }
    }

    return [];
};


/**
 * Construct the path according to the nodes' parents.
 * @return {Array.<Array.<integer, integer>>} The path, including
 *     both start and end positions.
 */
PF.AStarFinder.prototype._constructPath = function() {
    var sx = this.startX, sy = this.startY,
        x, y,
        grid = this.grid,
        path = [[this.endX, this.endY]];

    for (;;) {
        x = path[0][0];
        y = path[0][1];
        if (x == sx && y == sy) {
            return path;
        }
        path.unshift(grid.getAttributeAt(x, y, 'parent'));
    }

    // it should never reach here.
    return [];
};


/**
 * Push the position into the open list if this position is not in the list.
 * Otherwise, if the position can be accessed with a lower cost from the given
 * parent position, then update its parent and cost
 * @private
 * @param {integer} x The x coordinate of the position.
 * @param {integer} y The y coordinate of the position.
 * @param {integer} x The x coordinate of the parent position.
 * @param {integer} y The y coordinate of the parent position.
 */
PF.AStarFinder.prototype._inspectNodeAt = function(x, y, px, py) {
    var grid = this.grid,
        openList = this.openList,
        node = grid.getNodeAt(x, y);

    if (node.closed) {
        return;
    }

    if (node.opened) {
        //
    } else {
        node.opened = true;
        openList.push([x, y]);
    }
    this._tryUpdate(x, y, px, py);
};


/**
 * Try to update the position's info with the given parent.
 * If this position can be accessed from the given parent with lower 
 * `g` cost, then this position's parent, `g` and `f` values will be updated.
 * @private
 * @param {integer} x The x coordinate of the position.
 * @param {integer} y The y coordinate of the position.
 * @param {integer} x The x coordinate of the parent position.
 * @param {integer} y The y coordinate of the parent position.
 * @return {boolean} Whether this position's info has been updated.
 */
PF.AStarFinder.prototype._tryUpdate = function(x, y, px, py) {
    var grid = this.grid,
        pNode = grid.getNodeAt(px, py), // parent node
        ng = pNode.g + 1; // next `g` value
        node = grid.getNodeAt(x, y);

    if (node.g === undefined || ng < node.g) {
        node.parent = [px, py];
        node.g = ng;
        node.h = this._calculateH(x, y);
        node.f = node.g + node.h;
        return true;
    }
    return false;
};


/**
 * Calculate the `h` value of a given position.
 * @param {integer} x The x coordinate of the position.
 * @param {integer} y The y coordinate of the position.
 * @return {Number}
 */
PF.AStarFinder.prototype._calculateH = function(x, y) {
    var dx = Math.abs(x - this.endX),
        dy = Math.abs(y - this.endY);
    return this.heuristic(dx, dy);
};



/**
 * Pop the position with the minimum `f` value from the open list.
 * @private
 */
PF.AStarFinder.prototype._popMinNodePos = function() {
    // TODO: add comparison for `h`.
    var openList = this.openList;

    openList.sort(function(a, b) {
        return a.f - b.f; 
    });

    return openList.shift();
};

/**
 * Manhattan distance.
 * Static method of PF.AStarFinder
 */
PF.AStarFinder.manhattan = function(dx, dy) {
    return dx + dy;
};

/**
 * Euclidean distance.
 * Static method of PF.AStarFinder
 */
PF.AStarFinder.euclidean = function(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Chebyshev distance.
 * Static method of PF.AStarFinder
 */
PF.AStarFinder.chebyshev = function(dx, dy) {
    return Math.max(dx, dy);
};