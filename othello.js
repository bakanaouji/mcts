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
  function makeGameTree(board, player, wasPassed) {
    return {
      board: board,
      player: player,
      moves: listPossibleMoves(board, player, wasPassed)
    };
  }

  /**
   * 可能な行動のリストを取得
   */
  function listPossibleMoves(board, player, wasPassed) {
    return completePassingMove(
      listAttackingMoves(board, player),
      board,
      player,
      wasPassed
    );
  }

  /**
   * 必要であればパスする手を補完して取りうる行動を返す
   */
  function completePassingMove(attackingMoves, board, player, wasPassed) {
    // どこかしらに石を置けるならそのまま返す
    if (0 < attackingMoves.length) {
      return attackingMoves;
    }
    // 前に相手がパスしてなかったら，パスできる
    else if (!wasPassed) {
      return [{
        isPassingMove: true,
        gameTreePromise: delay(function () {
          return makeGameTree(board, nextPlayer(player), true);
        })
      }];
    }
    // 前に相手がパスしていたら，ゲーム終了
    else {
      return [];
    }
  }

  /**
   * 可能な行動のリストを取得
   */
  function listAttackingMoves(board, player) {
    var moves = [];

    // 石を置くことができる行動を列挙していく
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
                  false
                );
              });
            })(x, y, vulnerableCells)
          });
        }
      }
    }

    return moves;
  }

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
    var tokens = playerType.split('-');
    var aiType = tokens[0];
    var level = parseInt(tokens[1]);
    var extras = tokens.slice(2);
    return aiMakers[aiType]({
      level: level,
      extras: extras
    });
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




  // Public API {{{1

  othello.force = force;
  othello.delay = delay;
  othello.EMPTY = EMPTY;
  othello.WHITE = WHITE;
  othello.BLACK = BLACK;
  othello.nextPlayer = nextPlayer;
  othello.N = N;
  othello.ix = ix;
  othello.makeInitialGameBoard = makeInitialGameBoard;
  othello.judge = judge;
  othello.makeAI = makeAI;
  othello.makeInitialGameTree = makeInitialGameTree;
  othello.nameMove = nameMove;




  // }}}
})();
// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
