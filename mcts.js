function Node(gameTree, parentNode, move) {
    this.gameTree = gameTree;
    this.parentNode = parentNode;
    this.move = move;
    this.childNodes = [];
    this.wins = 0;
    this.visits = 0;
    this.untriedMoves = gameTree.moves.slice();
}

/**
 * 次のノードを選択
 */
Node.prototype.selectChild = function() {
    var totalVisits = this.visits;
    var values = this.childNodes.map(function(n) {
        return n.wins / n.visits + Math.sqrt(2 * Math.log(totalVisits) / n.visits);
    });
    return this.childNodes[values.indexOf(Math.max.apply(null, values))];
}

/**
 * ノードを展開
 */
Node.prototype.expandChild = function() {
    var i = random(this.untriedMoves.length);
    var move = this.untriedMoves.splice(i, 1)[0];
    var child = new Node(force(move.gameTreePromise), this, move);
    this.childNodes.push(child);
    return child;
}

Node.prototype.simulate = function(player) {
    var gameTree = this.gameTree;
    while(gameTree.moves.length !== 0) {
        var i = random(gameTree.moves.length);
        gameTree = force(gameTree.moves[i].gameTreePromise);
    }
    return judge(gameTree.board) * (player === BLACK ? 1 : -1) / 2 + 0.5;
}

Node.prototype.backprop = function(result) {
    for (var node = this; node !== null; node = node.parentNode) {
        node.update(result);
    }
}

Node.prototype.update = function (result) {
    this.wins += result;
    this.visits += 1;
}

function tryMonteCarloTreeSearch(rootGameTree, maxTries) {
    var root = new Node(rootGameTree, null, null);

    for (var i = 0; i < maxTries; ++i) {
        var node = root;
        while (node.untriedMoves.length === 0 && node.childNodes.length !== 0) {
            node = node.selectChild();
        }
        if (node.untriedMoves.length !== 0) {
            node = node.expandChild();
        }
        var result = node.simulate(rootGameTree.player);
        node.backprop(result);
    }

    var vs = root.childNodes.map(function (n) { return n.visits;});
    return root.childNodes[vs.indexOf(Math.max.apply(null, vs))].move;
}