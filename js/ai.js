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

/**
 * モンテカルロ木探索によって行動を選択
 */
function tryMonteCarloTreeSearch(rootGameTree, maxTries) {
  // 根ノード
  var root = new Node(rootGameTree, null, null);

  // 一定回数分，プレイアウトを実行
  for (var i = 0; i < maxTries; i++) {
    var node = root;

    // 展開していない行動があるか，
    // 葉ノードに到達するまで，ノードをたどっていく
    while (node.untriedMoves.length === 0 && node.childNodes.length !== 0) {
      node = node.selectChild();
    }

    // 展開していない行動がある場合，ノードを展開する
    // if (node.untriedMoves.length !== 0) {
    //   node = node.expandChild();
    // }

    // ランダムにプレイアウトを実行
    var won = node.simulate(rootGameTree.player);

    // back propagationで各ノードを評価
    node.backpropagate(won);

    // ノードに一定回数以上到達した場合，ノードを展開する
    if (node.visits >= 40) {
      while (node.untriedMoves.length !== 0) {
        node.expandChild();
      }
    }
  }

  var vs = root.childNodes.map(function (n) { return n.visits; });
  return root.childNodes[vs.indexOf(Math.max.apply(null, vs))].move;
}

/**
 * ノードを表すクラス
 */
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
 * UCB戦略に従ってノードを選択
 */
Node.prototype.selectChild = function () {
  var totalVisits = this.visits;
  var values = this.childNodes.map(function (n) {
    if (n.visits === 0) {
      return 10e10;
    } else {
      return n.wins / n.visits +
        Math.sqrt(2 * Math.log(totalVisits) / n.visits);
    }
  });
  return this.childNodes[values.indexOf(Math.max.apply(null, values))];
};

/**
 * ノードを展開
 */
Node.prototype.expandChild = function () {
  // 展開していない行動のなかからランダムに選択
  var i = random(this.untriedMoves.length);
  var move = this.untriedMoves.splice(i, 1)[0];
  // ノードを生成して子ノードとして追加
  var child = new Node(force(move.gameTreePromise), this, move);
  this.childNodes.push(child);
  return child;
};

/**
 * プレイアウト
 */
Node.prototype.simulate = function (player) {
  var gameTree = this.gameTree;
  // ランダムに行動を選択してゲーム終了まで進める
  while (gameTree.moves.length !== 0) {
    var i = random(gameTree.moves.length);
    gameTree = force(gameTree.moves[i].gameTreePromise);
  }
  // 勝敗を評価
  return judge(gameTree.board) * (player === BLACK ? 1 : -1) / 2 + 0.5;
};

/**
 * back propagationで各ノードを評価
 */
Node.prototype.backpropagate = function (result) {
  for (var node = this; node !== null; node = node.parentNode) {
    node.update(result);
  }
};

/**
 * ノードの評価を更新
 */
Node.prototype.update = function (won) {
  this.wins += won;
  this.visits += 1;
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
