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
