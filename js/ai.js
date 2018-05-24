var aiMakers = {
  mcts: makeMonteCarloTreeSearchBasedAI,
  pmc: makePrimitiveMonteCarloBasedAI
};

function makeAI(playerType) {
  var tokens = playerType.split('-');
  var aiType = tokens[0];
  var level = parseInt(tokens[1]);
  var extras = tokens.slice(2);
  return aiMakers[aiType]({
    level: level,
    extras: extras
  });
}

/**
 * AIによって手を選択して進める
 */
function selectMoveByAI(gameTree, ai) {
  $('#message').text('Now thinking...');
  setTimeout(
    function () {
      var start = Date.now();
      var newGameTree = force(ai.findTheBestMove(gameTree).gameTreePromise);
      var end = Date.now();
      var delta = end - start;
      console.log(delta);
      setTimeout(
        function () {
          shiftToNewGameTree(newGameTree);
        },
        Math.max(100 - delta, 1)
      );
    },
    1
  );
}




// AI: Monte Carlo Tree Search {{{1

function makeMonteCarloTreeSearchBasedAI(options) {
  return {
    findTheBestMove: function (gameTree) {
      return tryMonteCarloTreeSearch(gameTree, options.level);
    }
  };
}

function tryMonteCarloTreeSearch(rootGameTree, maxTries) {
  var root = new Node(rootGameTree, null, null);

  for (var i = 0; i < maxTries; i++) {
    var node = root;

    while (node.untriedMoves.length === 0 && node.childNodes.length !== 0) {
      node = node.selectChild();
    }

    if (node.untriedMoves.length !== 0) {
      node = node.expandChild();
    }

    var won = node.simulate(rootGameTree.player);

    node.backpropagate(won);
  }

  var vs = root.childNodes.map(function (n) { return n.visits; });
  return root.childNodes[vs.indexOf(Math.max.apply(null, vs))].move;
}

function Node(gameTree, parentNode, move) {
  this.gameTree = gameTree;
  this.parentNode = parentNode;
  this.move = move;
  this.childNodes = [];
  this.wins = 0;
  this.visits = 0;
  this.untriedMoves = gameTree.moves.slice();
}

Node.prototype.selectChild = function () {
  var totalVisits = this.visits;
  var values = this.childNodes.map(function (n) {
    return n.wins / n.visits +
      Math.sqrt(2 * Math.log(totalVisits) / n.visits);
  });
  return this.childNodes[values.indexOf(Math.max.apply(null, values))];
};

Node.prototype.expandChild = function () {
  var i = random(this.untriedMoves.length);
  var move = this.untriedMoves.splice(i, 1)[0];
  var child = new Node(force(move.gameTreePromise), this, move);
  this.childNodes.push(child);
  return child;
};

Node.prototype.simulate = function (player) {
  var gameTree = this.gameTree;
  while (gameTree.moves.length !== 0) {
    var i = random(gameTree.moves.length);
    gameTree = force(gameTree.moves[i].gameTreePromise);
  }
  return judge(gameTree.board) * (player === BLACK ? 1 : -1) / 2 + 0.5;
};

Node.prototype.backpropagate = function (result) {
  for (var node = this; node !== null; node = node.parentNode) {
    node.update(result);
  }
};

Node.prototype.update = function (won) {
  this.wins += won;
  this.visits += 1;
};

Node.prototype.visualize = function (indent) {
  indent = indent || 0;
  var ss = [];
  var i;
  ss.push('\n');
  for (i = 0; i < indent; i++) {
    ss.push('| ');
  }
  ss.push('W='); ss.push(this.wins);
  ss.push('/');
  ss.push('V='); ss.push(this.visits);
  ss.push('/');
  ss.push('U='); ss.push(this.untriedMoves.length);
  for (i = 0; i < this.childNodes.length; i++) {
    ss.push(this.childNodes[i].visualize(indent + 1));
  }
  return ss.join('');
};




// AI: Primitive Monte Carlo {{{1

function makePrimitiveMonteCarloBasedAI(options) {
  return {
    findTheBestMove: function (gameTree) {
      return tryPrimitiveMonteCarloSimulation(
        gameTree,
        options.level,
        options.extras[0]
      );
    }
  };
}

function tryPrimitiveMonteCarloSimulation(rootGameTree, maxTries, iterStyle) {
  var moveCount = rootGameTree.moves.length;
  var lastMove = rootGameTree.moves[moveCount - 1];
  var scores = rootGameTree.moves.map(function (m) {
    var s = 0;
    var eachTries =
      iterStyle === 'm'
        ? maxTries
        : Math.floor(maxTries / moveCount)
        + (m === lastMove ? maxTries % moveCount : 0);
    for (var i = 0; i < eachTries; i++) {
      s += simulateRandomGame(m, rootGameTree.player);
    }
    return s;
  });
  var maxScore = Math.max.apply(null, scores);
  return rootGameTree.moves[scores.indexOf(maxScore)];
}

function simulateRandomGame(move, player) {
  var gt = force(move.gameTreePromise);
  while (gt.moves.length !== 0) {
    gt = force(gt.moves[random(gt.moves.length)].gameTreePromise);
  }
  return judge(gt.board) * (player === BLACK ? 1 : -1);
}
