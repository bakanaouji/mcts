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

var playerTable = {};

function makePlayer(playerType) {
  if (playerType === 'human') {
    return setupUIToSelectMove;
  } else {
    var ai = makeAI(playerType);
    return function (gameTree) {
      selectMoveByAI(gameTree, ai);
    };
  }
}

/**
 * 次の局面へ移動する
 */
function shiftToNewGameTree(gameTree) {
  // 盤面を描画する
  drawGameBoard(gameTree.board, gameTree.player, gameTree.moves);
  // UIを初期化
  resetUI();
  // ゲームが終了していたら，勝者を表示
  if (gameTree.moves.length === 0) {
    showWinner(gameTree.board);
    setupUIToReset();
  }
  // ゲームが終了していなかったら次の手の選択に移る
  else {
    playerTable[gameTree.player](gameTree);
  }
}

/**
 * ゲームを開始
 */
function startNewGame() {
  $('#preference-pane :input')
    .addClass('disabled')
    .attr('disabled', 'disabled');
  playerTable[BLACK] = makePlayer($('#black-player-type').val());

  playerTable[WHITE] = makePlayer($('#white-player-type').val());

  shiftToNewGameTree(makeInitialGameTree());
}