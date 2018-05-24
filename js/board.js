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
 * 盤面を描画する
 */
function drawGameBoard(board, player, moves) {
  // 盤面の情報をhtml形式に変換した文字列
  var htmlStyleFromBoard = [];
  var attackable = [];
  moves.forEach(function (m) {
    if (!m.isPassingMove)
      attackable[ix(m.x, m.y)] = true;
  });

  // tableタグを使って表現
  htmlStyleFromBoard.push('<table>');
  for (var y = -1; y < N; y++) {
    htmlStyleFromBoard.push('<tr>');
    for (var x = -1; x < N; x++) {
      if (0 <= y && 0 <= x) {
        htmlStyleFromBoard.push('<td class="');
        htmlStyleFromBoard.push('cell');
        htmlStyleFromBoard.push(' ');
        htmlStyleFromBoard.push(attackable[ix(x, y)] ? player : board[ix(x, y)]);
        htmlStyleFromBoard.push(' ');
        htmlStyleFromBoard.push(attackable[ix(x, y)] ? 'attackable' : '');
        htmlStyleFromBoard.push('" id="');
        htmlStyleFromBoard.push('cell_' + x + '_' + y);
        htmlStyleFromBoard.push('">');
        htmlStyleFromBoard.push('<span class="disc"></span>');
        htmlStyleFromBoard.push('</td>');
      } else if (0 <= x && y === -1) {
        htmlStyleFromBoard.push('<th>' + String.fromCharCode('a'.charCodeAt(0) + x) + '</th>');
      } else if (x === -1 && 0 <= y) {
        htmlStyleFromBoard.push('<th>' + (y + 1) + '</th>');
      } else /* if (x === -1 && y === -1) */ {
        htmlStyleFromBoard.push('<th></th>');
      }
    }
    htmlStyleFromBoard.push('</tr>');
  }
  htmlStyleFromBoard.push('</table>');

  // tableタグを使って表現
  $('#game-board').html(htmlStyleFromBoard.join(''));
  // tableタグを使って表現
  $('#current-player-name').text(player);
}
