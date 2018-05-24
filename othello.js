var othello = {};

(function () {
  'use strict';

  // Utilities {{{1

  /**
   * 遅延評価
   */
  function delay(expressionAsFunction) {
    var result;
    var isEvaluated = false;

    return function () {
      if (!isEvaluated) {
        result = expressionAsFunction();
        isEvaluated = true;
      }
      return result;
    };
  }

  function force(promise) {
    return promise();
  }

  /**
   * 整数の乱数を生成
   */
  function random(n) {
    return Math.floor(Math.random() * n);
  }




  // Core logic {{{1

  var N = 8;

  var EMPTY = 'empty';
  var WHITE = 'white';
  var BLACK = 'black';

  /**
   * グリッド座標をインデックスへ変換
   */
  function ix(x, y) {
    return x + y * N;
  }

  /**
   * 盤面を初期化する
   */
  function makeInitialGameBoard() {
    // 盤面情報（empty，white，black）
    var board = [];

    // 盤面をすべてemptyに初期化
    for (var x = 0; x < N; x++)
      for (var y = 0; y < N; y++)
        board[ix(x, y)] = EMPTY;

    // 中心の4マスにwhiteとblackを配置
    var x2 = N >> 1;
    var y2 = N >> 1;
    board[ix(x2 - 1, y2 - 1)] = WHITE;
    board[ix(x2 - 1, y2 - 0)] = BLACK;
    board[ix(x2 - 0, y2 - 1)] = BLACK;
    board[ix(x2 - 0, y2 - 0)] = WHITE;

    return board;
  }

  /**
   * 初期のゲーム木を作成
   */
  function makeInitialGameTree() {
    return makeGameTree(makeInitialGameBoard(), BLACK, false, 1);
  }

  /**
   * ある盤面からのゲーム木を作成
   */
  function makeGameTree(board, player, wasPassed, nest) {
    return {
      board: board,
      player: player,
      moves: listPossibleMoves(board, player, wasPassed, nest)
    };
  }

  /**
   * 可能な行動のリストを取得
   */
  function listPossibleMoves(board, player, wasPassed, nest) {
    return completePassingMove(
      listAttackingMoves(board, player, nest),
      board,
      player,
      wasPassed,
      nest
    );
  }

  /**
   * 必要であればパスする手を補完して取りうる行動を返す
   */
  function completePassingMove(attackingMoves, board, player, wasPassed, nest) {
    // どこかしらに石を置けるならそのまま返す
    if (0 < attackingMoves.length) {
      return attackingMoves;
    }
    // 前に相手がパスしてなかったら，パスできる
    else if (!wasPassed) {
      return [{
        isPassingMove: true,
        gameTreePromise: delay(function () {
          return makeGameTree(board, nextPlayer(player), true, nest + 1);
        })
      }];
    }
    // 前に相手がパスしていたら，ゲーム終了
    else {
      return [];
    }
  }

  function listAttackingMovesN(board, player, nest) {
    var moves = [];

    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var vulnerableCells = listVulnerableCells(board, x, y, player);
        if (canAttack(vulnerableCells)) {
          moves.push({
            x: x,
            y: y,
            gameTreePromise: (function (x, y, vulnerableCells) {
              return delay(function () {
                return makeGameTree(
                  makeAttackedBoard(board, x, y, vulnerableCells, player),
                  nextPlayer(player),
                  false,
                  nest + 1
                );
              });
            })(x, y, vulnerableCells)
          });
        }
      }
    }

    return moves;
  }

  var listAttackingMoves = listAttackingMovesN;

  /**
   * 次の手番のプレイヤーを取得
   */
  function nextPlayer(player) {
    return player === BLACK ? WHITE : BLACK;
  }

  /**
   * 指定の位置に石を置くことができるかどうか
   */
  function canAttack(vulnerableCells) {
    return vulnerableCells.length;
  }

  /**
   * 指定の位置に石を置き，更新後の盤面を取得する
   */
  function makeAttackedBoard(board, x, y, vulnerableCells, player) {
    var newBoard = board.slice();
    newBoard[ix(x, y)] = player;
    // ひっくり返せる石をすべてひっくり返す
    for (var i = 0; i < vulnerableCells.length; i++)
      newBoard[vulnerableCells[i]] = player;
    return newBoard;
  }

  /**
   * 指定の位置に石を置いた時にひっくり返せる石のリストを取得
   */
  function listVulnerableCells(board, x, y, player) {
    var vulnerableCells = [];

    // すでに石が置いてあったら置くことはできないので，どこもひっくり返せない
    if (board[ix(x, y)] !== EMPTY)
      return vulnerableCells;

    var opponent = nextPlayer(player);
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        // 石を置く位置はチェックする必要なし
        if (dx === 0 && dy === 0)
          continue;
        // 上下左右斜め方向に自分の石が存在していたら，
        // その間にある石をひっくり返せる
        for (var i = 1; i < N; i++) {
          var nx = x + i * dx;
          var ny = y + i * dy;
          // 盤面からはみ出ていたらチェックできない
          if (nx < 0 || N <= nx || ny < 0 || N <= ny)
            break;
          // 自分の石が存在していたら，その間にある石をひっくり返せる石として追加
          var cell = board[ix(nx, ny)];
          if (cell === player && 2 <= i) {
            for (var j = 1; j < i; j++)
              vulnerableCells.push(ix(x + j * dx, y + j * dy));
            break;
          }
          // 相手の石が存在していなかったら，チェックできない
          if (cell !== opponent)
            break;
        }
      }
    }

    return vulnerableCells;
  }

  /**
   * 白黒どちらが勝ったかを判定
   */
  function judge(board) {
    var n = {};
    n[BLACK] = 0;
    n[WHITE] = 0;
    n[EMPTY] = 0;
    for (var i = 0; i < board.length; i++)
      n[board[i]]++;

    if (n[BLACK] > n[WHITE])
      return 1;
    if (n[BLACK] < n[WHITE])
      return -1;
    return 0;
  }

  /**
   * ボタンのラベルを決定
   */
  function nameMove(move) {
    if (move.isPassingMove)
      return 'Pass';
    else
      return 'abcdefgh'[move.x] + '12345678'[move.y];
  }




  // AI {{{1

  var aiMakers = {
    mcts: makeMonteCarloTreeSearchBasedAI,
    pmc: makePrimitiveMonteCarloBasedAI
  };

  function makeAI(playerType) {
    if (playerType in externalAITable) {
      return externalAITable[playerType];
    } else {
      var tokens = playerType.split('-');
      var aiType = tokens[0];
      var level = parseInt(tokens[1]);
      var extras = tokens.slice(2);
      var scorePosition = scorePositions[aiType];
      if (scorePosition !== undefined) {
        return makeScoreBasedAI({
          level: level,
          scorePosition: scorePosition
        });
      } else {
        return aiMakers[aiType]({
          level: level,
          extras: extras
        });
      }
    }
  }




  // AI: Weight table based + alpha-beta pruning {{{1

  function makeScorePositionWith(weightTable) {
    var wt = weightTable;
    return function (gameTree, player) {
      var board = gameTree.board;
      var opponent = nextPlayer(player);
      var ct = {};
      ct[player] = 1;
      ct[opponent] = -1;
      ct[EMPTY] = 0;
      var s = 0;
      for (var i = 0; i < board.length; i++)
        s += ct[board[i]] * wt[i];
      return s;
    };
  }

  var scorePositions = {
    simpleCount: makeScorePositionWith((function () {
      var t = [];
      for (var x = 0; x < N; x++)
        for (var y = 0; y < N; y++)
          t[ix(x, y)] = 1;
      return t;
    })()),
    basic: makeScorePositionWith((function () {
      var t = [];
      for (var x = 0; x < N; x++)
        for (var y = 0; y < N; y++)
          t[ix(x, y)] =
            (x === 0 || x === N - 1 ? 10 : 1) *
            (y === 0 || y === N - 1 ? 10 : 1);
      return t;
    })()),
    better: makeScorePositionWith((function () {
      var t = [];
      for (var x = 0; x < N; x++)
        for (var y = 0; y < N; y++)
          t[ix(x, y)] =
            (x === 0 || x === N - 1 ? 10 : 1) *
            (y === 0 || y === N - 1 ? 10 : 1);
      t[ix(0, 1)] = t[ix(0, N - 2)] = t[ix(N - 1, 1)] = t[ix(N - 1, N - 2)] =
        t[ix(1, 0)] = t[ix(N - 2, 0)] = t[ix(1, N - 1)] = t[ix(N - 2, N - 1)] = 0;
      return t;
    })()),
    edgesAndCorners: makeScorePositionWith((function () {
      var t = [];
      for (var x = 0; x < N; x++)
        for (var y = 0; y < N; y++)
          t[ix(x, y)] = 0;
      for (var x = 2; x < N - 2; x++) {
        t[ix(x, 0)] = 10;
        t[ix(x, N - 1)] = 10;
      }
      for (var y = 2; y < N - 2; y++) {
        t[ix(0, y)] = 10;
        t[ix(N - 1, y)] = 10;
      }
      t[ix(0, 1)] = t[ix(1, 0)] = t[ix(1, 1)] =
        t[ix(N - 1, 1)] = t[ix(N - 2, 0)] = t[ix(N - 2, 1)] =
        t[ix(1, N - 1)] = t[ix(0, N - 2)] = t[ix(1, N - 2)] =
        t[ix(N - 2, N - 1)] = t[ix(N - 1, N - 2)] = t[ix(N - 2, N - 2)] = -1;

      t[ix(0, 0)] = t[ix(0, N - 1)] =
        t[ix(N - 1, 0)] = t[ix(N - 1, N - 1)] = 100;
      return t;
    })()),
    moveCount: function (gameTree, player) {
      return gameTree.actualMoveCount * (gameTree.player == player ? 1 : -1);
    },
    moveCountAndPositions: function (gameTree, player) {
      return scorePositions.moveCount(gameTree, player) +
        scorePositions.edgesAndCorners(gameTree, player);
    }
  };

  function makeScoreBasedAI(config) {
    return {
      findTheBestMove: function (gameTree) {
        var ratings = calculateMaxRatings(
          limitGameTreeWithFeasibleDepth(gameTree, config.level),
          gameTree.player,
          Number.MIN_VALUE,
          Number.MAX_VALUE,
          config.scorePosition
        );
        var maxRating = Math.max.apply(null, ratings);
        return gameTree.moves[ratings.indexOf(maxRating)];
      }
    };
  }

  function limitGameTreeWithFeasibleDepth(gameTree, maxBoards) {
    return limitGameTreeDepth(
      gameTree,
      estimateFeasibleDepth(gameTree, maxBoards)
    );
  }

  function estimateFeasibleDepth(gameTree, maxBoards) {
    var oldApproxBoards = 1;
    var newApproxBoards = 1;
    var depth = 0;
    while (newApproxBoards <= maxBoards && 1 <= gameTree.moves.length) {
      oldApproxBoards = newApproxBoards;
      newApproxBoards *= gameTree.moves.length;
      depth += 1;
      gameTree = force(gameTree.moves[0].gameTreePromise);
    }
    var oldDiff = oldApproxBoards - maxBoards;
    var newDiff = newApproxBoards - maxBoards;
    return Math.abs(newDiff) - Math.abs(oldDiff) <= 0 ? depth : depth - 1;
  }

  function limitGameTreeDepth(gameTree, depth) {
    return {
      board: gameTree.board,
      player: gameTree.player,
      moves: depth === 0 ? [] : gameTree.moves.map(function (m) {
        return {
          isPassingMove: m.isPassingMove,
          x: m.x,
          y: m.y,
          gameTreePromise: delay(function () {
            return limitGameTreeDepth(force(m.gameTreePromise), depth - 1);
          })
        };
      }),
      actualMoveCount: gameTree.moves.length
    };
  }

  function ratePosition(gameTree, player, scorePosition) {
    if (1 <= gameTree.moves.length) {
      var choose = gameTree.player === player ? Math.max : Math.min;
      return choose.apply(null, calculateRatings(gameTree, player, scorePosition));
    } else {
      return scorePosition(gameTree, player);
    }
  }

  function calculateRatings(gameTree, player, scorePosition) {
    return gameTree.moves.map(function (m) {
      return ratePosition(force(m.gameTreePromise), player, scorePosition);
    });
  }

  function ratePositionWithAlphaBetaPruning(gameTree, player, lowerLimit, upperLimit, scorePosition) {
    if (1 <= gameTree.moves.length) {
      var judge =
        gameTree.player === player ?
          Math.max :
          Math.min;
      var rate =
        gameTree.player === player ?
          calculateMaxRatings :
          calculateMinRatings;
      return judge.apply(null, rate(gameTree, player, lowerLimit, upperLimit, scorePosition));
    } else {
      return scorePosition(gameTree, player);
    }
  }

  function calculateMaxRatings(gameTree, player, lowerLimit, upperLimit, scorePosition) {
    var ratings = [];
    var newLowerLimit = lowerLimit;
    for (var i = 0; i < gameTree.moves.length; i++) {
      var r = ratePositionWithAlphaBetaPruning(
        force(gameTree.moves[i].gameTreePromise),
        player,
        newLowerLimit,
        upperLimit,
        scorePosition
      );
      ratings.push(r);
      if (upperLimit <= r)
        break;
      newLowerLimit = Math.max(r, newLowerLimit);
    }
    return ratings;
  }

  function calculateMinRatings(gameTree, player, lowerLimit, upperLimit, scorePosition) {
    var ratings = [];
    var newUpperLimit = upperLimit;
    for (var i = 0; i < gameTree.moves.length; i++) {
      var r = ratePositionWithAlphaBetaPruning(
        force(gameTree.moves[i].gameTreePromise),
        player,
        upperLimit,
        newUpperLimit,
        scorePosition
      );
      ratings.push(r);
      if (r <= lowerLimit)
        break;
      newUpperLimit = Math.min(r, newUpperLimit);
    }
    return ratings;
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

      while (node.untriedMoves.length === 0 && node.childNodes.length !== 0)
        node = node.selectChild();

      if (node.untriedMoves.length !== 0)
        node = node.expandChild();

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
    for (var node = this; node !== null; node = node.parentNode)
      node.update(result);
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
    for (i = 0; i < indent; i++)
      ss.push('| ');
    ss.push('W='); ss.push(this.wins);
    ss.push('/');
    ss.push('V='); ss.push(this.visits);
    ss.push('/');
    ss.push('U='); ss.push(this.untriedMoves.length);
    for (i = 0; i < this.childNodes.length; i++)
      ss.push(this.childNodes[i].visualize(indent + 1));
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
      for (var i = 0; i < eachTries; i++)
        s += simulateRandomGame(m, rootGameTree.player);
      return s;
    });
    var maxScore = Math.max.apply(null, scores);
    return rootGameTree.moves[scores.indexOf(maxScore)];
  }

  function simulateRandomGame(move, player) {
    var gt = force(move.gameTreePromise);
    while (gt.moves.length !== 0)
      gt = force(gt.moves[random(gt.moves.length)].gameTreePromise);
    return judge(gt.board) * (player === BLACK ? 1 : -1);
  }




  // API {{{1

  var externalAITable = {};

  var lastAIType;

  function registerAI(ai) {
    externalAITable[lastAIType] = ai;
  }


  function addNewAI() {
    var aiUrl = $('#new-ai-url').val();
    var originalLabel = $('#add-new-ai-button').text();
    if (externalAITable[aiUrl] === undefined) {
      lastAIType = aiUrl;
      $('#add-new-ai-button').text('Loading...').prop('disabled', true);
      $.getScript(aiUrl, function () {
        $('#black-player-type, #white-player-type').append(
          '<option value="' + aiUrl + '">' + aiUrl + '</option>'
        );
        $('#white-player-type').val(aiUrl).change();
        $('#add-new-ai-button').text(originalLabel).removeProp('disabled');
      });
    } else {
      $('#add-new-ai-button').text('Already loaded').prop('disabled', true);
      setTimeout(
        function () {
          $('#add-new-ai-button').text(originalLabel).removeProp('disabled');
        },
        1000
      );
    }
  }




  // Public API {{{1

  othello.force = force;
  othello.delay = delay;
  othello.EMPTY = EMPTY;
  othello.WHITE = WHITE;
  othello.BLACK = BLACK;
  othello.nextPlayer = nextPlayer;
  othello.registerAI = registerAI;
  othello.N = N;
  othello.ix = ix;
  othello.makeInitialGameBoard = makeInitialGameBoard;
  othello.judge = judge;
  othello.addNewAI = addNewAI;
  othello.makeAI = makeAI;
  othello.makeInitialGameTree = makeInitialGameTree;
  othello.nameMove = nameMove;




  // }}}
})();
// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
