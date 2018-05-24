// Core logic {{{1

var N = 8;

var EMPTY = 'empty';
var WHITE = 'white';
var BLACK = 'black';

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
 * 可能な行動のリストを取得
 */
function possibleMoveList(board, player, wasPassed) {
  var moves = [];

  // 石を置くことができる行動を列挙していく
  for (var y = 0; y < N; y++) {
    for (var x = 0; x < N; x++) {
      var turnableCells = turnableCellList(board, x, y, player);
      if (canAttack(turnableCells)) {
        moves.push({
          x: x,
          y: y,
          gameTreePromise: (function (x, y, turnableCells) {
            return delay(function () {
              return makeGameTree(
                makeNextBoard(board, x, y, turnableCells, player),
                nextPlayer(player),
                false
              );
            });
          })(x, y, turnableCells)
        });
      }
    }
  }

  // 必要であればパスする手も加えて返す
  return completePassingMove(
    moves,
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
 * 次の手番のプレイヤーを取得
 */
function nextPlayer(player) {
  return player === BLACK ? WHITE : BLACK;
}

/**
 * 指定の位置に石を置くことができるかどうか
 */
function canAttack(turnableCells) {
  return turnableCells.length;
}

/**
 * 指定の位置に石を置き，更新後の盤面を取得する
 */
function makeNextBoard(board, x, y, turnableCells, player) {
  var newBoard = board.slice();
  newBoard[ix(x, y)] = player;
  // ひっくり返せる石をすべてひっくり返す
  for (var i = 0; i < turnableCells.length; i++)
    newBoard[turnableCells[i]] = player;
  return newBoard;
}

/**
 * 指定の位置に石を置いた時にひっくり返せる石のリストを取得
 */
function turnableCellList(board, x, y, player) {
  var turnableCells = [];

  // すでに石が置いてあったら置くことはできないので，どこもひっくり返せない
  if (board[ix(x, y)] !== EMPTY)
    return turnableCells;

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
            turnableCells.push(ix(x + j * dx, y + j * dy));
          break;
        }
        // 相手の石が存在していなかったら，チェックできない
        if (cell !== opponent)
          break;
      }
    }
  }

  return turnableCells;
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