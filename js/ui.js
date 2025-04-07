/**
 * ボタンのラベルを決定
 */
function makeLabelForMove(move) {
  if (move.isPassingMove) {
    return 'Pass';
  }
  else {
    return 'abcdefgh'[move.x] + '12345678'[move.y];
  }
}

/**
 * 石の数を更新
 */
function updateStoneCounts(board) {
  let blackCount = 0;
  let whiteCount = 0;
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[ix(x, y)] === BLACK) blackCount++;
      else if (board[ix(x, y)] === WHITE) whiteCount++;
    }
  }
  
  $('#black-count .count').text(blackCount);
  $('#white-count .count').text(whiteCount);
}

/**
 * UIをリセット
 */
function resetUI() {
  $('#console').empty();
  $('#message').empty();
}

/**
 * 選択できる行動を表示
 */
function setupUIToSelectMove(gameTree) {
  $('#message').text('Select your move.');
  updateStoneCounts(gameTree.board);
  gameTree.moves.forEach(function (m, i) {
    if (m.isPassingMove) {
      $('#console').append(
        $('<input type="button" class="btn">')
          .val(makeLabelForMove(m))
          .click(function () {
            shiftToNewGameTree(force(m.gameTreePromise));
          })
      );
    } else {
      $('#cell_' + m.x + '_' + m.y)
        .click(function () {
          shiftToNewGameTree(force(m.gameTreePromise));
        });
    }
  });
}

/**
 * 新しくゲームを始めるためのボタンを表示
 */
function setupUIToReset() {
  $('#preference-pane :input')
    .removeClass('disabled')
    .removeAttr('disabled');
}

/**
 * 結果を表示
 */
function showWinner(board) {
  var r = judge(board);
  $('#message').text(
    r === 0 ?
      'The game ends in a draw.' :
      'The winner is ' + (r === 1 ? BLACK : WHITE) + '.'
  );
  updateStoneCounts(board);
}
