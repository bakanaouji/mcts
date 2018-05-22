var N = 8;

var EMPTY = 'empty';
var WHITE = 'white';
var BLACK = 'black';

/**
 * 盤面を初期化する
 */
function makeInitialGameBoard() {
  // 盤面情報（empty、white、black）
  var board = {};

  // 盤面をすべてemptyに初期化
  for (var x = 0; x < N; x++)
    for (var y = 0; y < N; y++)
      board[[x, y]] = EMPTY;

  // 中心の4マスにwhiteとblackを配置
  var centerX = Math.floor(N / 2);
  var centerY = Math.floor(N / 2);
  board[[centerX - 1, centerY - 1]] = WHITE;
  board[[centerX - 1, centerY - 0]] = BLACK;
  board[[centerX - 0, centerY - 1]] = BLACK;
  board[[centerX - 0, centerY - 0]] = WHITE;

  return board;
}

/**
 * 盤面を描画する
 */
function drawGameBoard(board, player) {
  // 盤面の情報をhtml形式に変換した文字列
  var htmlStyleFromBoard = [];

  // tableタグを使って表現
  htmlStyleFromBoard.push('<table>');
  for (var y = -1; y < N; y++) {
    htmlStyleFromBoard.push('<tr>');
    for (var x = -1; x < N; x++) {
      if (0 <= y && 0 <= x) {
        htmlStyleFromBoard.push('<td class="');
        htmlStyleFromBoard.push('cell');
        htmlStyleFromBoard.push(' ');
        htmlStyleFromBoard.push(board[[x, y]]);
        htmlStyleFromBoard.push('">');
        htmlStyleFromBoard.push('<span class="disc"></span>');
        htmlStyleFromBoard.push('</td>');
      } else if (0 <= x && y == -1) {
        htmlStyleFromBoard.push('<th>' + 'abcdefgh'[x] + '</th>');
      } else if (x == -1 && 0 <= y) {
        htmlStyleFromBoard.push('<th>' + '12345678'[y] + '</th>');
      } else /* if (x == -1 && y == -1) */ {
        htmlStyleFromBoard.push('<th></th>');
      }
    }
    htmlStyleFromBoard.push('</tr>');
  }
  htmlStyleFromBoard.push('</table>');

  // #game-boardに差し込む
  $('#game-board').html(htmlStyleFromBoard.join(''));
  // 現在のプレイヤーを表示
  $('#current-player-name').text(player);
}